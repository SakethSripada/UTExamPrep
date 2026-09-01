#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pdfRoot = process.env.UTEXAMPREP_PDF_ROOT
  ? path.resolve(process.env.UTEXAMPREP_PDF_ROOT)
  : existsSync(path.join(repoRoot, "exampdfs"))
    ? path.join(repoRoot, "exampdfs")
    : path.resolve(repoRoot, "..", "UTExamPrep-PDFs", "exampdfs");

function sourcePath(value) {
  return path.join(pdfRoot, value.replace(/^exampdfs\//, ""));
}

async function generatedValue(fileName) {
  const source = await readFile(path.join(repoRoot, "app", "data", fileName), "utf8");
  const value = source.replace(/^.*?= /s, "").replace(/;\s*$/, "");
  return JSON.parse(value);
}

async function pdfCount(course, skip2025 = false) {
  const courseDir = path.join(pdfRoot, course);
  const terms = (await readdir(courseDir, { withFileTypes: true })).filter((entry) => entry.isDirectory());
  let count = 0;
  for (const term of terms) {
    if (skip2025 && term.name === "2025-fall") continue;
    const files = await readdir(path.join(courseDir, term.name));
    count += files.filter((file) => /^(?:exam(?:-[123])?|final)-exam-.*\.pdf$/.test(file)).length;
  }
  return count;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

function declaredQuestionCount(text) {
  const match = text.match(/there (?:are|is)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:questions?|problems?)/i);
  if (!match) return null;
  return /^\d+$/.test(match[1]) ? Number(match[1]) : numberWords[match[1].toLowerCase()];
}

const archive = await generatedValue("generated-cs-archive.ts");
const catalog = await generatedValue("generated-cs-catalog.ts");
const expectedCount = (await pdfCount("cs314", true)) + (await pdfCount("cs439"));

assert(Object.keys(archive).length === expectedCount, `Expected ${expectedCount} archived exams.`);
assert(catalog.length === expectedCount, "Catalog and source exam counts differ.");

const examIds = new Set();
const questionIds = new Set();
let questionCount = 0;
let codeCount = 0;
let runnableCs314CodeCount = 0;

for (const entry of catalog) {
  const exam = archive[entry.id];
  assert(exam, `Missing archive exam ${entry.id}.`);
  assert(!examIds.has(exam.id), `Duplicate exam id ${exam.id}.`);
  examIds.add(exam.id);
  assert(entry.status === "ready", `${entry.id} is not ready.`);
  assert(entry.questionCount === exam.questions.length, `${entry.id} question count mismatch.`);
  assert(entry.points === exam.questions.reduce((sum, question) => sum + question.points, 0), `${entry.id} point total mismatch.`);
  assert(exam.sourceFiles?.length === 2, `${entry.id} must retain its exam and solution sources.`);
  for (const source of exam.sourceFiles) {
    assert(source.path, `${entry.id} has a source without a path.`);
    await access(sourcePath(source.path));
  }
  const examSourcePath = sourcePath(exam.sourceFiles.find((source) => source.role === "exam").path);
  const sourceText = execFileSync("pdftotext", ["-layout", "-f", "1", "-l", "2", examSourcePath, "-"], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  const declaredCount = declaredQuestionCount(sourceText);
  if (declaredCount) assert(exam.questions.length === declaredCount, `${entry.id} does not match its declared ${declaredCount} questions.`);
  const declaredPoints =
    sourceText.match(/(\d+)\s+points available/i)?.[1] ?? sourceText.match(/(?:test|exam)\s+is\s+worth\s+(\d+)\s+points/i)?.[1];
  // Some official PDFs advertise a rounded total (often 100) while their
  // printed problems include bonus or thrown-out parts. The internally stored
  // total above is authoritative because it is the total the UI actually
  // grades; retain this discrepancy as a review signal without rejecting an
  // otherwise consistent archive.
  if (declaredPoints && entry.points !== Number(declaredPoints)) {
    console.warn(`${entry.id}: displayed points ${entry.points} differ from PDF total ${declaredPoints}.`);
  }

  for (const question of exam.questions) {
    questionCount += 1;
    assert(!questionIds.has(question.id), `Duplicate question id ${question.id}.`);
    questionIds.add(question.id);
    assert(question.points > 0, `${question.id} has invalid points.`);
    assert(question.prompt?.trim(), `${question.id} has no prompt.`);
    assert(
      ["short", "choice", "free-response", "code"].includes(question.type),
      `${question.id} has an unexpected archive question type.`,
    );
    const objectivelyScored =
      (question.type === "short" && question.answers?.length) ||
      (question.type === "choice" && question.correctChoiceIds?.length);
    assert(
      objectivelyScored || question.rubric?.length,
      `${question.id} has neither objective answers nor a scoring rubric.`,
    );
    const expectedQuestionSuffix = `-q${exam.questions.indexOf(question) + 1}`;
    assert(question.id.endsWith(expectedQuestionSuffix), `${question.id} is out of sequence.`);
    if (question.type === "code") {
      codeCount += 1;
      if (exam.course === "CS 314") {
        assert(question.reference?.trim(), `${question.id} has no programming reference.`);
        assert(question.stub?.trim(), `${question.id} has no editor starter content.`);
        assert(question.answer?.trim(), `${question.id} has no official programming solution.`);
        assert(!question.answer.includes("complete solution text follows"), `${question.id} does not have a question-specific solution.`);
        assert(question.language === "java" || question.language === "c", `${question.id} has no syntax language.`);
        assert(question.runnable === true, `${question.id} must enable its registered executable harness.`);
        await access(path.join(repoRoot, "runner", "questions", question.id, "TestRunner.java"));
        runnableCs314CodeCount += 1;
      }
    } else if (question.type === "free-response") {
      assert(question.officialSolution?.trim(), `${question.id} has no official solution.`);
      assert(
        !question.officialSolution.includes("complete solution text follows"),
        `${question.id} does not have a question-specific solution.`,
      );
    }
  }
}

const biology = await readFile(path.join(repoRoot, "app", "data", "biology-2007-exam-one.ts"), "utf8");
const chemistry = await readFile(path.join(repoRoot, "app", "data", "chemistry-ch301.ts"), "utf8");
assert(!/type:\s*["']code["']/.test(biology + chemistry), "A live science exam contains a code question.");
assert(!/Official key:/.test(biology + chemistry), "A live science exam still exposes the old official-key label.");

console.log(
  `Validated ${examIds.size} archived exams, ${questionCount} questions, and ${codeCount} programming editors (${runnableCs314CodeCount} runnable CS 314 editors).`,
);
