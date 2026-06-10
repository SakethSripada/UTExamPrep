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
  | { kind: "answer"; label: string; code: string; answerIndex: number };

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
