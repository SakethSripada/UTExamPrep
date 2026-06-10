# Java Runner

A standalone HTTP service that compiles and runs **untrusted user-submitted
Java** inside a locked-down sandbox and reports per-question pass/fail counts.
It is the execution backend for the Digital Exams site: Vercel's serverless
runtime can't run Java or hold sandboxed processes, so `app/api/java/run`
proxies here.

```
Next.js (Vercel)  ──HTTP──▶  Java Runner (this service)  ──▶  bubblewrap → javac/java
   /api/java/run  ◀──JSON──         (Fly.io machine)
```

## API

All responses are JSON with `Cache-Control: no-store`.

| Method & path | Purpose |
| --- | --- |
| `GET /healthz` | Liveness probe (no auth). |
| `GET /api/run` | Runner/JDK status: `{ available, message, sandbox }`. |
| `POST /api/run` | Run tests. Body `{ questionId, code }`. |
| `GET /metrics` | Usage counts (see [Usage metrics](#usage-metrics)). |

`POST` returns the shape the frontend already expects:

```jsonc
{
  "ok": true,            // true only on a clean, complete, all-tests-pass run
  "phase": "test",       // request | unsupported | java | compile | test | busy | internal | auth
  "message": "All tests passed.",
  "stdout": "...",        // captured, capped at 128 KiB
  "stderr": "...",
  "passed": 6,
  "total": 6
}
```

When `RUNNER_AUTH_TOKEN` is set, `/api/run` requires
`Authorization: Bearer <token>`.

## Security model

Defense in depth — no single layer is trusted:

- **Platform (outer).** Each Fly Machine is a Firecracker microVM with its own
  kernel. That is the boundary we assume *can* be escaped and harden beneath.
- **bubblewrap (per request).** Every submission runs in fresh user, pid, net,
  ipc, uts, and cgroup namespaces with `--unshare-all`. No network. Filesystem
  is a read-only bind of `/usr` (+ the JDK) plus a private `tmpfs /tmp`; the
  work directory is bound **read-only** for the run phase. The environment is
  cleared, so the service's auth token never reaches user code.
- **rlimits (`prlimit`).** Caps on process count, open files, file size, core
  dumps, and CPU time.
- **JVM + process limits.** `-Xmx128m`, capped metaspace, serial GC, headless.
  Wall-clock timeouts per phase; output capped (hard-killed past 4 MiB).
- **Reliable kill.** Each run is its own process group launched as pid 1 of a
  pid namespace, so a single `SIGKILL` to the group reaps the entire tree —
  fork bombs included. `tini` reaps any stragglers.
- Untrusted code always runs as a **non-root** service account, never as the
  container root.

Grading integrity: the pass count is read from the **last** `RESULT n/m` line
TestRunner prints, and `ok` additionally requires a clean exit with
`passed == total > 0`. A submission that prints a fake `RESULT` line or calls
`System.exit(0)` early cannot fake a pass.

## Abuse prevention

The service is built to run **anonymously, without login**, so it layers
cheap, NAT-friendly controls instead of an account wall:

- **Three-tier rate limiting** (token buckets, enforced in the runner where
  counting is reliable):
  - *Per anonymous device* — the primary, fair per-user limit, keyed by a
    random id the browser stores in `localStorage`. Because it is per device,
    a whole class sharing one campus IP is **not** throttled together.
  - *Per IP* — a looser backstop so a single source spraying random device ids
    cannot overwhelm the box. Defaults are generous enough for a shared
    university NAT; raise them with the env vars below if needed.
  - *Global* — an absolute ceiling on total throughput.
  Exceeding a limit returns `429` with `phase: "rate_limited"`, a friendly
  message, and a `Retry-After` header. A normal student iterating on code
  never approaches these; a script does immediately.
- **Bounded concurrency + queue** — only N runs execute at once; waiters give
  up after a timeout with `phase: "busy"`, so a burst degrades gracefully
  instead of toppling the machine.
- **Per-request hard caps** — code size, request body size, compile/run
  wall-clock, output size, memory, CPU, and process count are all bounded
  (see Security model).
- **Cross-origin guard** (at the Next.js proxy) — a request whose `Origin`
  doesn't match the site host is rejected, blocking trivial cross-site abuse
  without affecting real same-origin users.
- **Trusted forwarding** — the proxy passes the real client IP and device id to
  the runner; the runner only trusts those headers because the request also
  carries the shared auth token, so anonymous callers can't spoof them.

For DDoS/bot protection beyond this, put the **site** behind Cloudflare's free
tier — it complements these app-level limits at the edge with no user friction.

## Usage metrics

`GET /metrics` (auth required) returns rough, login-free usage numbers:

```json
{ "day": "2026-06-10", "runsToday": 412, "runsAllTime": 9123,
  "uniqueDevicesToday": 87, "uniqueIpsToday": 63 }
```

Unique counts are per-device (more accurate than IP, since NAT collapses many
students to one IP) and reset at UTC midnight. They are approximate under very
heavy traffic (the unique sets are memory-capped) — treat them as a floor and
a trend, not an exact headcount. Per-run log lines also include a short
`client=` tag for eyeballing activity. For richer visitor analytics, enable
Vercel Web Analytics on the site itself.

`SANDBOX_MODE`:

- `bwrap` — require the full sandbox; refuse to start if it can't initialize.
  **Use this in production.**
- `auto` (default) — use bubblewrap if the probe succeeds, otherwise log a
  warning and fall back to unsandboxed execution. Convenient for local dev.
- `none` — no isolation. Local development only; never for untrusted traffic.

## Configuration

| Env var | Default | Meaning |
| --- | --- | --- |
| `PORT` | `8080` | Listen port. |
| `SANDBOX_MODE` | `auto` | `bwrap` \| `auto` \| `none`. |
| `RUNNER_AUTH_TOKEN` | _(empty)_ | Bearer token; empty disables auth. |
| `RUNNER_WORK_DIR` | OS temp | Parent dir for per-request scratch. |
| `RUNNER_MAX_CONCURRENCY` | CPU count | Max simultaneous runs. |
| `RUNNER_COMPILE_TIMEOUT_MS` | `20000` | Compile wall-clock limit. |
| `RUNNER_RUN_TIMEOUT_MS` | `8000` | Test-run wall-clock limit. |
| `RUNNER_QUEUE_TIMEOUT_MS` | `10000` | Max wait for a concurrency slot. |
| `RUNNER_RATE_DEVICE_PER_MIN` | `30` | Per-device runs/min (sustained). |
| `RUNNER_RATE_DEVICE_BURST` | `15` | Per-device burst allowance. |
| `RUNNER_RATE_IP_PER_MIN` | `240` | Per-IP runs/min (loose, NAT-friendly). |
| `RUNNER_RATE_IP_BURST` | `80` | Per-IP burst allowance. |
| `RUNNER_RATE_GLOBAL_PER_MIN` | `600` | Global runs/min ceiling. |
| `RUNNER_RATE_GLOBAL_BURST` | `150` | Global burst allowance. |
| `RUNNER_RATE_MAX_KEYS` | `100000` | Max tracked rate-limit keys (memory cap). |
| `JAVA_HOME` | autodetected | JDK location. |

## Run it

### Docker (recommended; matches production)

```bash
cd runner
docker build -t digitalexams-runner .
docker run --rm -p 8080:8080 \
  -e RUNNER_AUTH_TOKEN=devtoken \
  digitalexams-runner
```

bubblewrap needs unprivileged user namespaces. Docker's default seccomp
profile usually permits them; if the startup log shows the bwrap probe
failing, grant them explicitly:

```bash
docker run --rm -p 8080:8080 \
  --security-opt seccomp=unconfined --security-opt apparmor=unconfined \
  -e RUNNER_AUTH_TOKEN=devtoken \
  digitalexams-runner
```

Smoke test:

```bash
curl -s localhost:8080/api/run -H 'Authorization: Bearer devtoken' | jq
curl -s localhost:8080/api/run -H 'Authorization: Bearer devtoken' \
  -H 'Content-Type: application/json' \
  -d '{"questionId":"e1-q5","code":"public static int[] copyWithoutRange(int[] vals, int start, int stop){int[] r=new int[vals.length-(stop-start)];int j=0;for(int i=0;i<vals.length;i++){if(i<start||i>=stop)r[j++]=vals[i];}return r;}"}' | jq
```

### Native (no sandbox; needs a JDK on PATH)

```bash
cd runner
SANDBOX_MODE=none go run .
```

### Point the site at it

Set in the Next.js app's environment (`.env.local` or Vercel):

```
JAVA_RUNNER_URL=http://localhost:8080      # or https://...fly.dev
JAVA_RUNNER_TOKEN=devtoken
```

## Deploy to Fly.io

```bash
cd runner
fly launch --no-deploy --copy-config --name digitalexams-runner
fly secrets set RUNNER_AUTH_TOKEN=$(openssl rand -hex 32)
fly deploy
```

See `fly.toml`. Machines scale to zero when idle.

## Tests

```bash
cd runner
go test ./...                 # parity + validation; e2e auto-skips without a JDK
SANDBOX_MODE=bwrap go test ./...   # full e2e incl. sandbox-escape checks (Linux + bwrap)
```

`TestHarnessParity` pins the Go harness byte-for-byte to
`testdata/harness-fixtures.json`. `TestReferenceSolutionsAllPass` runs every
official answer end-to-end and requires a perfect score.

## Adding or changing questions

The harness for each question lives in `questions/<id>/`: the Java files with
exactly one `// __STUDENT_CODE__` marker where the submission is spliced. An
optional `manifest.json` (`{"transform":"declassify"}`) drops the `public`
modifier from a whole-class submission.

To add a question:

1. Create `questions/<new-id>/` with the harness files and the marker. The
   `<id>` must match the question `id` in `app/data/*`.
2. Add the reference answer to the exam data, then regenerate the fixtures the
   tests use:
   ```bash
   npx -y tsx runner/testdata/extract-solutions.ts
   node runner/testdata/generate-question-templates.mjs   # if you want them re-derived
   ```
   For a brand-new question without a prior TypeScript harness, add it to
   `testdata/harness-fixtures.json` by running the harness once and snapshotting
   its output, or simply rely on `TestReferenceSolutionsAllPass` as the gate.
3. `go test ./...` — the reference answer must earn a perfect score.
