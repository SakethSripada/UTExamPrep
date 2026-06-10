import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import type { JavaTools } from "./types";

const execFileAsync = promisify(execFile);

const TIMEOUT_MS = 2500;
export const MAX_BUFFER = 128 * 1024;
export async function runCommand(command: string, args: string[], cwd: string) {
  try {
    const result = await execFileAsync(command, args, {
      cwd,
      timeout: TIMEOUT_MS,
      maxBuffer: MAX_BUFFER,
      env: {
        ...process.env,
        PATH: process.env.PATH ?? "",
        NODE_ENV: process.env.NODE_ENV,
      },
      windowsHide: true,
    });
    return { ok: true, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const err = error as {
      stdout?: string;
      stderr?: string;
      killed?: boolean;
      signal?: string;
      code?: number;
      message?: string;
    };
    return {
      ok: false,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? err.message ?? "",
      timedOut: err.killed || err.signal === "SIGTERM",
      code: err.code,
    };
  }
}

async function firstExecutableOnPath(command: string) {
  const lookupCommand = process.platform === "win32" ? "where.exe" : "which";
  const lookup = await runCommand(lookupCommand, [command], process.cwd());
  if (!lookup.ok) {
    return command;
  }

  return lookup.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? command;
}

function companionJavaForJavac(javac: string) {
  if (!path.isAbsolute(javac)) {
    return "java";
  }

  return path.join(path.dirname(javac), process.platform === "win32" ? "java.exe" : "java");
}

function versionText(stdout: string, stderr: string) {
  return (stderr || stdout).trim();
}

export async function resolveJavaTools(): Promise<JavaTools> {
  const javac = await firstExecutableOnPath("javac");
  const javacCheck = await runCommand(javac, ["-version"], process.cwd());
  if (!javacCheck.ok) {
    return {
      available: false,
      message: "Local Java was not found. Install a JDK to enable Java test execution.",
      stderr: javacCheck.stderr,
    };
  }

  const java = companionJavaForJavac(javac);
  const javaCheck = await runCommand(java, ["-version"], process.cwd());
  if (!javaCheck.ok) {
    return {
      available: false,
      message: `Found ${versionText(javacCheck.stdout, javacCheck.stderr)}, but could not run Java from the same JDK.`,
      stderr: javaCheck.stderr,
    };
  }

  return {
    available: true,
    javac,
    java,
    javacVersion: versionText(javacCheck.stdout, javacCheck.stderr),
    javaVersion: versionText(javaCheck.stdout, javaCheck.stderr).split(/\r?\n/)[0] ?? "",
  };
}

