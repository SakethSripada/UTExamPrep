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
      headers: { "Content-Type": "application/json" },
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
