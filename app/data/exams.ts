import { cs314ExamOne } from "./cs314-exam-one";
import { cs314ExamThree } from "./cs314-exam-three";
import { cs314ExamTwo } from "./cs314-exam-two";
import { examOne } from "./exam-one";
import { examTwo } from "./exam-two";
import { splitTracingQuestion } from "./split-tracing";

export const exams = [examOne, examTwo, cs314ExamOne, cs314ExamTwo, cs314ExamThree].map((exam) => ({
  ...exam,
  questions: exam.questions.flatMap(splitTracingQuestion),
}));
