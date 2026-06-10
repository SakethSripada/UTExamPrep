export type QuestionType = "short" | "code";

export type Rubric = {
  label: string;
  points: number;
};

export type Question = {
  id: string;
  title: string;
  points: number;
  type: QuestionType;
  prompt: string;
  reference?: string;
  code?: string;
  stub?: string;
  answer?: string;
  answers?: string[];
  answerPoints?: number[];
  rubric?: Rubric[];
  // A short-answer part that was thrown out after the exam. It renders inline in
  // sequence (e.g. as "E") with an explanatory note and no answer input, and its
  // points are awarded to everyone automatically.
  thrownOut?: ThrownOutPart;
};

export type ThrownOutPart = {
  label: string; // The part letter shown inline, e.g. "E".
  afterLabel: string; // Insert this part right after the part with this label.
  note: string; // Explanation shown in place of an answer input.
  points: number; // Points awarded automatically to everyone.
};

export type Exam = {
  id: string;
  title: string;
  subtitle: string;
  questions: Question[];
};

export type AnswerState = Record<string, string | string[]>;
export type ManualState = Record<string, number>;
export type FlagState = Record<string, boolean>;

export type JavaStatus = {
  available: boolean;
  message: string;
};

export type JavaRunResult = {
  ok: boolean;
  phase: string;
  message: string;
  stdout?: string;
  stderr?: string;
  passed?: number;
  total?: number;
};

export type JavaRunState = Record<string, JavaRunResult | { loading: true }>;

export type ObjectivePart =
  | { kind: "context"; code: string }
  | { kind: "answer"; label: string; code: string; answerIndex: number }
  | { kind: "thrown"; label: string; note: string };

export type ContentSegment = {
  kind: "code" | "text";
  text: string;
};

export type MissingPart = {
  label: string;
  targetId: string;
};

export type IncompleteSection = {
  question: Question;
  questionIndex: number;
  missingParts: MissingPart[];
};

export type PersistedExam = {
  answers?: AnswerState;
  manual?: ManualState;
  flags?: FlagState;
};
