# Java Runner — Overview

## What this is

A small standalone HTTP service that compiles and runs **untrusted user-submitted Java code** inside a locked-down sandbox, then reports back whether the code passed a set of per-question tests. It is the execution backend for the Digital Exams site.

This service lives in `runner/` and deploys **separately** from the main app.

## Why it exists (the core constraint)

The main site is a Next.js app deployed to **Vercel**. Vercel's serverless runtime cannot run Java, cannot run Docker, and cannot host long-lived sandboxed processes. So code execution has to happen somewhere else.

This service is that "somewhere else": a containerized runner on compute that *can* execute code safely. The Vercel app talks to it over HTTP.

```
Next.js (Vercel)  ──HTTP──▶  Java Runner (this service)  ──▶  sandboxed compile + run
   /api/java/run  ◀──JSON──         (separate host)
```

The existing `app/api/java/run/route.ts` currently shells out to a local JDK directly. That only works on a developer laptop. Once this runner exists, that route becomes a **thin proxy** that forwards requests here and returns the response unchanged — the frontend should not need to change.

## Goals

1. **Run untrusted Java safely.** Assume every submission is hostile. Malicious code must not be able to read host files, reach the network, exhaust resources, or escape the sandbox.
2. **Stay cheap.** Target deployment is scale-to-zero (or a tiny always-on box). No expensive always-on compute. Cost should be near-zero at low traffic.
3. **Be a drop-in for the current behavior.** Same request shape in, same response shape out, so the existing site keeps working with only the proxy change.
4. **Be self-contained and portable.** A single container that runs anywhere (Fly.io is the leading target, but it shouldn't be locked to one host).

## What it does, per request

1. Receive a request identifying a question and carrying the user's Java code.
2. Build the test harness for that question (the wrapper/test-runner files that exercise the user's code and report a pass/fail count).
3. Compile and run everything inside the sandbox under strict limits.
4. Return a result: whether it compiled, whether tests passed, how many passed out of how many, plus captured stdout/stderr (bounded in size).

## Security posture (intent, not implementation)

Defense in depth — no single layer is trusted on its own:

- Treat the container as a boundary that **can** be escaped, and harden accordingly rather than relying on "it's in Docker."
- Untrusted code runs as a **non-root** user with **no network access** and a **read-only filesystem** (only a small scratch space to compile into).
- Hard ceilings on **memory, CPU, process count, output size, and wall-clock time**; anything that exceeds them is killed.
- Kernel/privilege surface is minimized (drop capabilities, no privilege escalation, syscall filtering).
- Prefer host-level isolation (per-request micro-VM or a userspace kernel) as the outer layer where available.
- Killing a runaway submission must reliably terminate the **entire** process tree it spawned, not just the first process.

## Contract with the main app

The request/response JSON shape must stay compatible with what the Next.js route and frontend already expect (see `app/api/java/run/route.ts` and `app/api/java/run/types.ts` for the current shape). Keep the response fields aligned so the site doesn't have to change beyond pointing at this service.

## What's intentionally left open

The implementing model decides the concrete choices: language/framework for the HTTP service, exact sandboxing mechanism and flags, container base image, how the per-question harnesses are represented and ported over from the existing `app/api/java/run/harness.ts`, the deploy config, and how the service authenticates requests from the Vercel app. The harness logic currently in the Next.js route should become the single source of truth here.

## Repo layout

- `runner/` — this service (deploys to the execution host).
- `app/` — the Next.js site (stays on Vercel); its Java route becomes a proxy to this service.
- Keep `runner/` out of the Vercel deploy bundle.
