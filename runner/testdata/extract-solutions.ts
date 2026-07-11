// Regenerates solutions.json from the exam data files.
// Run from the repo root:  npx -y tsx runner/testdata/extract-solutions.ts
// The runner's Go end-to-end tests compile and run every solution in
// solutions.json and require a perfect score, so regenerate this file
// whenever a coding question is added or its reference answer changes.
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { examOne } from "../../app/data/exam-one";
import { examTwo } from "../../app/data/exam-two";
import { cs314ExamOne } from "../../app/data/cs314-exam-one";
import { cs314ExamTwo } from "../../app/data/cs314-exam-two";
import { cs314ExamThree } from "../../app/data/cs314-exam-three";
import { archivedCsExams } from "../../app/data/generated-cs-archive";
import { cs314Overrides } from "../../scripts/curation/cs314-overrides.mjs";

const solutions: Record<string, string> = {};
const mutations: Record<string, string> = {};

function obviousWrongAnswer(stub: string) {
  const signature = stub.match(/\b(public|private|protected)\s+(?:static\s+)?([\w<>\[\], ?]+?)\s+\w+\s*\([^)]*\)/s);
  if (!signature) return stub;
  const returns = signature[2].trim();
  const value = returns === "void" ? "" : /^(?:byte|short|int|long|float|double)$/.test(returns)
    ? "return 0;"
    : returns === "boolean"
      ? "return false;"
      : returns === "char"
        ? "return '\\0';"
        : "return null;";
  return stub.replace(/\{[\s\S]*\}\s*$/, `{\n    ${value}\n}`);
}
for (const exam of [examOne, examTwo, cs314ExamOne, cs314ExamTwo, cs314ExamThree]) {
  for (const question of exam.questions) {
    if (question.type === "code" && question.answer) {
      solutions[question.id] = question.answer;
    }
  }
}

const registered = new Set(
  readdirSync(path.join(import.meta.dirname, "..", "questions"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);
for (const exam of Object.values(archivedCsExams)) {
  if (exam.course !== "CS 314") continue;
  for (const [index, originalQuestion] of exam.questions.entries()) {
    const question = {
      ...originalQuestion,
      ...(cs314Overrides[exam.id]?.questions?.[index + 1]?.set ?? {}),
    };
    if (question.type === "code" && question.answer && registered.has(question.id)) {
      solutions[question.id] = question.answer;
      mutations[question.id] = obviousWrongAnswer(question.stub ?? "");
    }
  }
}

const outFile = path.join(import.meta.dirname, "solutions.json");
writeFileSync(outFile, JSON.stringify(solutions, null, 2) + "\n");
writeFileSync(path.join(import.meta.dirname, "mutations.json"), JSON.stringify(mutations, null, 2) + "\n");
console.log(`Wrote ${Object.keys(solutions).length} solutions to ${outFile}`);
