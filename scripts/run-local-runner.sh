#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

export RUNNER_AUTH_TOKEN="${RUNNER_AUTH_TOKEN:-devtoken}"
export SANDBOX_MODE="${SANDBOX_MODE:-none}"
export PORT="${PORT:-8080}"

if ! command -v go >/dev/null 2>&1; then
  cat >&2 <<'EOF'
Go is required to run the local Java runner, but 'go' was not found on your PATH.

Install Go, then open a new terminal and run this script again.
Download: https://go.dev/dl/

After installing, verify with:
  go version
EOF
  exit 1
fi

printf 'Starting Java runner at http://localhost:%s\n' "$PORT"
printf 'RUNNER_AUTH_TOKEN=%s SANDBOX_MODE=%s\n' "$RUNNER_AUTH_TOKEN" "$SANDBOX_MODE"

cd "$REPO_ROOT/runner"
exec go run .
