import type { AnswerState, Exam, ObjectivePart, PersistedExam, Question } from "@/app/lib/exam-types";

const storagePrefix = "utexamprep";
const legacyStoragePrefix = "digitalexams";

function storageKey(examId: string, prefix = storagePrefix) {
  return `${prefix}:${examId}`;
}

export function workResponseKey(questionId: string) {
  return `${questionId}:work`;
}

export function isSameCode(left: string | undefined, right: string | undefined) {
  return normalizeCode(left ?? "") === normalizeCode(right ?? "");
}

export function sanitizeAnswersForExam(exam: Exam, answers: AnswerState = {}) {
  const next: AnswerState = {};

  for (const question of exam.questions) {
    const value = answers[question.id];
    const workKey = workResponseKey(question.id);
    const work = answers[workKey];
    if (question.workPrompt && typeof work === "string" && work.trim()) {
      next[workKey] = work;
    }
    if (question.type === "short") {
      if (Array.isArray(value)) {
        next[question.id] = value;
      }
      continue;
    }

    if (question.type === "choice") {
      if (Array.isArray(value)) {
        next[question.id] = value.filter((choiceId): choiceId is string => typeof choiceId === "string");
      } else if (typeof value === "string" && value) {
        next[question.id] = value;
      }
      continue;
    }

    if (typeof value !== "string" || !value.trim()) {
      continue;
    }

    if (!isSameCode(value, question.stub)) {
      next[question.id] = value;
    }
  }

  return next;
}

export function readPersistedExam(examId: string, exam?: Exam): PersistedExam {
  if (typeof window === "undefined") {
    return {};
  }
  const currentKey = storageKey(examId);
  const saved =
    window.localStorage.getItem(currentKey) ??
    window.localStorage.getItem(storageKey(examId, legacyStoragePrefix));
  if (!saved) {
    return {};
  }

  // Preserve existing work from the prior product name without leaving future
  // reads tied to the legacy namespace.
  if (!window.localStorage.getItem(currentKey)) {
    window.localStorage.setItem(currentKey, saved);
  }

  const persisted = JSON.parse(saved) as PersistedExam;
  return {
    ...persisted,
    answers: exam ? sanitizeAnswersForExam(exam, persisted.answers) : persisted.answers,
  };
}

export function readSavedExamIds(examIds: string[]) {
  if (typeof window === "undefined") {
    return [];
  }
  return examIds.filter(
    (examId) =>
      window.localStorage.getItem(storageKey(examId)) ||
      window.localStorage.getItem(storageKey(examId, legacyStoragePrefix)),
  );
}

export function clearPersistedExam(examId: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(storageKey(examId));
  window.localStorage.removeItem(storageKey(examId, legacyStoragePrefix));
}

export function clearAllPersistedExams(examIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }
  for (const examId of examIds) {
    clearPersistedExam(examId);
  }
}

export function normalizeAnswer(value: string) {
  return value
    .trim()
    .replace(/[×·]/g, "x")
    .replace(/[−–—]/g, "-")
    .replace(/≠/g, "!=")
    .replace(/δ/g, "delta")
    .replace(/ŵ/g, "omega")
    .replace(/⁻/g, "-")
    .replace(/[⁰₀]/g, "0")
    .replace(/[¹₁]/g, "1")
    .replace(/[²₂]/g, "2")
    .replace(/[³₃]/g, "3")
    .replace(/[⁴₄]/g, "4")
    .replace(/[⁵₅]/g, "5")
    .replace(/[⁶₆]/g, "6")
    .replace(/[⁷₇]/g, "7")
    .replace(/[⁸₈]/g, "8")
    .replace(/[⁹₉]/g, "9")
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

function numericAnswer(value: string) {
  const normalized = normalizeAnswer(value)
    .replace(/\s+/g, " ")
    .replace(/\s*\^\s*/g, "^");
  const match = normalized.match(
    /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*(?:e|x\s*10\^?)\s*([+-]?\d+))?\s*([a-z][a-z0-9 /.*^-]*)?$/,
  );
  if (!match) {
    return null;
  }
  const coefficient = Number(match[1]);
  const exponent = Number(match[2] ?? 0);
  if (!Number.isFinite(coefficient) || !Number.isFinite(exponent)) {
    return null;
  }
  return {
    value: coefficient * 10 ** exponent,
    unit: (match[3] ?? "").replace(/[.*]/g, "").replace(/\s+/g, " ").trim(),
  };
}

function looseTextAnswer(value: string) {
  const normalized = normalizeAnswer(value)
    .replace(/σ/g, "sigma")
    .replace(/π/g, "pi")
    .replace(/θ/g, "theta")
    .replace(/ω/g, "omega")
    .replace(/ₖ/g, "_k")
    .replace(/\\(?:left|right|mathrm|operatorname)/g, "")
    .replace(/\\(?:pi|theta|omega)/g, (match) => match.slice(1))
    .replace(/[{}]/g, "")
    .replace(/(?<=[a-z])-(?=[a-z])/g, " ")
    .replace(/[,;]/g, " ");

  // Formula answers are notation rather than prose. Treat harmless spacing
  // differences (for example `x[-1] = 0` versus `x[-1]=0`) as equivalent,
  // while preserving word boundaries for ordinary short answers.
  if (
    ["=", "^", "(", "[", "sin", "cos", "delta", "stft"].some((marker) => normalized.includes(marker))
  ) {
    return normalized.replace(/\s+/g, "").trim();
  }

  return normalized.replace(/\s+/g, " ").trim();
}

function isCorrectSingle(given: string, expected: string) {
  const user = normalizeAnswer(given);
  const official = normalizeAnswer(expected);
  if (official === "-4.0" && (user === "-4.0" || user === "-5.0")) {
    return true;
  }
  const userNumber = numericAnswer(given);
  const officialNumber = numericAnswer(expected);
  if (userNumber && officialNumber && userNumber.unit === officialNumber.unit) {
    const scale = Math.max(1, Math.abs(officialNumber.value));
    if (Math.abs(userNumber.value - officialNumber.value) <= scale * 1e-9) {
      return true;
    }
  }
  const formulaLike = ["=", "^", "delta", "sin", "cos"].some((marker) => official.includes(marker));
  if ((!official.includes("[") || formulaLike) && looseTextAnswer(given) === looseTextAnswer(expected)) {
    return true;
  }
  return user === official;
}

export function isCorrect(given: string, expected: string) {
  if (isCorrectSingle(given, expected)) {
    return true;
  }
  // Archived answer keys often accept alternatives ("1999 or 2000",
  // "50,000,000,000 or 50 billion"); credit a match against any of them.
  const alternatives = expected.split(/\s+(?:or|OR)\s+/);
  return alternatives.length > 1 && alternatives.some((alternative) => isCorrectSingle(given, alternative));
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
  let current: Extract<ObjectivePart, { kind: "answer" }> | null = null;
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

  if (question.thrownOut) {
    const { label, afterLabel, note } = question.thrownOut;
    const insertAt = parts.findIndex((part) => part.kind === "answer" && part.label === afterLabel);
    const thrownPart: ObjectivePart = { kind: "thrown", label, note };
    if (insertAt === -1) {
      parts.push(thrownPart);
    } else {
      parts.splice(insertAt + 1, 0, thrownPart);
    }
  }

  return parts;
}

export function answerPlaceholder(part: ObjectivePart) {
  const text = "code" in part ? part.code.toLowerCase() : "";
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
