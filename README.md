# DigitalExams

A practice-exam workspace for UT Austin CS courses. Work through real past exams in
the browser: short-answer questions are graded automatically, and coding questions can
be checked against actual Java tests if you have a JDK installed.

It currently includes CS 312 sample exams and the CS 314 Fall 2025 exams, but the whole
point is for people to add more — see [Contributing](#contributing).

## Features

- **Auto-graded short answer** — type your answers and get scored instantly, with the
  official answers shown on review.
- **Coding questions in a real editor** — a Monaco editor with Java syntax, graded by a
  rubric and (optionally) by compiling and running tests locally.
- **Reference panels** — class definitions and prose render together, with code
  highlighted automatically.
- **Progress is saved** — your answers persist in the browser, per exam, so you can
  come back later.
- **Built-in timer** — a countdown you can set and start whenever you want to simulate
  exam conditions.

## Getting started

You'll need [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/SakethSripada/DigitalExams.git
cd DigitalExams
npm install
npm run dev
```

Open http://localhost:3000 and pick an exam.

### Running Java tests (optional)

Coding questions can compile and run real Java tests if `javac` and `java` are on your
PATH. This is optional — if no JDK is found, those questions fall back to manual
scoring and everything else works normally. Nothing is uploaded; tests run locally
through the dev server.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Monaco editor](https://microsoft.github.io/monaco-editor/) for code questions
- A local API route that shells out to the installed JDK for Java tests

## Project layout

| Path | What's there |
| --- | --- |
| `app/data/` | The exams, one file per exam, plus the list in `exams.ts` |
| `app/lib/exam-types.ts` | The types that describe an exam |
| `app/components/` | Question UI, reference rendering, the Java runner panel, the timer |
| `app/api/java/run/` | The local Java compile-and-test endpoint |

## Contributing

Contributions are very welcome, especially new exams. The
[contributing guide](CONTRIBUTING.md) walks through local setup, how an exam is
structured, and how to add one.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # run eslint
```

## License

Released under the [MIT License](LICENSE).
