import fs from "node:fs";
import path from "node:path";

import { examCatalog, loadAllExams } from "../app/data/exams";
import { buildObjectiveParts, isCorrect } from "../app/lib/exam-state";
import type { Question, QuestionDiagram, Rubric } from "../app/lib/exam-types";

const repoRoot = path.resolve(import.meta.dirname, "..");
const pdfRoot = process.env.UTEXAMPREP_PDF_ROOT
  ? path.resolve(process.env.UTEXAMPREP_PDF_ROOT)
  : fs.existsSync(path.join(repoRoot, "exampdfs"))
    ? path.join(repoRoot, "exampdfs")
    : path.resolve(repoRoot, "..", "UTExamPrep-PDFs", "exampdfs");
const errors: string[] = [];
const warnings: string[] = [];

function issue(scope: string, message: string) {
  errors.push(`${scope}: ${message}`);
}

function sumPoints(items: Rubric[] | undefined) {
  return (items ?? []).reduce((total, item) => total + item.points, 0);
}

function nearlyEqual(left: number, right: number) {
  return Math.abs(left - right) < 1e-9;
}

function validateDiagram(diagram: QuestionDiagram, scope: string) {
  if (diagram.kind === "source") {
    if (!diagram.src.startsWith("/")) {
      issue(scope, `source diagram must use a public-root path: ${diagram.src}`);
    }
    const sourcePath = path.join(repoRoot, "public", diagram.src.replace(/^\//, ""));
    if (!fs.existsSync(sourcePath)) {
      issue(scope, `missing source diagram ${diagram.src}`);
    }
    if (diagram.width <= 0 || diagram.height <= 0) {
      issue(scope, "source diagram dimensions must be positive");
    }
    if (!diagram.alt.trim()) {
      issue(scope, "source diagram needs accessible alt text");
    }
    return;
  }

  if (diagram.kind === "linked-list") {
    if (diagram.values.length === 0) issue(scope, "linked list has no nodes");
    return;
  }

  const ids = new Set<string>();
  for (const node of diagram.nodes) {
    if (!node.id.trim()) issue(scope, "diagram node has an empty id");
    if (ids.has(node.id)) issue(scope, `duplicate diagram node id ${node.id}`);
    ids.add(node.id);
  }

  if (diagram.kind === "tree") {
    if (!ids.has(diagram.root)) issue(scope, `tree root ${diagram.root} does not exist`);
    for (const node of diagram.nodes) {
      for (const child of [node.left, node.right]) {
        if (child && !ids.has(child)) issue(scope, `tree edge references missing node ${child}`);
      }
    }
    return;
  }

  const edges = new Set<string>();
  for (const edge of diagram.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      issue(scope, `graph edge ${edge.from} -> ${edge.to} references a missing node`);
    }
    const key = `${edge.from}->${edge.to}`;
    if (edges.has(key)) issue(scope, `duplicate graph edge ${key}`);
    edges.add(key);
  }
}

function validateQuestion(question: Question, scope: string) {
  if (!Number.isFinite(question.points) || question.points <= 0) {
    issue(scope, `invalid point value ${question.points}`);
  }

  const workPoints = question.workPoints ?? 0;
  if (workPoints < 0 || workPoints > question.points) {
    issue(scope, `work points ${workPoints} are outside the question total`);
  }
  if (question.workRubric && !nearlyEqual(sumPoints(question.workRubric), workPoints)) {
    issue(scope, `work rubric totals ${sumPoints(question.workRubric)}, expected ${workPoints}`);
  }

  if (question.type === "choice") {
    const choiceIds = new Set((question.choices ?? []).map((choice) => choice.id));
    if (choiceIds.size === 0) issue(scope, "choice question has no choices");
    for (const correctId of question.correctChoiceIds ?? []) {
      if (!choiceIds.has(correctId)) issue(scope, `answer key references missing choice ${correctId}`);
    }
    if (!question.correctChoiceIds?.length) issue(scope, "choice question has no correct answer");
  }

  if (question.type === "short") {
    if (!question.answers?.length) issue(scope, "short-answer question has no answer key");
    if (question.code && question.answers) {
      const renderedAnswers = buildObjectiveParts(question).filter((part) => part.kind === "answer");
      if (renderedAnswers.length !== question.answers.length) {
        issue(
          scope,
          `${renderedAnswers.length} rendered answer boxes do not match ${question.answers.length} keyed answers`,
        );
      }
    }
    if (question.answerPoints && question.answers && question.answerPoints.length !== question.answers.length) {
      issue(scope, "answerPoints length does not match the answer key");
    }
    if (question.answerPoints) {
      const expected = question.points - workPoints - (question.thrownOut?.points ?? 0);
      const actual = question.answerPoints.reduce((total, points) => total + points, 0);
      if (!nearlyEqual(actual, expected)) {
        issue(scope, `objective answer points total ${actual}, expected ${expected}`);
      }
    }
    if (/canonical (?:form|description)|in this digitized version|for automatic scoring/i.test(question.code ?? "")) {
      issue(scope, "drawing or structured response is exposed as an implementation-oriented text format");
    }
    for (const [label, choices] of Object.entries(question.answerChoices ?? {})) {
      if (!choices.length) issue(scope, `part ${label} has no answer choices`);
      const choiceIds = new Set(choices.map((choice) => choice.id));
      if (choiceIds.size !== choices.length) issue(scope, `part ${label} has duplicate answer-choice ids`);
      const part = buildObjectiveParts(question).find((item) => item.kind === "answer" && item.label === label);
      const expected = part?.kind === "answer" ? question.answers?.[part.answerIndex] : undefined;
      if (!part) issue(scope, `answer choices reference missing part ${label}`);
      if (expected && !choiceIds.has(expected)) issue(scope, `part ${label} answer key references missing choice ${expected}`);
      for (const [index, choice] of choices.entries()) {
        if (choice.diagram) validateDiagram(choice.diagram, `${scope} part ${label} choice ${index + 1}`);
      }
    }
  }

  if (question.type === "code" || question.type === "free-response") {
    if (!question.rubric?.length) issue(scope, "self-graded response has no rubric");
    if (!nearlyEqual(sumPoints(question.rubric), question.points)) {
      issue(scope, `rubric totals ${sumPoints(question.rubric)}, expected ${question.points}`);
    }
    if (question.type === "code" && !question.stub?.trim()) issue(scope, "code response has no starter editor content");
    if (!question.officialSolution?.trim() && !question.answer?.trim()) {
      issue(scope, "self-graded response has no official solution");
    }
  }

  for (const [index, diagram] of (question.diagrams ?? []).entries()) {
    validateDiagram(diagram, `${scope} diagram ${index + 1}`);
  }
  for (const [index, diagram] of (question.solutionDiagrams ?? []).entries()) {
    validateDiagram(diagram, `${scope} solution diagram ${index + 1}`);
  }
}

async function main() {
  const exams = await loadAllExams();
  const examIds = new Set<string>();

  for (const exam of exams) {
  const catalog = examCatalog.find((item) => item.id === exam.id);
  if (!catalog) {
    issue(exam.id, "missing catalog entry");
    continue;
  }
  if (examIds.has(exam.id)) issue(exam.id, "duplicate exam id");
  examIds.add(exam.id);

  const questionIds = new Set<string>();
  for (const question of exam.questions) {
    const scope = `${exam.id}/${question.id}`;
    if (questionIds.has(question.id)) issue(scope, "duplicate question id");
    questionIds.add(question.id);
    validateQuestion(question, scope);
    for (const expected of question.answers ?? []) {
      if (!isCorrect(expected, expected)) issue(scope, `official answer does not match itself: ${expected}`);
    }
  }

  const points = exam.questions.reduce((total, question) => total + question.points, 0);
  if (exam.questions.length !== catalog.questionCount) {
    issue(exam.id, `${exam.questions.length} questions loaded, catalog says ${catalog.questionCount}`);
  }
  if (!nearlyEqual(points, catalog.points)) {
    issue(exam.id, `${points} points loaded, catalog says ${catalog.points}`);
  }
  if (!exam.sourceFiles?.length) warnings.push(`${exam.id}: no source files recorded`);
  for (const source of exam.sourceFiles ?? []) {
    if (!source.path) continue;
    const relativePath = source.path.replace(/^exampdfs\//, "");
    if (!fs.existsSync(path.join(pdfRoot, relativePath))) {
      issue(exam.id, `missing official source ${source.path}`);
    }
  }
  }

  if (exams.length !== examCatalog.length) {
    issue("catalog", `${exams.length} exams loaded from ${examCatalog.length} entries`);
  }

  const gradingCases: Array<[string, string, boolean]> = [
    ["6.96e-26 J", "6.96 × 10^-26 J", true],
    ["6.96e-25 J", "6.96 × 10^-26 J", false],
    ["5", "5 or 10", true],
    ["10", "5 or 10", true],
    ["-5.0", "-4.0", true],
    ["01010100101 00000", "0101 010 010 1 00000", true],
    ["no", "yes or linear", false],
  ];
  for (const [given, expected, result] of gradingCases) {
    if (isCorrect(given, expected) !== result) {
      issue("grader", `expected ${JSON.stringify(given)} against ${JSON.stringify(expected)} to be ${result}`);
    }
  }

  for (const warning of warnings) console.warn(`WARN ${warning}`);
  for (const error of errors) console.error(`ERROR ${error}`);

  if (errors.length) {
    console.error(`Launch validation failed with ${errors.length} error(s).`);
    process.exitCode = 1;
  } else {
    console.log(`Launch validation passed for ${exams.length} exams and ${exams.reduce((n, exam) => n + exam.questions.length, 0)} questions.`);
  }
}

void main();
