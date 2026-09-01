#!/usr/bin/env bash
# Rewrite the commit messages on this branch to follow Conventional Commits.
# Only the messages change -- the file trees of every commit stay byte-for-byte
# identical, so the code is untouched.
#
# It keys off the ORIGINAL commit hash ($GIT_COMMIT) so it is safe to re-run.
set -euo pipefail

# Keep a backup of where we were, so the rewrite is easy to undo.
git branch -f backup-pre-rewrite HEAD

export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --msg-filter '
case "$GIT_COMMIT" in
  f4be69b*) echo "chore: scaffold project with create-next-app" ;;
  a32b9c7*) echo "feat: add exam app with local java test runner and cs312 exams" ;;
  3881848*) echo "feat: add code-tracing question splitting and answer validation" ;;
  5ea72bb*) echo "feat: auto-detect installed java toolchain for running tests" ;;
  e628bfc*) echo "fix: clear java run results on exam reset" ;;
  7e86fd6*) echo "feat: add cs314 exams and grading solutions" ;;
  fee5b76*) echo "feat: render reference blocks with mixed code and prose" ;;
  e8ab0d5*) echo "feat: add inline code formatting and multiple-choice rendering" ;;
  257b7d0*) echo "refactor: split page into components, data, and lib modules" ;;
  27db58b*) echo "style: simplify home header and fix reference panel scrolling" ;;
  2ac891f*) echo "feat: add reset buttons to clear saved exam progress" ;;
  7371ebd*)
    echo "feat: add exam timer and inline thrown-out questions"
    echo
    echo "- countdown timer in the top bar with editable time and a time-up flash"
    echo "- show thrown-out short-answer parts inline with auto-awarded points"
    echo "- keep reference code blocks together when a line is not obviously code"
    ;;
  *) cat ;;
esac
' -- --all
