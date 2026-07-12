import type { Exam } from "@/app/lib/exam-types";

export const ece306Fall2025ExamOne: Exam = {
  id: "ece306-fall-2025-e1",
  title: "ECE 306 Fall 2025 Exam 1",
  subtitle: "LC-3, logic completeness, state machines, CMOS, and debugging",
  course: "ECE 306",
  subject: "Electrical and Computer Engineering",
  term: "Fall 2025",
  examType: "Exam 1",
  sourceNotice:
    "Hand-digitized from the October 8, 2025 ECE 306 midterm and its official solution. The paper's one-point credit for a blank five-point item is retained as a source note; this practice interface scores submitted responses and review work instead.",
  sourceFiles: [
    {
      label: "Original exam",
      path: "exampdfs/ee306/2025-fall/exam-1-exam-2025-fall-exam-1.pdf",
      role: "exam",
    },
    {
      label: "Official solution",
      path: "exampdfs/ee306/2025-fall/exam-1-solution-2025-fall-exam-1-solutions.pdf",
      role: "solution",
    },
  ],
  questions: [
    {
      id: "ece306-fall-2025-e1-q1",
      title: "1. LC-3 and Logic Fundamentals",
      points: 20,
      type: "short",
      gradingMode: "hybrid",
      codePresentation: true,
      prompt:
        "Answer Parts A-C, then give the explicit NAND-only proof requested in Part D. The source awarded one point for an unanswered five-point item; this practice version instead leaves it unearned until a response is provided.",
      reference: `Part A instruction sequence (before execution, M[x3050] stores the two's-complement integer x):
x3000: 0010 011 001001111
x3001: 0000 011 000000011
x3002: 1001 011 011 111111
x3003: 0001 011 011 1 00001
x3004: 0011 011 001001011
x3005: 1111 0000 0010 0101`,
      code: `A. What does M[x3050] contain after the Part A code executes?
B. What benefit does LC-3 opcode 0110 (LDR) provide over opcode 0010 (LD)?
C. What is the maximum number of LC-3 system calls that opcode 1111 could provide?`,
      answers: [
        "absolute value of x or |x| or abs(x)",
        "LDR can load from memory locations beyond the PC-relative range or LDR accesses memory beyond the PC-relative range",
        "2^8 or 256",
      ],
      answerPoints: [5, 5, 5],
      workRequired: true,
      workPoints: 5,
      workRows: 12,
      workPrompt:
        "Part D (5 points): Explicitly prove that NAND alone is logically complete. Show a NAND-only NOT construction, a NAND-only AND construction, and why those constructions are enough to obtain OR and every truth-table function. Do not leave any step implicit.",
      workRubric: [
        { label: "Constructs NOT by tying both NAND inputs to the same signal", points: 1.5 },
        { label: "Constructs AND by inverting a NAND output with a tied-input NAND", points: 1.5 },
        { label: "Explains how NOT and AND yield OR through De Morgan's law", points: 1 },
        { label: "Concludes explicitly that NAND is logically complete", points: 1 },
      ],
      officialSolution:
        "A. M[x3050] contains the absolute value of x.\nB. LDR can load from memory locations beyond the PC-relative range.\nC. There are 2^8 = 256 possible system-call vectors.\nD. NAND(A, A) = NOT A. Let N = NAND(A, B); then NAND(N, N) = A AND B. Since NAND supplies NOT and AND, De Morgan gives A OR B = NOT(NOT A AND NOT B). Having NOT, AND, and OR lets us implement every truth-table function, so NAND is logically complete.",
      rubric: [
        { label: "Auto-graded LC-3 and system-call answers", points: 15 },
        { label: "Explicit NAND-completeness proof", points: 5 },
      ],
    },
    {
      id: "ece306-fall-2025-e1-q2",
      title: "2. Moore State Machine",
      points: 15,
      type: "short",
      gradingMode: "auto",
      prompt:
        "Complete the source Moore machine and its truth table. State bits are S1S0; the top-right state is 01. The response list below names each source blank so every objective entry can be scored individually.",
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e1-moore-machine.svg",
          width: 1320,
          height: 1180,
          title: "Incomplete Moore machine and truth table",
          alt: "A four-state Moore machine arranged in a square, with incomplete state labels, transition labels, and an eight-row truth table.",
          // description: "This hand-drawn source visual preserves the state layout, transition directions, and blank locations from the paper exam.",
        },
      ],
      code: `A1. Diagram: output Y in state 00.
A2. Diagram: X label on transition 01 -> 00.
A3. Diagram: X label on transition 01 -> 10.
A4. Diagram: 2-bit label of the lower-left state.
A5. Diagram: output Y in the lower-left state.
A6. Diagram: 2-bit label of the lower-right state.
B1. Truth table row current state 00, X = 0: next state S1'S0'.
B2. Truth table row current state 00, X = 1: output Y.
B3. Truth table row current state 01, X = 1: output Y.
B4. Truth table row current state 10, X = 0: next state S1'S0'.
B5. Truth table row current state 11, X = 0: next state S1'S0'.
B6. Truth table row current state 11, X = 0: output Y.
B7. Truth table row current state 11, X = 1: next state S1'S0'.
B8. Truth table row current state 11, X = 1: output Y.`,
      answers: ["0", "0", "1", "10", "0", "11", "00", "0", "0", "00", "00", "1", "11", "1"],
      answerPoints: [1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      officialSolution:
        "Diagram: state 00 has Y = 0; 01 -> 00 is X = 0; 01 -> 10 is X = 1; the lower-left state is 10 with Y = 0; the lower-right state is 11 with Y = 1.\n\nTruth table:\n00, X=0 -> 00, Y=0\n00, X=1 -> 01, Y=0\n01, X=0 -> 00, Y=0\n01, X=1 -> 10, Y=0\n10, X=0 -> 00, Y=0\n10, X=1 -> 11, Y=0\n11, X=0 -> 00, Y=1\n11, X=1 -> 11, Y=1",
      rubric: [{ label: "Source machine and truth-table blanks", points: 15 }],
    },
    {
      id: "ece306-fall-2025-e1-q3",
      title: "3. CMOS Sprinkler Circuit",
      points: 15,
      type: "short",
      gradingMode: "hybrid",
      prompt:
        "A garden sprinkler should turn on only when it did not rain (R = 0), the water bill was not high (B = 0), and it is 9 pm (T = 1). Analyze the attempted CMOS circuit, then explain and correct it.",
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e1-sprinkler-incorrect.svg",
          width: 1040,
          height: 1140,
          title: "Attempted CMOS sprinkler circuit",
          alt: "An attempted CMOS circuit with a three-transistor pMOS series stack controlled by R, T, and B; the nMOS network has R and B in parallel followed by T in series.",
          description: "The original circuit is recreated as vector art; bubbles indicate pMOS gates.",
        },
      ],
      code: `A. Give the intended logic equation for G in terms of R, B, and T.`,
      answers: ["G = R'B'T or R' B' T or not R and not B and T"],
      answerPoints: [3],
      workRequired: true,
      workPoints: 12,
      workRows: 15,
      workPrompt:
        "Part B (6 points): Give two specific reasons the attempted circuit does not work.\n\nPart C (6 points): Describe or sketch a correct transistor-level circuit. State how T is inverted and how R, T', and B connect in the pull-up and pull-down networks. Multiple correct circuits are possible.",
      workRubric: [
        { label: "Explains why T' is needed at the transistor gates", points: 3 },
        { label: "Explains why the nMOS T device must be parallel with R and B", points: 3 },
        { label: "Includes a T inverter and the correct pMOS series topology", points: 3 },
        { label: "Includes the correct parallel nMOS topology and output G", points: 3 },
      ],
      officialSolution:
        "A. G = R'B'T.\nB. The transistor gates should use T', not T. Also, the T transistor on the nMOS side should be in parallel with the R and B transistors.\nC. The shown simplest correction first inverts T to make T'. The pMOS pull-up network is a series path controlled by R, T', and B. The nMOS pull-down network has parallel devices controlled by R, T', and B, with G at the common output.",
      solutionDiagrams: [
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e1-sprinkler-correct.svg",
          width: 1160,
          height: 1040,
          title: "One correct CMOS solution",
          alt: "A corrected CMOS sprinkler circuit with a T inverter; pMOS devices controlled by R, T prime, and B in series; nMOS devices controlled by R, T prime, and B in parallel.",
          description: "The official solution notes that other correct circuits are possible; this is its simplest topology.",
        },
      ],
      rubric: [
        { label: "Auto-graded intended logic equation", points: 3 },
        { label: "Circuit-analysis reasons and corrected topology", points: 12 },
      ],
    },
    {
      id: "ece306-fall-2025-e1-q4",
      title: "4. Integer-Division Debugging",
      points: 25,
      type: "short",
      gradingMode: "hybrid",
      codePresentation: true,
      prompt:
        "The program divides M[x300A] by M[x300B], discarding the remainder and storing the quotient in R2. Its initial PC is x3000. There is exactly one bug. Use the source memory snapshot below.",
      formulas: [
        {
          ariaLabel: "R two equals memory at x three zero zero A divided by memory at x three zero zero B",
          mathml: "<mrow><msub><mi>R</mi><mn>2</mn></msub><mo>=</mo><mfrac><mrow><mi>M</mi><mo>[</mo><mi>x300A</mi><mo>]</mo></mrow><mrow><mi>M</mi><mo>[</mo><mi>x300B</mi><mo>]</mo></mrow></mfrac></mrow>",
          caption: "Integer division discards the remainder.",
        },
      ],
      reference: `Initial PC: x3000

Address  Contents              Notes from the official solution
x3000    0010 000 000001001    R0 <- M[x300A] = x3025
x3001    0010 001 000001001    R1 <- M[x300B] = x1000
x3002    0101 010 010 1 00000 R2 <- R2 & 0 = 0
x3003    1001 001 001 111111
x3004    0001 001 001 1 00001 R1 <- -R1 = xF000
x3005    0001 000 000 0 00 001 R0 <- R0 + R1
x3006    0000 100 000000011    BRn #3 (the bug)
x3007    0001 010 010 1 00001 Increment R2
x3008    0000 111 111111100    Branch back to x3005
x3009    1111 0000 00100101    TRAP x25 / HALT
x300A    0011 000 000100101    dividend x3025
x300B    0001 000 000000000    divisor x1000
x300C+   x0000                 all remaining locations initially x0000`,
      code: `A. After 1 instruction, PC is x3001 and R0 is M[x300A]. What is PC after 10 instructions?`,
      answers: ["x3006"],
      answerPoints: [5],
      workRequired: true,
      workPoints: 20,
      workRows: 17,
      workPrompt:
        "Part B (10 points): In 15 words or fewer, identify the single bug.\n\nPart C (10 points): Explain why the program nevertheless halts with the correct quotient. Trace the relevant R0 values, the path through x300A onward, the eventual instruction at x3030, and why R2 remains correct.",
      workRubric: [
        { label: "Identifies the incorrect branch offset at x3006", points: 10 },
        { label: "Traces the negative R0 branch and store of xF025 at x3030", points: 4 },
        { label: "Explains the harmless x300B and non-branching x300C onward", points: 3 },
        { label: "Explains why xF025 halts and R2 stays 3", points: 3 },
      ],
      officialSolution:
        "A. PC = x3006.\nB. The branch offset at x3006 goes past TRAP x25.\nC. R0 moves x3025 -> x2025 -> x1025 -> x0025 -> xF025. When it becomes negative, BRn #3 reaches x300A rather than the intended halt path. x300A stores R0 = xF025 into x3030; x300B adds R0 to itself without affecting R2; x300C onward are zero instructions whose NZP bits do not branch. Execution reaches x3030, now TRAP x25, so it halts. R2 was never disturbed and remains the quotient, 3.",
      rubric: [
        { label: "Auto-graded ten-instruction PC", points: 5 },
        { label: "Bug identification and execution explanation", points: 20 },
      ],
    },
    {
      id: "ece306-fall-2025-e1-q5",
      title: "5. LC-3 Program Construction",
      points: 25,
      type: "short",
      gradingMode: "auto",
      codePresentation: true,
      prompt:
        "Implement f(x) = 7x. M[x3050] contains x; store 7x in M[x3051]. Each allowed instruction may be used at most once. The source prefilled x3002 and x3005. The paper refers to an LC-3 FSM at the end of the exam, but its final page is intentionally blank; the official solution confirms the Part B answer.",
      formulas: [
        {
          ariaLabel: "f of x equals seven x",
          mathml: "<mrow><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><mn>7</mn><mi>x</mi></mrow>",
          caption: "Use 1x + 2x + 4x.",
        },
      ],
      reference: `Allowed instruction list:
0010 000 001001110
1111 0000 00100101
0001 001 000 0 00 000
0001 001 001 0 00 000
0001 001 001 0 00 001
0001 010 010 1 11111
0000 100 111111100
0000 101 111111100
0011 001 001001000
0101 001 001 1 00000
0101 010 010 1 00000

Program rows already printed in the source:
x3002  0001 010 010 1 00011
x3005  0001 000 000 0 00 000`,
      code: `A1. Fill instruction at x3000.
A2. Fill instruction at x3001.
A3. Fill instruction at x3003.
A4. Fill instruction at x3004.
A5. Fill instruction at x3006.
A6. Fill instruction at x3007.
A7. Fill instruction at x3008.
A8. Fill instruction at x3009.
B. With every memory-access state taking 5 cycles, what are the contents of PC after 30 clock cycles?`,
      answers: [
        "0101 010 010 1 00000",
        "0010 000 001001110",
        "0101 001 001 1 00000",
        "0001 001 001 0 00 000",
        "0001 010 010 1 11111",
        "0000 101 111111100",
        "0011 001 001001000",
        "1111 0000 00100101",
        "x3003",
      ],
      answerPoints: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 5],
      officialSolution:
        "x3000  0101 010 010 1 00000\nx3001  0010 000 001001110\nx3002  0001 010 010 1 00011\nx3003  0101 001 001 1 00000\nx3004  0001 001 001 0 00 000\nx3005  0001 000 000 0 00 000\nx3006  0001 010 010 1 11111\nx3007  0000 101 111111100\nx3008  0011 001 001001000\nx3009  1111 0000 00100101\n\nAfter 30 clock cycles, PC contains x3003.",
      rubric: [
        { label: "Eight auto-graded LC-3 instruction rows", points: 20 },
        { label: "Auto-graded 30-cycle PC", points: 5 },
      ],
    },
  ],
};
