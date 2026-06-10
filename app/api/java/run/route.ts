import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildHarness } from "./harness";
import { MAX_BUFFER, resolveJavaTools, runCommand } from "./java-tools";
import type { JavaRunRequest } from "./types";

export const runtime = "nodejs";

const MAX_CODE_LENGTH = 20_000;

function parseResult(stdout: string) {
  const match = stdout.match(/RESULT\s+(\d+)\/(\d+)/);
  if (!match) {
    return {};
  }
  return {
    passed: Number(match[1]),
    total: Number(match[2]),
  };
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const tools = await resolveJavaTools();
  return json({
    available: tools.available,
    message: tools.available
      ? `Local Java detected: ${tools.javacVersion}; runtime: ${tools.javaVersion}`
      : tools.message,
  });
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
    return json({ ok: false, phase: "request", message: "Code is too large to run locally." }, 413);
  }

  const harness = buildHarness(questionId, code);
  if (!harness) {
    return json({ ok: false, phase: "unsupported", message: "No local Java tests are available for this question." }, 404);
  }

  const tools = await resolveJavaTools();
  if (!tools.available) {
    return json({
      ok: false,
      phase: "java",
      message: tools.message,
      stderr: tools.stderr,
    });
  }

  const dir = await mkdtemp(path.join(tmpdir(), "digitalexams-java-"));
  try {
    await Promise.all(
      Object.entries(harness.files).map(([file, content]) => writeFile(path.join(dir, file), content, "utf8")),
    );

    const compile = await runCommand(tools.javac, Object.keys(harness.files), dir);
    if (!compile.ok) {
      return json({
        ok: false,
        phase: "compile",
        message: compile.timedOut ? "Compilation timed out." : "Compilation failed.",
        stdout: compile.stdout.slice(0, MAX_BUFFER),
        stderr: compile.stderr.slice(0, MAX_BUFFER),
      });
    }

    const run = await runCommand(tools.java, ["TestRunner"], dir);
    const parsed = parseResult(run.stdout);
    return json({
      ok: run.ok,
      phase: "test",
      message: run.timedOut ? "Execution timed out." : run.ok ? "All local tests passed." : "Some local tests failed.",
      stdout: run.stdout.slice(0, MAX_BUFFER),
      stderr: run.stderr.slice(0, MAX_BUFFER),
      ...parsed,
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
