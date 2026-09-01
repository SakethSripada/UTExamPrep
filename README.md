# UTExamPrep

UTExamPrep turns official UT Austin practice and past exams into a focused,
responsive study workspace. It includes objective grading, saved progress,
exam-style diagrams, a timer, and rubric-based review for written and programming
responses.

## Local development

Use Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` (or the port printed by Next.js).

## Grading model

- Short-answer and multiple-choice items are checked against their official keys.
- Programming and written responses are self-graded against point-by-point official
  rubrics after submission.
- Public code execution is disabled by default. The runner implementation is retained
  for authenticated or controlled deployments and requires
  `CODE_RUNNER_ENABLED=true`, `JAVA_RUNNER_URL`, and `JAVA_RUNNER_TOKEN`.

The launch validator checks published question totals, answer-part mappings, choice
keys, rubric totals, and diagram references:

```bash
npm run validate:launch
```

## Source PDFs

UTExamPrep uses only exams and supporting materials that are publicly available.
The project does not access, collect, or reproduce materials from authenticated,
login-gated, course-restricted, or otherwise private sources.

PDFs are intentionally kept out of this open-source repository and its Git history.
For local curation and source audits, place the separate PDF archive at
`../UTExamPrep-PDFs/exampdfs`, or set `UTEXAMPREP_PDF_ROOT` to its `exampdfs`
directory. The application itself does not need the PDFs at runtime.

## Optional exam submissions

The unauthenticated public build does not expose PDF uploads. A controlled deployment
can opt in with `NEXT_PUBLIC_EXAM_REQUESTS_ENABLED=true` and an absolute, durable
`EXAM_REQUESTS_DIR`. Submission failures return user-facing messages without exposing
filesystem or server details.

## Useful commands

```bash
npm run lint
npm run build
npm run validate:launch
npm run validate:exams
npm run audit:cs314
```

## Project layout

| Path | Purpose |
| --- | --- |
| `app/data/` | Published exam content and catalog |
| `app/lib/exam-types.ts` | Exam, rubric, and diagram types |
| `app/components/` | Exam, review, editor, and diagram UI |
| `app/api/java/run/` | Feature-gated code-runner proxy |
| `runner/` | Preserved sandboxed runner service |
| `scripts/` | Source curation and validation tools |

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance.

## License

Released under the [MIT License](LICENSE).
