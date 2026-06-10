// Regenerates solutions.json from the exam data files.
// Run from the repo root:  npx -y tsx runner/testdata/extract-solutions.ts
// The runner's Go end-to-end tests compile and run every solution in
// solutions.json and require a perfect score, so regenerate this file
// whenever a coding question is added or its reference answer changes.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { examOne } from "../../app/data/exam-one";
import { examTwo } from "../../app/data/exam-two";
import { cs314ExamOne } from "../../app/data/cs314-exam-one";
import { cs314ExamTwo } from "../../app/data/cs314-exam-two";
import { cs314ExamThree } from "../../app/data/cs314-exam-three";

const solutions: Record<string, string> = {};
for (const exam of [examOne, examTwo, cs314ExamOne, cs314ExamTwo, cs314ExamThree]) {
  for (const question of exam.questions) {
    if (question.type === "code" && question.answer) {
      solutions[question.id] = question.answer;
    }
  }
}

const outFile = path.join(import.meta.dirname, "solutions.json");
writeFileSync(outFile, JSON.stringify(solutions, null, 2) + "\n");
console.log(`Wrote ${Object.keys(solutions).length} solutions to ${outFile}`);
