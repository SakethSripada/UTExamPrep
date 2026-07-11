export type QuestionType = "short" | "code" | "choice" | "free-response";

export type CodeLanguage = "java" | "python" | "c";

export type GradingMode = "auto" | "code" | "self" | "hybrid";

export type Rubric = {
  label: string;
  points: number;
};

export type Question = {
  id: string;
  title: string;
  points: number;
  type: QuestionType;
  gradingMode?: GradingMode;
  prompt: string;
  reference?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  diagrams?: QuestionDiagram[];
  code?: string;
  stub?: string;
  language?: CodeLanguage;
  // Historical programming questions can require course-only types or
  // pseudocode. They still use the full editor/submission/review workflow,
  // but only questions with a registered executable harness enable Run Tests.
  runnable?: boolean;
  answer?: string;
  answers?: string[];
  answerPoints?: number[];
  choices?: Choice[];
  correctChoiceIds?: string[];
  allowMultiple?: boolean;
  officialSolution?: string;
  sourceNote?: string;
  rubric?: Rubric[];
  // A short-answer part that was thrown out after the exam. It renders inline in
  // sequence (e.g. as "E") with an explanatory note and no answer input, and its
  // points are awarded to everyone automatically.
  thrownOut?: ThrownOutPart;
};

export type QuestionDiagram = TreeDiagram | LinkedListDiagram | SourceDiagram;

export type SourceDiagram = {
  kind: "source";
  src: string;
  alt: string;
  title?: string;
  description?: string;
  width: number;
  height: number;
};

export type TreeDiagram = {
  kind: "tree";
  title?: string;
  description?: string;
  root: string;
  nodes: Array<{
    id: string;
    label: string;
    left?: string;
    right?: string;
    tone?: "red" | "black" | "neutral";
  }>;
};

export type LinkedListDiagram = {
  kind: "linked-list";
  title?: string;
  description?: string;
  values: string[];
  nullLabel?: string;
};

export type Choice = {
  id: string;
  text: string;
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
  course?: string;
  subject?: string;
  term?: string;
  examType?: string;
  sourceNotice?: string;
  sourceFiles?: ExamSourceFile[];
  questions: Question[];
};

export type ExamSourceFile = {
  label: string;
  path?: string;
  url?: string;
  role: "exam" | "solution" | "support";
};

export type ExamCatalogEntry = {
  id: string;
  title: string;
  subtitle: string;
  course: string;
  subject: string;
  term: string;
  examType: string;
  questionCount: number;
  points: number;
  autoGraded: boolean;
  sourceNotice?: string;
  status?: "ready" | "source-qc" | "digitizing";
};

export type AnswerState = Record<string, string | string[]>;
export type ManualState = Record<string, number>;
export type FlagState = Record<string, boolean>;

export type JavaStatus = {
  available: boolean;
  message: string;
  languages?: CodeLanguage[];
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
