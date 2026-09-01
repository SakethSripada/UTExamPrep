import type { Exam } from "@/app/lib/exam-types";

export const ece306Fall2025ExamTwo: Exam = {
  id: "ece306-fall-2025-e2",
  title: "ECE 306 Fall 2025 Exam 2",
  subtitle: "LC-3 control, TRAP I/O, linked lists, and microarchitecture",
  course: "ECE 306",
  subject: "Electrical and Computer Engineering",
  term: "Fall 2025",
  examType: "Exam 2",
  sourceNotice:
    "Hand-digitized from the November 12, 2025 ECE 306 midterm and official solution. The source's blank-answer boilerplate is preserved in context. The printed ASCII_R line is visibly .FILL x005 in both the exam and solution; this digitization retains that source typo rather than silently changing it.",
  sourceFiles: [
    {
      label: "Original exam",
      path: "exampdfs/ee306/2025-fall/exam-2-exam-2025-fall-exam-2.pdf",
      role: "exam",
    },
    {
      label: "Official solution",
      path: "exampdfs/ee306/2025-fall/exam-2-solution-2025-fall-exam-2-solutions.pdf",
      role: "solution",
    },
  ],
  questions: [
    {
      id: "ece306-fall-2025-e2-q1",
      title: "1. LC-3 State Machine Fundamentals",
      points: 20,
      type: "short",
      gradingMode: "auto",
      codePresentation: true,
      prompt:
        "Answer the four source parts about LC-3 state-machine control, assembly, and clock cycles. The source boilerplate says an unanswered question earns one point out of five; this practice version instead scores the supplied responses.",
      reference: `Part A asks for the controls in state #18. For comparison, the source gives this state #30 example:
LD.IR / Load; Gate.MDR / YES; every other Gate_x / NO; J / 100000; COND / 000; IRD / 0.

Part B instruction at x3000:
LD R2, KBDR
KBDR corresponds to memory location xFE02.

Part D:
X     ADD R3, R3, #0     ; use R3
      LEA R3, Y
Assume X = x3320, Y = x3340, and every memory access takes 4 clock cycles.`,
      code: `A1. State #18: LD.PC value.
A2. State #18: LD.MAR value.
A3. State #18: Gate.PC value.
A4. State #18: PCMUX value.
A5. State #18: J bits.
A6. State #18: COND bits.
A7. State #18: IRD bit.
A8. State #18: all remaining Gate_x and Load_x values.
B. What happens when the Part B assembly instruction is processed?
C. What must be true about a program if state #20 is carried out?
D. How many clock cycles execute the Part D segment?`,
      answers: [
        "Load",
        "Load",
        "YES",
        "PC+1",
        "011100",
        "000",
        "0",
        "all other Gate_x = NO and all other Load_x = NO",
        "assembler error: PCoffset9 out of range or PCoffset9 is out of range",
        "the program contains at least one JSRR instruction or at least one JSRR",
        "16",
      ],
      answerPoints: [1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4],
      officialSolution:
        "A. State #18 uses LD.PC/Load, LD.MAR/Load, Gate.PC/YES, PCMUX/PC+1, J/011100, COND/000, IRD/0, and every other Gate_x and Load_x signal is NO.\nB. The assembler reports an error because PCoffset9 is out of range.\nC. The program must contain at least one JSRR instruction.\nD. The segment takes 16 cycles: 8 for ADD and 8 for LEA under the stated memory timing.",
      rubric: [{ label: "Auto-graded state-machine, assembly, and timing answers", points: 20 }],
    },
    {
      id: "ece306-fall-2025-e2-q2",
      title: "2. D-pad TRAP Service Routine",
      points: 20,
      type: "short",
      gradingMode: "auto",
      codePresentation: true,
      prompt:
        "Complete the memory-mapped game-controller routine. It waits for a D-pad input, then returns the ASCII code for U, D, L, or R in R0. All registers except R0 must be restored.",
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e2-dpad.svg",
          width: 1320,
          height: 620,
          title: "D-pad and direction encodings",
          alt: "A directional pad labeled Up, Down, Left, Right and four bit fields: Up 1000, Down 0100, Left 0010, Right 0001.",
          description: "D-pad layout with bit positions [3:0]. GC_SR is xFEA0 and GC_DR is xFEA2.",
        },
      ],
      reference: `.ORIG x2000
GET_DPAD  ST R1, SAVE_R1
POLL      LDI R1, __________
          BRzp POLL
          ___________________
          LD R0, UP_MASK
          AND R0, R0, R1
          BRnp IS_UP
          ___________________
          ___________________
          BRnp IS_DOWN
          ___________________
          ___________________
          BRnp IS_LEFT
          LD R0, ASCII_R
          BRnzp DONE
IS_UP     LD R0, ASCII_U
          BRnzp DONE
IS_DOWN   LD R0, ASCII_D
          BRnzp DONE
IS_LEFT   LD R0, ASCII_L
DONE      ___________________
          RTI

SAVE_R1   .BLKW #1
GCSR      .FILL _______
GCDR      .FILL _______
UP_MASK   .FILL _______
DOWN_MASK .FILL _______
LEFT_MASK .FILL _______
ASCII_U   .FILL x0055
ASCII_D   .FILL x0044
ASCII_L   .FILL x004C
ASCII_R   .FILL x005    ; source text is x005 in both PDF files
.END`,
      code: `A. 200 cycles at 50 Hz is how many seconds?
B1. Label after LDI R1 in POLL.
B2. Complete the data-register load immediately after BRzp POLL.
B3. Complete the load before BRnp IS_DOWN.
B4. Complete the mask operation before BRnp IS_DOWN.
B5. Complete the load before BRnp IS_LEFT.
B6. Complete the mask operation before BRnp IS_LEFT.
B7. Complete the restore instruction at DONE.
B8. GCSR constant.
B9. GCDR constant.
B10. Give UP_MASK, DOWN_MASK, LEFT_MASK in that order, separated by commas.`,
      answers: [
        "4 seconds or 4",
        "GCSR",
        "LD R1, GCDR",
        "LD R1, DOWN_MASK",
        "AND R0, R0, R1",
        "LD R1, LEFT_MASK",
        "AND R0, R0, R1",
        "LD R1, SAVE_R1",
        "xFEA0",
        "xFEA2",
        "x0008, x0004, x0002",
      ],
      answerPoints: [4, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
      officialSolution:
        "A. 200 cycles / 50 cycles per second = 4 seconds.\nB. Fill the routine with GCSR; LD R1, GCDR; LD R1, DOWN_MASK; AND R0, R0, R1; LD R1, LEFT_MASK; AND R0, R0, R1; and LD R1, SAVE_R1. The constants are GCSR=xFEA0, GCDR=xFEA2, UP_MASK=x0008, DOWN_MASK=x0004, LEFT_MASK=x0002.",
      rubric: [{ label: "Auto-graded timing, routine blanks, and memory-map constants", points: 20 }],
    },
    {
      id: "ece306-fall-2025-e2-q3",
      title: "3. Linked-list Insertion Performance",
      points: 30,
      type: "short",
      gradingMode: "hybrid",
      codePresentation: true,
      prompt:
        "A player node has two words: next pointer followed by the unsigned 16-bit jersey number. R0 starts at the address of HEAD, R1 is the jersey number to insert, and R6 points to two available words for a new node. The list is sorted smallest to largest.",
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e2-player-list.svg",
          width: 1320,
          height: 620,
          title: "Source player linked-list representation",
          alt: "R0 points to HEAD, which points to a two-word Node 0. Node 0 points to Node 1, then a dashed continuation to Node N minus 1, whose next pointer is x0000.",
          description: "Each node's first word is its next pointer and second word is its player number.",
        },
      ],
      reference: `.ORIG x3050
SEARCHANDINSERT  NOT R5, R1
                 ADD R5, R5, #1
LOOP1            ADD R4, R0, #0
                 LDR R0, R0, #0
                 BRz NEWNODE
                 LDR R2, R0, #1
                 ADD R3, R2, R5
                 BRnz LOOP1
INSERT           STR R1, R0, #1
                 ADD R1, R2, #0
LOOP2            ADD R4, R0, #0
                 LDR R0, R0, #0
                 BRz NEWNODE
                 LDR R3, R0, #1
                 STR R1, R0, #1
                 ADD R1, R3, #0
                 BR LOOP2
NEWNODE          STR R6, R4, #0
                 AND R4, R4, #0
                 STR R4, R6, #0
                 STR R1, R6, #1
DONE             RET
.END`,
      code: `A. If list size doubles, what happens to the average search time N?
B. If R4 already identifies a node, what happens to average insertion time M when list size doubles?
D1. First replacement instruction after crossing out INSERT through BR LOOP2.
D2. Second replacement instruction.
D3. Third replacement instruction.
D4. Fourth replacement instruction.`,
      answers: [
        "doubles",
        "stays the same or unchanged",
        "STR R6, R4, #0",
        "STR R1, R6, #1",
        "STR R0, R6, #0",
        "BRnzp DONE",
      ],
      answerPoints: [3, 3, 4, 4, 4, 3],
      workRequired: true,
      workPoints: 9,
      workRows: 12,
      workPrompt:
        "Part C (9 points): Explain the performance flaw. Identify the two traversals and why a linked list allows the second one to be avoided by pointer manipulation. Part D's four code rows above are the replacement for the crossed-out INSERT through BR LOOP2 block.",
      workRubric: [
        { label: "Identifies the traversal that locates the insert position", points: 3 },
        { label: "Identifies the unnecessary traversal that shifts jersey data", points: 3 },
        { label: "Explains O(1) insertion by relinking next pointers after the predecessor is known", points: 3 },
      ],
      officialSolution:
        "A. N doubles.\nB. M stays the same.\nC. The original code traverses the list once to find where to insert, then a second time to shift player-number data. That second traversal is unnecessary for a linked list: once the predecessor is known, insert by changing next pointers.\nD. Replace INSERT through BR LOOP2 with:\nSTR R6, R4, #0\nSTR R1, R6, #1\nSTR R0, R6, #0\nBRnzp DONE",
      rubric: [
        { label: "Auto-graded scaling answers and replacement instructions", points: 21 },
        { label: "Linked-list performance explanation", points: 9 },
      ],
    },
    {
      id: "ece306-fall-2025-e2-q4",
      title: "4. New LC-3 Instruction",
      points: 30,
      type: "short",
      gradingMode: "auto",
      codePresentation: true,
      prompt:
        "Opcode 1101 defines a new LC-3 instruction with SR1, SR2, and PCoffset6. The source diagrams show a TEMP register, a SEL2 mux before the ALU B input, a SEL1 mux before the ALU A input, and the modified microsequencer. Fill the state-machine and control-store facts named below.",
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e2-instruction-datapath.svg",
          width: 1400,
          height: 900,
          title: "Instruction format and modified datapath",
          alt: "Opcode 1101 with fields SR1, SR2, and PCoffset6. The focused LC-3 datapath redraw highlights TEMP and the SEL1 and SEL2 multiplexers before the ALU.",
          description: "Focused datapath: TEMP can capture SR1OUT, SEL2 chooses TEMP, ONE, or SR2OUT, and SEL1 chooses a zero path or SR1OUT.",
        },
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e2-microsequencer-control.svg",
          width: 1400,
          height: 940,
          title: "Modified microsequencer and incomplete control store",
          alt: "A focused microsequencer redraw with Z and an AND-plus-mux change, alongside a five-row control-store table whose second and third state-number cells are blank.",
          description: "The source's missing control-store state numbers are represented by the bold blank cells.",
        },
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e2-state-machine.svg",
          width: 980,
          height: 1040,
          title: "Incomplete state machine for opcode 1101",
          alt: "A state machine begins at state 32. It has blanks for states after 32 and after the first new state, plus blank action boxes and a Z test at state 61.",
          description: "Use the named response fields rather than trying to draw on the diagram.",
        },
      ],
      reference: `Instruction format:
bits 15:12 = 1101
bits 11:9  = SR1
bits 8:6   = SR2
bits 5:0   = PCoffset6

Control-store rows (column order: state number, COND, J, LD.PC, LD.CC, LD.TEMP, GateALU, PCMUX, SEL2, SEL1, ADDR1MUX, ADDR2MUX, SR1MUX, ALUK):
51 | 000 | 111101 | 0 | 1 | 1 | 1 | X     | TEMP | SR1OUT | X  | X         | IR[8:6]  | ADD
__ | 000 | 101111 | 0 | 0 | 1 | 1 | X     | X    | SR1OUT | X  | X         | IR[11:9] | NOT
__ | 000 | 010010 | 1 | 0 | 0 | 0 | ADDER | X    | X      | PC | offset6   | X        | X
61 | 100 | 110010 | 0 | 0 | 0 | 0 | X     | X    | X      | X  | X         | X        | X
47 | 000 | 110011 | 0 | 0 | 1 | 1 | X     | ONE  | TEMP   | X  | X         | X        | ADD`,
      code: `A1. State number reached from state 32 when IR[15:12] = 1101.
A2. State number immediately after that first new state.
A3. Action in state 47.
A4. Action in state 51.
A5. State-61 test/action label.
A6. State number on the state-61 path when Z = 1.
A7. Action in state 50.
A8. The two missing control-store state numbers, in row order.
B. In 20 words or fewer, what does the new instruction do?`,
      answers: [
        "13",
        "47",
        "TEMP <- TEMP + 1 or TEMP = TEMP + 1",
        "TEMP <- TEMP + SR2; set CC or TEMP = TEMP + SR2 and set CC",
        "[Z] or test Z",
        "50",
        "PC <- PC + PCoffset6 or PC = PC + PCoffset6",
        "13, 50",
        "Branch if SR1 = SR2 or branch when SR1 equals SR2",
      ],
      answerPoints: [2, 2, 3, 3, 2, 2, 3, 3, 10],
      officialSolution:
        "State sequence: 32 --1101--> 13: TEMP <- NOT(SR1), then 47: TEMP <- TEMP + 1, then 51: TEMP <- TEMP + SR2 and set CC, then 61: test [Z]. Z=0 goes to state 18; Z=1 goes to 50: PC <- PC + PCoffset6, then state 18. The missing control-store state numbers are 13 and 50. The instruction branches if SR1 = SR2.",
      solutionDiagrams: [
        {
          kind: "source",
          src: "/exam-assets/ee306/ece306-e2-state-machine-solution.svg",
          width: 980,
          height: 1040,
          title: "Completed opcode-1101 state machine",
          alt: "State 32 goes to 13, then 47, 51, and 61. A false Z branch goes to 18; true goes to state 50, which updates PC by PCoffset6 and then goes to 18.",
        },
      ],
      rubric: [{ label: "Auto-graded state-machine, control-store, and instruction-behavior answers", points: 30 }],
    },
  ],
};
