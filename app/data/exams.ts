import type { Exam, ExamCatalogEntry } from "@/app/lib/exam-types";
import { splitTracingQuestion } from "./split-tracing";

type ExamModule = Record<string, Exam>;

type ExamRegistryEntry = ExamCatalogEntry & {
  load: () => Promise<ExamModule>;
  exportName: string;
};

const registry: ExamRegistryEntry[] = [
  {
    id: "sample-1",
    title: "CS 312 Sample Credit by Exam 1",
    subtitle: "UT Austin Computer Science sample exam",
    course: "CS 312",
    subject: "Computer Science",
    term: "Sample",
    examType: "Credit by Exam",
    questionCount: 8,
    points: 100,
    autoGraded: true,
    status: "ready",
    load: () => import("./exam-one"),
    exportName: "examOne",
  },
  {
    id: "sample-2",
    title: "CS 312 Sample Credit by Exam 2",
    subtitle: "UT Austin Computer Science sample exam",
    course: "CS 312",
    subject: "Computer Science",
    term: "Sample",
    examType: "Credit by Exam",
    questionCount: 8,
    points: 100,
    autoGraded: true,
    status: "ready",
    load: () => import("./exam-two"),
    exportName: "examTwo",
  },
  {
    id: "cs314-fall-2025-e1",
    title: "CS 314 Fall 2025 Exam 1",
    subtitle: "Data structures, generics, matrices, and multisets",
    course: "CS 314",
    subject: "Computer Science",
    term: "Fall 2025",
    examType: "Exam 1",
    questionCount: 4,
    points: 100,
    autoGraded: true,
    status: "ready",
    load: () => import("./cs314-exam-one"),
    exportName: "cs314ExamOne",
  },
  {
    id: "cs314-fall-2025-e2",
    title: "CS 314 Fall 2025 Exam 2",
    subtitle: "Linked structures, stacks, queues, and trees",
    course: "CS 314",
    subject: "Computer Science",
    term: "Fall 2025",
    examType: "Exam 2",
    questionCount: 4,
    points: 100,
    autoGraded: true,
    status: "ready",
    load: () => import("./cs314-exam-two"),
    exportName: "cs314ExamTwo",
  },
  {
    id: "cs314-fall-2025-e3",
    title: "CS 314 Fall 2025 Exam 3",
    subtitle: "Graphs, trees, hashing, and algorithm analysis",
    course: "CS 314",
    subject: "Computer Science",
    term: "Fall 2025",
    examType: "Exam 3",
    questionCount: 4,
    points: 100,
    autoGraded: true,
    status: "ready",
    load: () => import("./cs314-exam-three"),
    exportName: "cs314ExamThree",
  },
  {
    id: "ch301-practice",
    title: "CH 301 Practice Questions",
    subtitle: "Atomic structure, gases, bonding, thermodynamics, and intermolecular forces",
    course: "CH 301",
    subject: "Chemistry",
    term: "Practice",
    examType: "Practice Questions",
    questionCount: 23,
    points: 23,
    autoGraded: true,
    status: "ready",
    load: () => import("./chemistry-ch301"),
    exportName: "ch301Practice",
  },
  {
    id: "bio311c-2007-exam-1",
    title: "BIO 311C Spring 2007 Exam 1",
    subtitle: "Cell chemistry, cell structure, prokaryotes, and organelles",
    course: "BIO 311C",
    subject: "Biology",
    term: "Spring 2007",
    examType: "Exam 1",
    questionCount: 41,
    points: 70,
    autoGraded: true,
    status: "ready",
    load: () => import("./biology-2007-exam-one"),
    exportName: "bio311c2007ExamOne",
  },
];

export const examCatalog: ExamCatalogEntry[] = registry.map((entry) => ({
  id: entry.id,
  title: entry.title,
  subtitle: entry.subtitle,
  course: entry.course,
  subject: entry.subject,
  term: entry.term,
  examType: entry.examType,
  questionCount: entry.questionCount,
  points: entry.points,
  autoGraded: entry.autoGraded,
  sourceNotice: entry.sourceNotice,
  status: entry.status,
}));

export async function loadExam(examId: string) {
  const entry = registry.find((item) => item.id === examId) ?? registry[0];
  const loadedModule = await entry.load();
  const exam = loadedModule[entry.exportName];
  return {
    ...exam,
    course: exam.course ?? entry.course,
    subject: exam.subject ?? entry.subject,
    term: exam.term ?? entry.term,
    examType: exam.examType ?? entry.examType,
    sourceNotice: exam.sourceNotice ?? entry.sourceNotice,
    questions: exam.questions.flatMap(splitTracingQuestion),
  };
}

export async function loadAllExams() {
  return Promise.all(examCatalog.map((item) => loadExam(item.id)));
}
