import type { Question } from "@/app/lib/exam-types";
import { computerContext, roomContext } from "./contexts";

export function splitTracingQuestion(question: Question): Question[] {
  function splitPairedLegalPrompts(code: string) {
    return code
      .replace(
        /M\.\nPC p1 = new PC\(16\);\s+\/\/ legal or syntax error\nComputer c1 = new PC\(\);\s+\/\/ legal or syntax error/,
        `M1.
PC p1 = new PC(16);        // legal or syntax error

M2.
Computer c1 = new PC();    // legal or syntax error`,
      )
      .replace(
        /N\.\nMac m1 = new Computer\(12\);\s+\/\/ legal or syntax error\nPC m2 = new Mac\(10, 8\);\s+\/\/ legal or syntax error/,
        `N1.
Mac m1 = new Computer(12); // legal or syntax error

N2.
PC m2 = new Mac(10, 8);    // legal or syntax error`,
      )
      .replace(
        /O\.\nObject obj = Room\(\);\s+\/\/ legal or syntax error\nRoom r1 = new Classroom\(10, 10\);\s+\/\/ legal or syntax error/,
        `O1.
Object obj = Room();             // legal or syntax error

O2.
Room r1 = new Classroom(10, 10); // legal or syntax error`,
      )
      .replace(
        /P\.\nMeeting m1 = new Object\(5\);\s+\/\/ legal or syntax error\nMeeting m2 = new Classroom\(10, 10\); \/\/ legal or syntax error/,
        `P1.
Meeting m1 = new Object(5);        // legal or syntax error

P2.
Meeting m2 = new Classroom(10, 10); // legal or syntax error`,
      );
  }

  if (question.id === "e1-q2" && question.code && question.answers) {
    const contextStart = question.code.indexOf("\nFor M through V consider these classes:");
    const mStart = question.code.indexOf("\nM.\n", contextStart);
    return [
      {
        ...question,
        id: "e1-q2a",
        title: "2. Code Tracing A-L",
        points: 12,
        code: question.code.slice(0, contextStart).trim(),
        answers: question.answers.slice(0, 12),
      },
      {
        ...question,
        id: "e1-q2b",
        title: "2. Code Tracing M-V",
        points: 10,
        prompt:
          "For M through V, use the Computer, PC, and Mac definitions in the reference block. For each statement, answer legal or syntax error; for each snippet, state the exact output or error.",
        reference: computerContext,
        code: splitPairedLegalPrompts(question.code.slice(mStart + 1).trim()),
        answers: [
          "syntax error",
          "legal",
          "syntax error",
          "syntax error",
          ...question.answers.slice(14),
        ],
        answerPoints: [0.5, 0.5, 0.5, 0.5, ...Array(8).fill(1)],
      },
    ];
  }

  if (question.id === "e2-q2" && question.code && question.answers) {
    const contextStart = question.code.indexOf("\nFor O through X consider these classes:");
    const oStart = question.code.indexOf("\nO.\n", contextStart);
    return [
      {
        ...question,
        id: "e2-q2a",
        title: "2. Code Tracing A-N",
        points: 14,
        code: question.code.slice(0, contextStart).trim(),
        answers: question.answers.slice(0, 14),
      },
      {
        ...question,
        id: "e2-q2b",
        title: "2. Code Tracing O-X",
        points: 10,
        prompt:
          "For O through X, use the Room, Meeting, and Classroom definitions in the reference block. For each statement, answer legal or syntax error; for each snippet, state the exact output or error.",
        reference: roomContext,
        code: splitPairedLegalPrompts(question.code.slice(oStart + 1).trim()),
        answers: [
          "syntax error",
          "legal",
          "syntax error",
          "syntax error",
          ...question.answers.slice(16),
        ],
        answerPoints: [0.5, 0.5, 0.5, 0.5, ...Array(8).fill(1)],
      },
    ];
  }

  return [question];
}

