#!/usr/bin/env bash
# Print a summary of every commit on the current branch: hash, current message,
# and the files it touched. Handy for reviewing history before rewriting it.
set -euo pipefail

for sha in $(git rev-list --reverse HEAD); do
  printf '\n========== %s ==========\n' "$(git rev-parse --short "$sha")"
  printf 'message: %s\n' "$(git log -1 --format='%s' "$sha")"
  git show --stat --format='' "$sha"
done
