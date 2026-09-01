# Contributing

Thanks for taking a look. This project is a practice-exam workspace for UT Austin
CS courses, and the most useful thing you can add is **more exams** — but bug fixes,
UI improvements, and docs are all welcome too.

You don't need to be an expert to help. If something is broken or confusing, open an
issue. If you want to add an exam, the steps below should get you there.

## Getting set up

You'll need [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/SakethSripada/UTExamPrep.git
cd UTExamPrep
npm install
npm run dev
```

Then open http://localhost:3000.

The coding questions can run real Java tests if you have a JDK installed (`javac` and
`java` on your PATH). It's optional — short-answer questions and everything else work
fine without it. If Java isn't found, those questions just fall back to manual scoring.

## How the project is laid out

- `app/data/` — the exams themselves. One file per exam.
- `app/data/exams.ts` — the list of exams the app loads.
- `app/lib/exam-types.ts` — the types you'll fill in when writing an exam.
- `app/components/` — the question UI, reference rendering, Java runner panel.
- `app/api/java/run/` — the local Java compile-and-test endpoint.

## Adding an exam

1. Make a new file in `app/data/`, for example `cs311-exam-one.ts`. The easiest
   approach is to copy an existing one (`cs314-exam-one.ts` is a good template) and
   replace the contents.

2. An exam is just an object with a title and a list of questions:

   ```ts
   import type { Exam } from "@/app/lib/exam-types";

   export const cs311ExamOne: Exam = {
     id: "cs311-fall-2025-e1",
     title: "CS 311 Fall 2025 Exam 1",
     subtitle: "Short description of the topics",
     questions: [
       /* ... */
     ],
   };
   ```

3. There are two kinds of questions:

   - **Short answer** (`type: "short"`) — auto-graded. You provide the `answers`
     array and an `answerPoints` array with the points for each part. Answers are
     matched against what the student types, so keep them exact.
   - **Code** (`type: "code"`) — graded with a `rubric`, and optionally by running
     Java tests. Include a `stub` for the starter code and an `answer` for the
     reference solution.

   The exact fields live in `app/lib/exam-types.ts` — that file is the source of
   truth, so check there if you're unsure what's allowed.

4. Register the exam in `app/data/exams.ts`:

   ```ts
   import { cs311ExamOne } from "./cs311-exam-one";

   export const exams = [/* existing exams */, cs311ExamOne].map(/* ... */);
   ```

5. Run `npm run dev`, pick your exam from the menu, and click through every question
   to make sure the prompts, references, and answers look right.

A couple of things worth knowing:

- If a question was thrown out after the real exam, you can mark a short-answer part
  as `thrownOut` so it shows up in order with a note and awards its points
  automatically (no answer box). See `cs314-exam-one.ts` for an example.
- Reference blocks can mix code and plain text. Code is detected automatically, so
  you usually just paste the class definitions and prose together.

## Before you open a pull request

- Run `npm run lint` and fix anything it flags.
- Run `npm run build` to make sure the app still compiles.
- Click through the exam (or feature) you changed in the browser.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org). Keep them short
and say what actually changed:

```
feat: add cs311 fall 2025 exam 1
fix: correct answer for short-answer part H
docs: explain how to add code questions
```

Common prefixes: `feat`, `fix`, `docs`, `refactor`, `style`, `chore`.

## Opening the pull request

Push your branch, open a PR, and describe what you changed and why. If you added an
exam, mention the course and which exam it is. That's it — thanks for contributing.
