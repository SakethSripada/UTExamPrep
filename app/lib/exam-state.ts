import type { AnswerState, Exam, ObjectivePart, PersistedExam, Question } from "@/app/lib/exam-types";
import { exams } from "@/app/data/exams";

export function isSameCode(left: string | undefined, right: string | undefined) {
  return normalizeCode(left ?? "") === normalizeCode(right ?? "");
}

export function sanitizeAnswersForExam(exam: Exam, answers: AnswerState = {}) {
  const next: AnswerState = {};
  const codeStubs = exams
    .flatMap((item) => item.questions)
    .filter((question) => question.type === "code" && question.stub)
    .map((question) => question.stub ?? "");

  for (const question of exam.questions) {
    const value = answers[question.id];
    if (question.type === "short") {
      if (Array.isArray(value)) {
        next[question.id] = value;
      }
      continue;
    }

    if (typeof value !== "string" || !value.trim()) {
      continue;
    }

    const isOwnStarter = isSameCode(value, question.stub);
    const isOtherStarter = codeStubs.some((stub) => !isSameCode(stub, question.stub) && isSameCode(value, stub));
    if (!isOwnStarter && !isOtherStarter) {
      next[question.id] = value;
    }
  }

  return next;
}

export function readPersistedExam(examId: string): PersistedExam {
  if (typeof window === "undefined") {
    return {};
  }
  const saved = window.localStorage.getItem(`digitalexams:${examId}`);
  if (!saved) {
    return {};
  }

  const persisted = JSON.parse(saved) as PersistedExam;
  const exam = exams.find((item) => item.id === examId);
  return {
    ...persisted,
    answers: exam ? sanitizeAnswersForExam(exam, persisted.answers) : persisted.answers,
  };
}

export function readSavedExamIds() {
  if (typeof window === "undefined") {
    return [];
  }
  return exams.filter((item) => window.localStorage.getItem(`digitalexams:${item.id}`)).map((item) => item.id);
}

export function normalizeAnswer(value: string) {
  return value
    .trim()
    .replace(/\s*,\s*/g, ",")
    .replace(/[;]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^error$/i, "COMPILE ERROR")
    .replace(/^syntax error$/i, "COMPILE ERROR")
    .replace(/^compile error$/i, "COMPILE ERROR")
    .replace(/^runtime error$/i, "RUNTIME ERROR")
    .replace(/^compiles$/i, "legal")
    .toLowerCase();
}

export function isCorrect(given: string, expected: string) {
  const user = normalizeAnswer(given);
  const official = normalizeAnswer(expected);
  if (official === "-4.0" && (user === "-4.0" || user === "-5.0")) {
    return true;
  }
  return user === official;
}

export function normalizeCode(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function hasEditedCodeAnswer(item: Question, answers: AnswerState) {
  const value = (answers[item.id] as string | undefined) ?? "";
  if (!value.trim()) {
    return false;
  }
  return !isSameCode(value, item.stub);
}

export function labelForIndex(index: number) {
  return String.fromCharCode(65 + index);
}

export function buildObjectiveParts(question: Question): ObjectivePart[] {
  if (!question.code || !question.answers) {
    return [];
  }

  if (question.title.includes("Expressions")) {
    return question.code.split("\n").map((line, index) => ({
      kind: "answer",
      label: labelForIndex(index),
      code: line,
      answerIndex: index,
    }));
  }

  const parts: ObjectivePart[] = [];
  let current: ObjectivePart | null = null;
  let answerIndex = 0;
  let contextLines: string[] = [];
  let collectingContext = false;

  const pushCurrent = () => {
    if (current && current.code.trim()) {
      parts.push(current);
    }
    current = null;
  };

  const pushContext = () => {
    if (contextLines.some((line) => line.trim())) {
      parts.push({ kind: "context", code: contextLines.join("\n").trim() });
    }
    contextLines = [];
    collectingContext = false;
  };

  for (const line of question.code.split("\n")) {
    const marker = line.match(/^([A-Z](?:\d+)?)\.\s*(.*)$/);
    const startsSharedContext = /^For\s+[A-Z].*consider/i.test(line);

    if (startsSharedContext) {
      pushCurrent();
      collectingContext = true;
      contextLines = [line];
      continue;
    }

    if (marker) {
      if (collectingContext) {
        pushContext();
      }
      pushCurrent();
      current = {
        kind: "answer",
        label: marker[1],
        code: marker[2],
        answerIndex,
      };
      answerIndex++;
      continue;
    }

    if (collectingContext) {
      contextLines.push(line);
    } else if (current) {
      current.code += `${current.code ? "\n" : ""}${line}`;
    } else if (line.trim()) {
      parts.push({ kind: "context", code: line });
    }
  }

  pushCurrent();
  pushContext();
  return parts;
}

export function answerPlaceholder(part: ObjectivePart) {
  const text = part.code.toLowerCase();
  if (/compile-time errors|list all line numbers|which.*lines.*compile/.test(text)) {
    return "List compile errors";
  }
  if (/legal or syntax error|syntax error|compiles or error|compiles error|compile-time errors|compile error/.test(text)) {
    return "Type legal or syntax error";
  }
  if (/true or false/.test(text)) {
    return "Type true or false";
  }
  if (/pick the letter|answer with the letter|which of the following|choices:/.test(text)) {
    return "Type letter(s)";
  }
  if (/big o|order\b|efficient/.test(text)) {
    return "Type Big O";
  }
  if (/expected time|seconds|time for/.test(text)) {
    return "Type time";
  }
  if (/what is output|what is printed|system\.out|exact output/.test(text)) {
    return "Type exact output";
  }
  return "Type answer";
}

