import type { JavaRunRequest } from "./types";

// This route is a thin proxy in front of the standalone Java runner service
// (see runner/). The runner compiles and executes untrusted submissions in a
// sandbox; Vercel's serverless runtime cannot do that itself. The request and
// response shapes are passed through unchanged so the frontend is unaware of
// the hop.
//
// Configure with two environment variables:
//   JAVA_RUNNER_URL   base URL of the runner, e.g. https://...fly.dev
//   JAVA_RUNNER_TOKEN bearer token; must match the runner's RUNNER_AUTH_TOKEN

export const runtime = "nodejs";

const MAX_CODE_LENGTH = 20_000;
// Generous upper bound; the runner enforces its own per-phase timeouts well
// under this. Guards against a hung or unreachable runner holding the request.
const PROXY_TIMEOUT_MS = 30_000;

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function runnerConfig() {
  const base = process.env.JAVA_RUNNER_URL?.trim().replace(/\/+$/, "");
  return { base, token: process.env.JAVA_RUNNER_TOKEN?.trim() };
}

// The runner rate-limits and counts usage per anonymous device and per client
// IP. Forward both so it sees the real browser, not this proxy. The runner
// only trusts these headers because the request also carries the auth token.
function clientHeaders(request: Request): Record<string, string> {
  const out: Record<string, string> = {};
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0].trim() || request.headers.get("x-real-ip")?.trim();
  if (ip) {
    out["X-Client-IP"] = ip;
  }
  const device = request.headers.get("x-device-id")?.trim();
  if (device) {
    out["X-Device-Id"] = device.slice(0, 64);
  }
  return out;
}

// Reject obvious cross-site abuse: if an Origin header is present it must match
// the request host. Same-origin browser requests (and same-origin fetches that
// omit Origin) pass, so real users are never blocked.
function crossOriginBlocked(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }
  const host = request.headers.get("host");
  try {
    return Boolean(host) && new URL(origin).host !== host;
  } catch {
    return true;
  }
}

async function forward(path: string, init: RequestInit) {
  const { base, token } = runnerConfig();
  if (!base) {
    return null;
  }
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return { status: response.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const { base } = runnerConfig();
  if (!base) {
    return json({
      available: false,
      message: "The Java runner is not configured. Set JAVA_RUNNER_URL to enable test execution.",
    });
  }
  try {
    const result = await forward("/api/run", { method: "GET" });
    if (!result) {
      return json({ available: false, message: "The Java runner is not configured." });
    }
    return json(result.data, result.status);
  } catch {
    return json({ available: false, message: "The Java runner could not be reached." });
  }
}

export async function POST(request: Request) {
  if (crossOriginBlocked(request)) {
    return json({ ok: false, phase: "forbidden", message: "Cross-origin requests are not allowed." }, 403);
  }

  const headers = clientHeaders(request);

  let body: JavaRunRequest;
  try {
    body = (await request.json()) as JavaRunRequest;
  } catch {
    return json({ ok: false, phase: "request", message: "Invalid JSON request." }, 400);
  }

  const questionId = body.questionId;
  const code = body.code ?? "";
  if (!questionId || !code.trim()) {
    return json({ ok: false, phase: "request", message: "Missing question id or Java code." }, 400);
  }
  if (code.length > MAX_CODE_LENGTH) {
    return json({ ok: false, phase: "request", message: "Code is too large to run." }, 413);
  }

  const { base } = runnerConfig();
  if (!base) {
    return json({
      ok: false,
      phase: "java",
      message: "The Java runner is not configured. Set JAVA_RUNNER_URL to enable test execution.",
    });
  }

  try {
    const result = await forward("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ questionId, code }),
    });
    if (!result) {
      return json({ ok: false, phase: "java", message: "The Java runner is not configured." });
    }
    return json(result.data, result.status);
  } catch {
    return json({ ok: false, phase: "java", message: "The Java runner could not be reached." });
  }
}
