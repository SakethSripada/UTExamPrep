// Hand-digitized CS 439 (operating systems) archived exams, transcribed from
// the official exam and solution PDFs in exampdfs/cs439/. These exams vary too
// much across years to parse mechanically, so the content is curated here and
// merged into the generated archive by generate-cs-archive.mjs.
//
// The 2008 and 2009 exams were given as CS 372H (the honors OS course that
// became CS 439H); they are archived under CS 439 with the rest.

const sourceNotice = "Digitized from the official exam and paired official solution PDFs in the UT CS archive.";

function exam(id, title, subtitle, term, examType, sources, questions) {
  return {
    id,
    title,
    subtitle,
    course: "CS 439",
    subject: "Computer Science",
    term,
    examType,
    sourceNotice,
    sourceFiles: [
      { label: "Official exam PDF", path: sources[0], role: "exam" },
      { label: "Official solution PDF", path: sources[1], role: "solution" },
    ],
    questions: questions.map((question, index) => ({
      ...question,
      id: `${id}-q${index + 1}`,
      sourceNote: `${sources[0]}, question ${index + 1}`,
    })),
  };
}

export const cs439Exams = {
  // -------------------------------------------------------------------------
  // CS 372H Spring 2008 Midterm 1
  // -------------------------------------------------------------------------
  "cs439-2008-midterm": exam(
    "cs439-2008-midterm",
    "CS 439 2008 Midterm",
    "Virtual memory, the JOS boot process, and monitor-style synchronization",
    "2008",
    "Midterm",
    ["exampdfs/cs439/2008/exam-exam-midterm.pdf", "exampdfs/cs439/2008/exam-solution-solution.pdf"],
    [
      {
        title: "1. Virtual Memory",
        points: 20,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Suppose you need to implement the OS for a smart phone that provides a supervisor mode and facilities to enter supervisor mode on interrupt, exception, and trap. The hardware implements a RISC-style load/store instruction set. However, the hardware only has primitive virtual memory support: it has two base registers and two bounds registers for applications and a separate pair of base and bounds registers used when in supervisor mode. The hardware has no paging support. Unfortunately, all of your application software relies on 8 segments spread across a sparse address space. How could you modify the OS to support applications that require multiple segments per address space using this hardware?",
        officialSolution:
          "Load the code base and bounds and also one data segment base and bounds into the base and bounds registers. If an application accesses data from a different data segment, you will get a seg fault (exception). On such an exception, the OS should unload the current data base/bounds and load the ones needed for the current instruction. Slow, but it will work.",
        rubric: [
          { label: "Uses the fault/exception mechanism to detect accesses outside the loaded segment", points: 10 },
          { label: "OS swaps segment base/bounds registers on the fault and resumes", points: 10 },
        ],
      },
      {
        title: "2. Project (JOS Boot and Memory)",
        points: 40,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "This problem has four parts. Answer any three of the four parts. Part 1: In boot/main.c (bootmain shown in the reference), why in line 21 do we call the loaded kernel's entry point function using address (ELFHDR->e_entry & 0xFFFFFF) rather than calling the function using address (ELFHDR->e_entry)? Explain how the kernel code is written to ensure that the code invoked in this way works. Part 2: Recall your implementation of mon_backtrace() in lab 1, which prints all outstanding stack frames; by studying kern/entry.S you'll find there is an easy way to tell when to stop. How were you able to determine when to stop? Part 3: A question in lab 2 asks: after check_boot_pgdir(), i386_vm_init() maps the first four MB of virtual address space to the first four MB of physical memory, then deletes this mapping at the end of the function. Why is this mapping necessary? What would happen if it were omitted and why? Part 4: The file inc/memlayout.h defines KSTACKTOP to be 0xefc00000 (KERNBASE - 4MB), but KSTACKTOP is not the kernel stack address upon entry to i386_init(). Why couldn't we use KSTACKTOP as the kernel stack when the kernel was first invoked? How was the kernel's stack pointer address set before entry to i386_init, and how/where was the memory region for this initial stack allocated? When and how is the kernel's stack address changed to KSTACKTOP?",
        reference: `Part 1 refers to bootmain in boot/main.c:

\`\`\`
 1 void
 2 bootmain(void)
 3 {
 4     struct Proghdr *ph, *eph;
 5
 6     // read 1st page off disk
 7     readseg((uint32_t) ELFHDR, SECTSIZE*8, 0);
 8
 9     // is this a valid ELF?
10     if (ELFHDR->e_magic != ELF_MAGIC)
11         goto bad;
12
13     // load each program segment (ignores ph flags)
14     ph = (struct Proghdr *) ((uint8_t *) ELFHDR + ELFHDR->e_phoff);
15     eph = ph + ELFHDR->e_phnum;
16     for (; ph < eph; ph++)
17         readseg(ph->p_va, ph->p_memsz, ph->p_offset);
18
19     // call the entry point from the ELF header
20     // note: does not return!
21     ((void (*)(void)) (ELFHDR->e_entry & 0xFFFFFF))();
22
23 bad:
24     outw(0x8A00, 0x8A00);
25     outw(0x8A00, 0x8E00);
26     while (1)
27         /* do nothing */;
28 }
\`\`\`

Part 2 refers to the lab 1 backtrace output format:

\`\`\`
Stack backtrace:
  ebp f0109e58 eip f0100a62 args 00000001 f0109e80 f0109e98 f0100ed2 00000031
  ebp f0109ed8 eip f01000d6 args 00000000 00000000 f0100058 f0109f28 00000061
  ...
\`\`\`

The first line reflects the currently executing function (mon_backtrace itself), the second line the function that called it, and so on, printing all outstanding stack frames.`,
        officialSolution:
          "Part 1: The link address (ELFHDR->e_entry = 4GB - 256MB + 1MB) does not match the load address (1MB); the mask shifts the jump to the load address (where the code actually is) rather than the link address. The kernel begins with entry.S, assembly code that is location independent (so load != link is not a problem); entry.S sets up basic segmentation so that once it long-jumps to set the code segment register, the code appears to have been loaded at the link address.\nPart 2: The saved ebp is 0 for the final frame, so stop when ebp == 0.\nPart 3: When we turn on paging but before we turn off segmentation, segmentation maps VA KERNBASE to LA 0. We need LA 0 to still map to the desired physical address, so we install page mappings from LA 0 to kernel memory. Then we turn segmentation off, VA KERNBASE maps to LA KERNBASE, and the low mappings can be removed. If omitted, the machine crashes: when paging is turned on there are no mappings for the linear addresses in which the kernel is executing code.\nPart 4: Before page tables are set up, physical memory is mapped starting at KERNBASE, so KSTACKTOP would not map to any allocated memory. The initial stack (bootstack) is a memory region defined by linking instructions, so the binary image includes pages for the kernel stack at bootstack...bootstacktop; entry.S sets the stack pointer to bootstacktop. The kernel stack pointer is set to KSTACKTOP in trapentry.S, so the kernel's stack is changed to KSTACKTOP the first time a trap occurs (the memory at KSTACKTOP is the same memory as bootstack, remapped via paging).",
        rubric: [
          { label: "First part answered: matches the official reasoning", points: 13 },
          { label: "Second part answered: matches the official reasoning", points: 13 },
          { label: "Third part answered: matches the official reasoning", points: 14 },
        ],
      },
      {
        title: "3. Multi-Threaded Programming (Jurassic Park)",
        points: 40,
        type: "code",
        language: "c",
        gradingMode: "self",
        runnable: false,
        prompt:
          "Jurassic Park consists of a dinosaur museum and a park for safari riding. There are m passengers and n single-passenger cars. Passengers wander around the museum, then line up to take a ride in a safari car. When a car is available, it loads the one passenger it can hold and rides around the park for a random amount of time. If the n cars are all out riding passengers around, a passenger who wants a ride waits in a FIFO line; if a car is ready to load but there are no waiting passengers, the car waits in a FIFO line. Implement the ride object. Your solution must follow the coding standards specified in class.",
        reference: `The main function for a visitor thread is:

void visitor_main(...){
  int carId;
  museum->wander();           // You don't need to write this
  carId = ride->waitForCar(); // Returns id of car I will ride 0..n-1
  park->sightsee();           // You don't need to write this
  ride->getOutOfCar(carId);   // Postcondition: car can get in line
}

The main function for a car thread is:

void car_main(...){
  ride->waitForPassenger(myId); // Postcondition: passenger in car
  ride->cruiseUntilPassengerGetsOut(myId); // Postcondition: can get in line
}

Implement the ride object: list the member variables, then implement waitForCar, getOutOfCar, waitForPassenger, and cruiseUntilPassengerGetsOut.`,
        stub: `/* List the member variables for a ride object, then implement:
   int  ride::waitForCar();          // returns id of car I will ride 0..n-1
   void ride::getOutOfCar(int carId);
   void ride::waitForPassenger(int carId);
   void ride::cruiseUntilPassengerGetsOut(int carId);
*/
`,
        answer: `// Member variables
Lock mutex;
Cond carReady;
Cond passengerIn;
Cond passengerOut;
const int n = NCARS;
int carState[n];          // Each entry initialized to FREE
int nextTicketToGive = 0;
int nextTicketReady = 0;
int carsWaiting = 0;
List waitingCars;
int frontCarLoaded = 0;

int ride::waitForCar() { // Returns id of car I will ride 0..n-1
    mutex->lock();
    int myTicket = nextTicketToGive++;
    while (carsWaiting == 0 || myTicket != nextTicketReady) {
        carReady.wait(&mutex);
    }
    int myCar = waitingCars->getHead();
    frontCarLoaded = true;
    carState[myCar] = BUSY;
    passengerIn.broadcast(&mutex);
    mutex->unlock();
    return myCar;
}

void ride::getOutOfCar(int carId) { // Postcondition: car can get in line
    mutex->lock();
    carState[carId] = FREE;
    passengerOut.broadcast(&mutex);
    mutex->unlock();
}

void ride::waitForPassenger(int carId) { // Postcondition: passenger in car
    mutex->lock();
    carsWaiting++;
    waitingCars.add(carId);
    carReady->broadcast(&mutex);
    while (!frontCarLoaded && waitingCars->getHead() != carId) {
        passengerIn.wait(&mutex);
    }
    frontCarLoaded = 0;
    carsWaiting--;
    waitingCars.remove(carId);
    nextTicketReady++;
    carReady.broadcast(&mutex);
    mutex->unlock();
}

void ride::cruiseUntilPassengerGetsOut(int carId) { // Postcondition: can get in line
    mutex->lock();
    while (carState[carId] != FREE) {
        passengerOut.wait(&mutex);
    }
    mutex->unlock();
}`,
        rubric: [
          { label: "Member variables: lock, condition variables, FIFO state (tickets/queues)", points: 8 },
          { label: "waitForCar: FIFO ordering of passengers and correct waiting", points: 8 },
          { label: "getOutOfCar: frees the car and wakes the cruising thread", points: 8 },
          { label: "waitForPassenger: FIFO ordering of cars and correct handshake", points: 8 },
          { label: "cruiseUntilPassengerGetsOut: waits until the passenger leaves; coding standards followed", points: 8 },
        ],
      },
    ],
  ),

  // -------------------------------------------------------------------------
  // CS 372H Spring 2008 Final
  // -------------------------------------------------------------------------
  "cs439-2008-final": exam(
    "cs439-2008-final",
    "CS 439 2008 Final Exam",
    "Authentication, distributed agreement, file systems, virtual machines, and concurrency",
    "2008",
    "Final Exam",
    ["exampdfs/cs439/2008/final-exam-final-exam.pdf", "exampdfs/cs439/2008/final-solution-solution.pdf"],
    [
      {
        title: "1. Authentication: Jurisdiction",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "In the context of authentication protocols, define the meaning of \"jurisdiction\" and give an example of its use.",
        officialSolution:
          "If node A trusts node B's statements on some subject, then A believes B has jurisdiction. More formally, if A believes B has jurisdiction for statement X and A believes B believes X, then A believes X. Example: if A trusts B to be a key authority for C, and A believes B believes K is a good key for A and C to use to communicate, then A believes K is a good key to use for communication with C.",
        rubric: [
          { label: "Correct definition (trusted authority over a class of statements)", points: 4 },
          { label: "Reasonable example of its use", points: 4 },
        ],
      },
      {
        title: "2. Simultaneous Actions",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt: "What protocol can be used to ensure that two nodes are guaranteed to take the same action at the same time?",
        officialSolution:
          "No such protocol exists. It is impossible to guarantee this behavior (the Two Generals problem).",
        rubric: [{ label: "Recognizes impossibility (Two Generals problem)", points: 8 }],
      },
      {
        title: "3. Free-Block Tracking",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt: "Why is a bitmap a better choice than a linked list for tracking free disk blocks?",
        officialSolution:
          "You need to be able to place related data items near one another on disk. A bitmap can be indexed by location, while a linked list cannot (at reasonable cost).",
        rubric: [{ label: "Locality argument: bitmap supports allocation near a target location", points: 8 }],
      },
      {
        title: "4. Page-Fault Handling in JOS",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "In lab 4, the faultalloc test program allocated a new page at va on a page fault for a bad reference to va. You also ran faultallocbad, which replaced the cprintf calls with a call to sys_cputs((char *)0xDEADBEEF, 4). If things were working properly, faultallocbad died rather than allocate a new page. Why do faultalloc and faultallocbad behave differently?",
        reference: `The faultalloc program's umain looks like this:

void
umain(void)
{
    set_pgfault_handler(handler);
    cprintf("%s\\n", (char*)0xDeadBeef);
    cprintf("%s\\n", (char*)0xCafeBffe);
}`,
        officialSolution:
          "In faultalloc, the cprintf library function is user-space code that attempts to copy data from 0xDeadBeef and 0xCafeBffe to a buffer. This user-space code references illegal memory, causing a page fault that is sent back to user space and fixed. In contrast, in faultallocbad, we make a system call that causes the kernel to try to access bad memory, so the kernel fault handler just shuts down the user program.",
        rubric: [
          { label: "User-space fault is dispatched to the user handler and fixed", points: 4 },
          { label: "Kernel-mode access to a bad address kills the environment", points: 4 },
        ],
      },
      {
        title: "5. Hard Links",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt: "In file systems, what is a hard link?",
        officialSolution: "Hard links allow multiple directory entries to refer to the same file number.",
        rubric: [{ label: "Multiple directory entries referring to the same file number/inode", points: 8 }],
      },
      {
        title: "6. Hard Links in FAT",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt: "Why is it difficult to implement hard links in the FAT file system?",
        officialSolution:
          "Hard links allow multiple directory entries to refer to the same file number, but since FAT has no inode it stores file metadata in the directory entry. If we have multiple entries, which one stores the metadata (owner, modified time, permissions, link count)? How do we find the other copies when one is changed? Worst: how do we store a reference count so that delete/unlink works?",
        rubric: [
          { label: "FAT stores metadata in the directory entry (no inode)", points: 4 },
          { label: "Consequences: duplicated metadata, consistency, reference counting for unlink", points: 4 },
        ],
      },
      {
        title: "7. Virtual Machine Monitors",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "A hypervisor can run multiple unmodified operating systems on separate virtual machines. One challenge is that guest operating systems must run with the USER status bit set so that the hypervisor can limit what guest OSes can do. As a result, guest OS code cannot execute privileged instructions like lcr3() to install a page table for itself or for processes the guest OS creates. Describe how a hypervisor could ensure that unmodified guest operating systems function properly, while still ensuring isolation among the virtual machines and among processes within the guest OS.",
        officialSolution:
          "Two key ideas. (1) The hypervisor emulates privileged instructions for each virtual machine: when a guest OS executes a privileged instruction, the hardware traps and calls the hypervisor handler, which simulates the instruction for the guest OS. (2) Track whether the virtual machine is operating in virtual user mode or virtual kernel mode, so that if a user process tries to execute a privileged instruction we call the guest OS handler, but if the guest OS executes a privileged instruction we emulate it. Track virtual user/supervisor mode by tracking trap/interrupt/system call/iret instructions, all of which are dispatched to hypervisor handlers before being bounced back down to the guest OS handler.",
        rubric: [
          { label: "Trap-and-emulate for privileged instructions", points: 4 },
          { label: "Tracking virtual user vs. virtual kernel mode and dispatching accordingly", points: 4 },
        ],
      },
      {
        title: "8. Consistency Models",
        points: 8,
        type: "short",
        prompt:
          "Consider the following sequence of reads and writes (assume all values are initially 0; each operation occurs at the exact real-time moment specified for each line). Indicate whether each of the following statements is true or false.",
        code: `\`\`\`
Time    Node 1          Node 2          Node 3          Node 4
0:01    write(A, 12)    write(A, 22)
0:02    write(B, 13)    write(B, 23)
0:03    write(C, 14)    write(C, 24)    23 = read(B)    13 = read(B)
0:04    write(D, 15)    write(D, 25)    12 = read(A)    12 = read(A)
0:05                                    25 = read(D)    25 = read(D)
0:06                                    13 = read(B)    13 = read(B)
\`\`\`
A. The above system implements linearizability. (true or false)
B. The above system implements sequential consistency. (true or false)
C. The above system implements causal consistency. (true or false)`,
        answers: ["false", "true", "true"],
        answerPoints: [3, 3, 2],
        officialSolution:
          "A: False. At time 0:03 the two nodes read different results for the write of B issued at 0:02.\nB: True. An order consistent with all operations is write(A,22), write(A,12), write(B,23), write(B,13), write(C,14), write(C,24), write(D,15), write(D,25).\nC: True.",
      },
      {
        title: "9. Password Security",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Although passwords have limitations, sometimes they must be used for authentication. If you must design a system that uses passwords for authentication, describe three ways to improve their security.",
        officialSolution:
          "Force users to use long/varied passwords; don't store passwords (store a hash of password + salt); limit the rate of password guessing by adding delay after a missed password; don't send cleartext passwords across the network (send a challenge/response instead).",
        rubric: [
          { label: "First distinct mitigation", points: 3 },
          { label: "Second distinct mitigation", points: 3 },
          { label: "Third distinct mitigation", points: 2 },
        ],
      },
      {
        title: "10. Disk Geometry and Performance",
        points: 8,
        type: "short",
        prompt:
          "The MegaGiga hard disk rotates at 10000 rpm (6 ms/rotation) with a seek time given by 1 + 0.001t msec, where t is the number of tracks the arm seeks. Assume a block size of 512 bytes, 1024 sectors/track, 8192 tracks, and 4 platters. The disk has a 16MB track buffer. The disk controller can DMA read or write data between memory and the disk device at a rate of 100MB/sec.",
        code: `A. What is the storage capacity of this disk?
B. Estimate the worst case delay to read 512 bytes from this disk.
C. Estimate the expected time to read 20 consecutive MB from a random location on disk.`,
        answers: ["16GB", "15.2 ms", "285.9 ms"],
        answerPoints: [2, 3, 3],
        officialSolution:
          "A: 2^9 bytes/sector x 2^10 sectors/track x 2^13 tracks/platter x 2^2 platters = 2^34 bytes = 16GB.\nB: Worst case seek is 1 + 0.001 x 8192 = 9.192 ms; worst case rotation is 6 ms; total = 15.2 ms.\nC: Each track holds 0.5MB, so read 39 full tracks plus parts of a first and last track. One random seek plus 40 track-to-track seeks: 40 + 1 + 8192/3 x 0.001 = 43.7 ms. Rotation: 40.375 rotations x 6 ms = 242.2 ms. Total about 285.9 ms for 20MB (under 80MB/s, so the bus bandwidth does not limit us).",
      },
      {
        title: "11. Concurrent Programming (Card Game)",
        points: 20,
        type: "code",
        language: "c",
        gradingMode: "self",
        runnable: false,
        prompt:
          "Three players each have an unlimited supply of color cards: player Blue has blue cards, player Green has green cards, and player Red has red cards. The Dealer (a fourth entity) has stacks of all three colors. The Dealer randomly selects two different colored cards and places them on the table. The player who has the third color removes the two dealer cards from the table and takes the three cards (two from the table and one from the player's hand) and places them in a pile. The Dealer then puts another two cards on the table, and the cycle repeats. Write a Table object to synchronize game play among four threads (one thread each for Dealer, Red, Blue, and Green). To receive credit, you must follow the coding standards described in the handout and project.",
        reference: `public class Table{
 public:
   int const BLUE = 0;
   int const GREEN = 1;
   int const RED = 2;

   dealerPutCards(boolean cardList[3]);
   playerPullCards(int playerCardColor);
 ...
}

- dealerPutCards() passes an array of three booleans, two of which are true and one of which is false. It returns once the matching player has played.
- playerPullCards() passes in an int representing a color. It returns when the player's color is the winning color.`,
        stub: `/* List Table's member variables and how they are initialized, then
   implement dealerPutCards(boolean cardList[3]) and
   playerPullCards(int playerCardColor). */
`,
        answer: `// Member variables
Lock mutex = new Lock();
Condition dealerDone = new Condition();
Condition playDone = new Condition();
boolean cardsOnTable[] = {0,0,0};

dealerPutCards(boolean cardList[3]) {
    mutex.lock();
    memcpy(cardsOnTable, cardList, 3 * sizeof(boolean));
    dealerDone.signal();
    while (cardsOnTable[BLUE] || cardsOnTable[GREEN] || cardsOnTable[RED]) {
        playDone.wait(&mutex);
    }
    mutex.unlock();
}

playerPullCards(int playerCardColor) {
    mutex.lock();
    while (notMyWin(playerCardColor)) {
        dealerDone.wait(&mutex);
    }
    cardsOnTable[BLUE] = cardsOnTable[GREEN] = cardsOnTable[RED] = false;
    playDone.signal();
    mutex.unlock();
}`,
        rubric: [
          { label: "Member variables: mutex, condition variables, table state", points: 5 },
          { label: "dealerPutCards: publishes cards, waits until the play completes", points: 7 },
          { label: "playerPullCards: waits for a winning configuration, clears the table, signals", points: 8 },
        ],
      },
    ],
  ),

  // -------------------------------------------------------------------------
  // CS 372H Spring 2009 Midterm 1
  // -------------------------------------------------------------------------
  "cs439-2009-midterm": exam(
    "cs439-2009-midterm",
    "CS 439 2009 Midterm",
    "JOS debugging, stack layout, page tables, and a rendezvous object",
    "2009",
    "Midterm",
    ["exampdfs/cs439/2009/exam-exam-midterm.pdf", "exampdfs/cs439/2009/exam-solution-solution.pdf"],
    [
      {
        title: "1. Project (JOS Internals)",
        points: 50,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "This problem has three parts; answer any two of the three. Part 1: Suppose that during lab 1 (before you set up paging in lab 2) you wanted to use bochs to put a breakpoint at the start of function cons_getc(void) (see the kernel.asm excerpt in the reference). (a) Using the bochs vb command to set a breakpoint at a virtual address, what would you type? (b) Using the lb command for a linear address, what would you type? (c) Using the pb command for a physical address, what would you type? (d) After lab 2 (paging set up), assuming cons_getc ends up at the same offset within the kernel code, which of the above bochs commands will still set the breakpoint where you want it? Explain. Part 2: For the cprintf code in the reference, draw a picture of the stack just before execution of the first instruction of cprintf; show what word the stack pointer points to and where each of the four arguments to cprintf are relative to esp and ebp. Part 3: Suppose I have a readable/writable kernel data structure Foo *foo of size FOO_SIZE = 2^20 bytes and I wish to map that data structure read-only to user-level environments from addresses FOO_MAP to FOO_MAP + FOO_SIZE. What should be stored in the page directory and page tables for both the kernel and the user mappings?",
        reference: `Part 1 refers to this snippet from obj/kernel/kernel.asm:

\`\`\`
f0100316 <cons_getc>:

// return the next input character from the console, or 0 if none waiting
int
cons_getc(void)
{
f0100316: 55                    push   %ebp
f0100317: 89 e5                 mov    %esp,%ebp
f0100319: 83 ec 08              sub    $0x8,%esp
\`\`\`

Part 2 refers to this code:

int main(int argc, char **argv){
  int x = 1, y = 3, z = 4;
  cprintf("x %d, y %x, z %d\\n", x, y, z);
}

int
cprintf(const char *fmt, ...)
{
    va_list ap;
    int cnt;

    va_start(ap, fmt);
    cnt = vcprintf(fmt, ap);
    va_end(ap);

    return cnt;
}`,
        officialSolution:
          "Part 1: (a) vb 0x08 0xf0100316. (b) lb 0x00100316. (c) pb 0x00100316. (d) All but lb: before paging is turned on, segments are set up so that pa = la = va - KERNELOFFSET; after paging is turned on, the segment registers are loaded with 0 so that la = va.\nPart 2: The stack, from high to low addresses, holds the caller's frame with the four arguments pushed right to left (z, y, x, then the fmt pointer), then the return eip; esp points at the return eip just before cprintf's first instruction, and ebp still points into main's frame (cprintf has not yet pushed it).\nPart 3: Assume foo and FOO_MAP are aligned on a 4MB boundary. Allocate two page tables, one for the user mapping and one for the kernel mapping, and fill in the first 2^20/2^12 = 2^8 entries of each. Kernel PTE permissions are PTE_P|PTE_W; user PTE permissions are PTE_P|PTE_U. For both, the top 20 bits of each entry hold the physical address of the page being mapped: for entry i the physical address is (foo + i*4096) - KOFFSET. Finally, add the two page tables to the page directory: the kernel mapping at pgdir entry foo/4MB with PTE_P|PTE_W, and the user mapping at pgdir entry FOO_MAP/4MB with PTE_P|PTE_U, each holding the physical address of its page table.",
        rubric: [
          { label: "First part answered: matches the official reasoning", points: 25 },
          { label: "Second part answered: matches the official reasoning", points: 25 },
        ],
      },
      {
        title: "2. Multi-Threaded Programming (Rendezvous)",
        points: 50,
        type: "code",
        language: "c",
        gradingMode: "self",
        runnable: false,
        prompt:
          "Implement a Rendezvous object that allows allocation of a group of 10 resources, each of which has 10 instances. put(int resources[]) makes resources available; get(int resources[]) blocks until the requested resources are available and then claims them; resources[i] is the count of instances of resource i made available by the put() call or claimed by the get() call. You will implement two versions. SimpleRendezvous should be as simple as possible while ensuring the no-unnecessary-waiting property: if sufficient resources are available to satisfy any waiting get() request, then one or more get() requests must return. FairRendezvous must also ensure the fair-waiting property: if at any time two waiting get()s can be satisfied by the currently available resources, the one that started waiting later should not return until the one that started waiting earlier is allowed to return. Also answer: for a workload of 100 threads each doing alternating get() and put() calls, is the system always guaranteed to be deadlock free? Why or why not?",
        stub: `/* 1. List the state and synchronization variables for SimpleRendezvous.
   2. Implement SimpleRendezvous::put(int resources[])
   3. Implement SimpleRendezvous::get(int resources[])
   4. Is the alternating get()/put() workload deadlock free? Why or why not?
   5. List the state and synchronization variables for FairRendezvous.
   6. Implement FairRendezvous::put(int resources[])
   7. Implement FairRendezvous::get(int resources[])
*/
`,
        answer: `// The official solution PDF records only the deadlock-freedom discussion and
// leaves the implementation sections blank.
//
// 4. Is the system always guaranteed to be deadlock free? No. It is deadlock
// free if each put() releases all held resources (eliminating wait while
// holding), but it can deadlock if threads do not always release the
// resources they hold. Example: thread 1 acquires 10 of resource 1, releases
// 1 of resource 1, then tries to acquire 10 of resource 2, releasing 1 of
// resource 2, and so on, while thread 2 does the same starting from resource
// 10 and working down. Both eventually wait while holding, circularly.
//
// A standard shared-object solution uses a mutex plus a condition variable:
// put() adds to an available[] array and broadcasts; SimpleRendezvous::get()
// waits while the request exceeds what is available, then subtracts.
// FairRendezvous additionally keeps a FIFO ticket queue and only lets the
// oldest satisfiable waiter proceed.`,
        rubric: [
          { label: "SimpleRendezvous state and synchronization variables", points: 8 },
          { label: "SimpleRendezvous::put wakes waiters after adding resources", points: 8 },
          { label: "SimpleRendezvous::get waits (mesa loop) until the request is satisfiable", points: 9 },
          { label: "Deadlock question: identifies wait-while-holding scenario", points: 9 },
          { label: "FairRendezvous state plus FIFO mechanism", points: 8 },
          { label: "FairRendezvous put/get enforce fair waiting without unnecessary waiting", points: 8 },
        ],
      },
    ],
  ),

  // -------------------------------------------------------------------------
  // CS 372H Spring 2009 Final
  // -------------------------------------------------------------------------
  "cs439-2009-final": exam(
    "cs439-2009-final",
    "CS 439 2009 Final Exam",
    "Storage system design, security and file system short answers, and distributed commit",
    "2009",
    "Final Exam",
    ["exampdfs/cs439/2009/final-exam-final-exam.pdf", "exampdfs/cs439/2009/final-solution-solution.pdf"],
    [
      {
        title: "1. IO Performance",
        points: 35,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Suppose a machine has 8GB of DRAM that it can use as a cache and a 1TB disk of the kind specified in the reference, storing 128GB (2^37 bytes) of data: 2^30 records, each with an 8-byte key and a 120-byte value (2^7 bytes per record). The records are stored in a tree. Each leaf is a 128KB (2^17) block stored contiguously on disk; initially each leaf block is half full (512 = 2^9 records), so there are 2^21 leaf blocks stored in key-sorted order contiguously in a 256GB region. Leaves are level 0; internal and root nodes are 4KB blocks, each an array of (key, addr) records locating the leaf or lower-level block whose earliest key is key; all nodes of a level are contiguous and sorted. (a) How many levels of tree do you need to index this full data set? (b) For a workload randomly accessing leaf records, is it a reasonable engineering decision to cache all internal nodes in their entirety? Calculate their size and make a quantitative argument. (c) A workload generator issues 2^30 random INSERT key value operations, each requiring a read-modify-write of a leaf block. Estimate the steady-state throughput assuming synchronous update-in-place (update i completes before i+1 begins) and no leaf fills up. (d) Design a different update strategy that maximizes throughput. (e) Estimate the throughput your solution achieves.",
        reference: `Disk specification (Hitachi HUA721010KLA330 1TB):

\`\`\`
Interface                          3 Gb/s SATA
Capacity                           1 TB
Rotational speed                   7200 RPM
Average latency                    4.17 ms
Media transfer rate (max)          1070 Mbits/s
Sustained transfer rate            85-42 MB/s (zone 0-29)
Seek time (read, typical)          8.2 ms
Error rate (non-recoverable)       1 in 10^15 bits read
Data buffer                        32 MB
\`\`\``,
        officialSolution:
          "(a) Each index record is an 8-byte key + 8-byte addr, so a 4KB block stores 2^12/2^4 = 2^8 index records. We need 2^21/2^8 = 2^13 index blocks at L1, 2^5 at L2, and 1 root block at L3.\n(b) The total index is 2^13 x 2^12 = 2^25 bytes (32MB) for L1 plus 128KB for L2 and 4KB for L3. At about $20/GB of DRAM we are spending roughly $0.60 to cache the index for a $100 disk - well under 1% of system cost, so yes.\n(c) Each insert needs a leaf read-modify-write. Caching 8GB of 128GB of leaves avoids the read 6.25% of the time. A read takes a short seek (~2.7 ms if data is on the outer third) + half rotation (4.17 ms) + 64KB transfer (~1 ms) = ~7.97 ms; a write after a cached read takes about the same; an uncached update pays read + full-rotation write. Expected: 0.9375 x (7.97 + 8.34) + 0.0625 x 7.97 = ~15.8 ms per update, roughly 63 updates/second.\n(d) Buffer ~7GB of updates, then apply them in key-sorted order with large sequential I/O: read 1GB of leaf blocks, apply updates, write 1GB back; repeat across the 128GB of leaves; then process the next batch.\n(e) A 7GB batch is ~58.7M updates and every leaf block is touched: at ~75MB/s sustained, reading then writing 256 x 1GB regions takes ~6825 seconds per batch, or ~8600 updates/second (0.1 ms per update) - over 100x speedup. Total time for all batches: 19 x 6825 = ~125,000 seconds, about 1.5 days.",
        rubric: [
          { label: "(a) Levels of the index computed correctly", points: 7 },
          { label: "(b) Index size plus quantitative cost argument", points: 7 },
          { label: "(c) Synchronous update-in-place throughput estimate", points: 7 },
          { label: "(d) Batched, sort-ordered update strategy", points: 7 },
          { label: "(e) Throughput estimate for the improved design", points: 7 },
        ],
      },
      {
        title: "2. Short Answer",
        points: 30,
        type: "short",
        prompt:
          "Answer each short-answer item about security protocols, authentication, file systems, transactions, and performance.",
        code: `A. In the context of encryption protocols, what conditions must hold to allow a node to apply the nonce verification rule?
B. What conditions hold after the nonce verification rule is applied?
C. Explain what the nonce verification rule means and why such a rule is needed.
D. Two-factor authentication is an alternative to passwords. Give an example of two-factor authentication and explain its advantages compared to passwords.
E. In the context of file systems, what is a hard link?
F. Why is it harder to implement hard links in the DOS/Windows FAT file system than in the Unix Fast File System (FFS)?
G. Define the ACID properties of a transaction (give the name and definition of each).
H. I am running a web service on a single web server machine. My users are observing slow response time. I split my users so that half send their requests to the original machine and half to an identical second machine. My users' response time gets better by much more than a factor of two. What is a likely reason for such a superlinear speedup?`,
        answers: [
          "Node A believes node B once said MSG, and MSG (or some part of MSG) is fresh",
          "Node A believes node B believes MSG",
          "It lets a node know the message is part of the current protocol instance rather than a replay from an earlier instance",
          "Smart card plus password: an attacker must both guess the password and steal the card",
          "A directory entry (name plus file ID); multiple directory entries can link to the same file ID",
          "FFS has an inode to hold per-file metadata and reference counts; FAT has no inode, so metadata lives in the directory entry and cannot be kept consistent across multiple entries",
          "Atomicity, Consistency, Isolation, Durability",
          "The original machine was thrashing or heavily queued; halving the load made the working set fit in memory or collapsed the queuing delay",
        ],
        answerPoints: [2, 1.5, 1.5, 5, 5, 5, 5, 5],
        officialSolution:
          "A: Node A believes node B once said MSG and MSG (or some part of MSG) is fresh.\nB: Node A believes node B believes MSG.\nC: If nonce verification applies, the message belongs to the current instance of the protocol instead of being replayed from some other instance.\nD: Each user has a smart card and a password; to log in, insert the smart card and enter the password. An attacker cannot log in by guessing the password or by stealing the smart card alone - they must do both.\nE: A directory entry comprising a name and a file ID is a hard link; multiple directory entries (different names and/or directories) can link to the same file ID.\nF: FFS has an inode that contains not just pointers to data but per-file structures like permissions, owner, and reference count. A FAT file ID refers to a FAT-table entry (a block list head); there is no good place to store shared metadata except the directory entry itself, and multiple entries referring to one file cannot be kept consistent.\nG: The official key leaves this blank; the expected answer names and defines Atomicity, Consistency, Isolation, and Durability.\nH: The machine may have been thrashing (paging to disk), so the extra memory let the workload fit in memory; or the machine was so loaded that queuing delays dominated, and halving the load made them small.",
      },
      {
        title: "3. Distributed Commit",
        points: 35,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "A commit protocol attempts to get all nodes to agree on a value under an asynchronous fair network (nodes may be arbitrarily slow; the network may drop, reorder, or delay messages; but a message periodically resent until acknowledged is eventually received). (a) Suppose that in a well-provisioned machine-room cluster you instead assume a synchronous network (any packet arrives within 10 seconds unless the receiver has crashed). Why might it be dangerous to make such an assumption? Be specific. (b) Suppose two nodes A and B each store a local value. Design a protocol that, under the asynchronous fair network model, guarantees they first agree on max(valueA, valueB) and then simultaneously print it to their screens, assuming neither node crashes. (c) Modify the 7-line nonblocking fault-tolerant consensus algorithm in the reference to work with a COMMIT/ABORT voting rule instead of majority RED/BLUE voting, guaranteeing nontriviality, safety (COMMIT decided only if all nodes initially vote COMMIT), consensus, visibility, and eventual liveness. (d) Prove that your protocol guarantees each of the five required properties.",
        reference: `Recall the nonblocking fault-tolerant consensus algorithm requiring n = 3f+1 nodes (4 nodes to tolerate f = 1 crash). Initially each node votes RED or BLUE; in later rounds a node's vote depends on other nodes' votes so that eventually all nonfaulty nodes settle on the same value. Pseudo-code for a node:

\`\`\`
e = 0;                       // election number
c = RED or BLUE;             // vote this election
while (1){
    e = e + 1;
    send (VOTE, e, c) to all // In background, keep periodically
                             // sending to node i until I receive i's
                             // vote for round e+1
    VOTES = receive (VOTE, e, RED or BLUE) from 2f+1 nodes (including self) for election e
    c = MAJORITY(VOTES)
}
\`\`\`

To determine the consensus value, ask nodes for their current c values for a round and wait for n-f = 3 replies; if all three match, the system has decided that value.`,
        officialSolution:
          "(a) In normal operation the assumption holds, but a machine can be slow for minutes (e.g., a virus scan), the switch can reboot, a node can reboot, someone can unplug a cable - any of these break the 10-second bound and violate safety.\n(b) No such protocol exists; simultaneous coordinated action over an asynchronous network is impossible (Two Generals).\n(c) Call the initial vote round 0; a node may vote COMMIT or ABORT unilaterally. In round 1, vote COMMIT only if you receive n COMMIT votes from round 0; if you time out before hearing from all n nodes or hear any ABORT, vote ABORT in round 1. For all later rounds, use majority rule over 2f+1 received votes. Note you cannot vote COMMIT in round 1 on n-f COMMITs (the missing node might have voted ABORT); after round 1 you cannot wait for all n messages (a node may have crashed); and you cannot decide from a single vote in later rounds because that would not be stable.\n(d) Nontriviality: all-COMMIT initial votes with a timely network can decide COMMIT, and any initial ABORT leads to ABORT. Safety: COMMIT requires n round-0 COMMIT votes. Consensus: once 2f+1 nodes vote the same in a round, the majority rule preserves it. Visibility: matching c values from any n-f live nodes reveal the decision. Eventual liveness: fair-network retransmission means every round eventually completes with 2f+1 votes.",
        rubric: [
          { label: "(a) Concrete failure of the synchrony assumption", points: 7 },
          { label: "(b) Recognizes impossibility of simultaneous agreement", points: 7 },
          { label: "(c) Round-0/round-1 COMMIT rule plus majority thereafter", points: 7 },
          { label: "(d) Proof sketch covering all five properties", points: 14 },
        ],
      },
    ],
  ),

  // -------------------------------------------------------------------------
  // CS 439H Fall 2011 Midterm 1
  // -------------------------------------------------------------------------
  "cs439-2011-fall-exam-1": exam(
    "cs439-2011-fall-exam-1",
    "CS 439 Fall 2011 Exam 1",
    "Reliability, virtualization, deadlock, thread state, paging, and a priority condition variable",
    "Fall 2011",
    "Exam 1",
    ["exampdfs/cs439/2011-fall/exam-1-exam-midterm-1.pdf", "exampdfs/cs439/2011-fall/exam-1-solution-solution.pdf"],
    [
      {
        title: "1. Reliability vs. Availability",
        points: 8,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Suppose you had a choice between two file systems. System 1's vendor guarantees it will be 99% reliable and 100% available. System 2's vendor guarantees it will be 100% reliable and 99% available. Which would you pick?",
        officialSolution: "System 2. An unreliable file system can permanently lose data.",
        rubric: [{ label: "Picks system 2 with the data-loss argument", points: 8 }],
      },
      {
        title: "2. Virtualization and popf",
        points: 16,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Virtualization uses a hypervisor running in privileged mode to create a virtual machine that runs in unprivileged mode, so unmodified guest operating systems can run in the virtual machine. Early versions of the x86 architecture (pre-2006) were not completely virtualizable. One problem was the popf (pop flags) instruction: run in privileged mode, popf could change both the ALU flags (e.g., ZF) and the system flags (e.g., IF, which controls interrupt delivery); run in unprivileged mode, it could change just the ALU flags. (a) Why do instructions like popf prevent transparent virtualization of the (old) x86 architecture? (b) How would you change the x86 hardware to fix this problem?",
        officialSolution:
          "(a) Since popf behaves differently in user and kernel mode and does not cause a trap in user mode, the guest kernel expects it to do one thing (the privileged-mode behavior) but it actually does something else.\n(b) Add a flag that, when set, causes popf in user mode to trap. The hypervisor sets the popf-trap flag whenever the guest runs in virtual privileged mode and clears it when the guest runs in virtual unprivileged mode.",
        rubric: [
          { label: "(a) Silent behavior change without a trap breaks transparency", points: 8 },
          { label: "(b) Hardware trap mechanism controlled by the hypervisor", points: 8 },
        ],
      },
      {
        title: "3. Deadlock Conditions",
        points: 4,
        type: "short",
        prompt: "Answer the short-answer item.",
        code: `A. List the four necessary conditions for deadlock.`,
        answers: ["limited resources, wait while holding, circular waiting, no preemption"],
        answerPoints: [4],
        officialSolution: "Limited resources, wait while holding, circular waiting, and no preemption.",
      },
      {
        title: "4. Per-Thread vs. Shared State",
        points: 16,
        type: "short",
        prompt:
          "For each of the data structures listed, indicate whether the memory identified is stored in per-thread areas of memory (private, per-thread state) or in areas of memory that can be shared by many threads (answer private or shared).",
        code: `Consider this program:

int max = 42;
char message[] = "Hello world";

int
main(int argc, char **argv)
{
    char *msg = message;

    sthread_t *t = (sthread_t *) malloc(sizeof(sthread_t));
    sthread_init(t, go, msg);
    t = (sthread_t *) malloc(sizeof(sthread_t));
    sthread_init(t, foo, NULL);
}

void
go(char *toPrint)
{
    int OK = 1;
    static int done = 0;
    if (strlen(toPrint) > max) {
        OK = 0;
    }
    done = 1;
}

void
foo(void *notUsed) {
    // Code omitted
    ...
}
A. heap
B. stack
C. message
D. msg
E. toPrint
F. argc
G. OK
H. max
I. t
J. go
K. done`,
        answers: [
          "shared",
          "private",
          "shared",
          "private",
          "private",
          "private",
          "private",
          "shared",
          "private",
          "shared",
          "shared",
        ],
        officialSolution: "Shared: heap, message, max, go (code), and done (static). Private, per-thread: stack, msg, toPrint, argc, OK, and t (each is a local variable on some thread's stack).",
      },
      {
        title: "5. Page Table Entry Size",
        points: 8,
        type: "short",
        prompt: "Answer the short-answer item.",
        code: `A. Consider a virtual memory system with 42-bit physical addresses and 6 control bits per page. How large does the page size have to be to allow each page table entry to fit in a 4-byte word?`,
        answers: ["2^16 bytes (64KB)"],
        answerPoints: [8],
        officialSolution: "42 + 6 - 32 = 16, so each page needs to be 2^16 bytes (64KB).",
      },
      {
        title: "6. Multi-Level Page Tables",
        points: 8,
        type: "short",
        prompt: "Answer the short-answer item.",
        code: `A. Consider a virtual memory system with 48-bit virtual addresses, 44-bit physical addresses, 16KB pages, and 7 control bits per word. Assuming a multi-level page table arrangement, how many levels of page tables should this system use?`,
        answers: ["4 levels"],
        answerPoints: [8],
        officialSolution:
          "Entry size = 44 + 7 - 14 = 37 bits, round up to 8 bytes. Entries per page = 16KB/8B = 2K, so 11 bits per level. Virtual page bits = 48 - 14 = 34, so 4 levels are needed (the top level has just 2 entries).",
      },
      {
        title: "7. Conservative Garbage Collection",
        points: 8,
        type: "code",
        language: "c",
        gradingMode: "self",
        runnable: false,
        prompt:
          "The Bryant and O'Hallaron book says that it is safe to do conservative mark and sweep garbage collection in a C program. This is not quite true. Write a short C program (detailed pseudocode is fine) that can dereference a pointer that could point to garbage-collected memory after a mark and sweep pass.",
        stub: "/* Write your C program or detailed pseudocode here. */\n",
        answer: `// Key idea: hide the only pointer to allocated memory with pointer
// arithmetic so the collector sees no reference, then restore it.
char *hidden = malloc(100 * sizeof(char));
sprintf(hidden, "Hidden.");
hidden = hidden / 2;
...
// mark and sweep happens
...
hidden = hidden * 2;
printf(hidden);`,
        rubric: [
          { label: "Obscures the pointer so no live reference exists during the sweep", points: 5 },
          { label: "Restores and dereferences the pointer afterward", points: 3 },
        ],
      },
      {
        title: "8. Priority Condition Variable",
        points: 32,
        type: "code",
        language: "c",
        gradingMode: "self",
        runnable: false,
        prompt:
          "Implement a priority condition variable. A priority condition variable (PCV) has 3 public methods: wait, signal, and broadcast (signatures in the reference). These are similar to a standard condition variable, except a PCV enforces both priority and ordering: signal(lock) causes the currently waiting thread with the highest priority to return from wait(); among equal priorities the longest-waiting thread returns first. broadcast(lock, priority) causes all currently waiting threads whose priority equals or exceeds priority to return from wait(). For full credit, you must follow the thread coding standards discussed in class.",
        reference: `void PCV::wait(Lock *lock, int priority);
void PCV::signal(Lock *lock);
void PCV::broadcast(Lock *lock, int priority);`,
        stub: `/* Implement the PCV class: member variables plus wait, signal, and
   broadcast. Follow the thread coding standards from class. */
`,
        answer: `// Member variables: Lock myLock; CV cv; SortedList waiting;
// WaitRecord has fields: priority, okToGo (initially false), next/prev.

PCV::wait(Lock *lock, int priority) {
    // Wait should atomically release the caller's lock and start waiting
    // until signalled, then reacquire the lock before returning. To follow
    // the standards without risking deadlock, wait() is split in two:
    doWait(lock, priority);
    lock->acquire();
}

void PCV::doWait(Lock *lock, int priority) {
    myLock.acquire();
    lock->release();
    WaitRecord *wr = new WaitRecord(priority);
    waiting.insertSortedByPriorityAndInsertOrder(wr);
    while (!wr->okToGo) {
        cv.wait(&myLock);
    }
    free(wr);
    myLock.release();
}

PCV::signal(Lock *lock) {
    myLock.acquire();
    waiting.markFirstOkToGo();
    cv.broadcast(&myLock);
    myLock.release();
}

PCV::broadcast(Lock *lock, int priority) {
    myLock.acquire();
    waiting.markPriorityOkToGo(priority);
    cv.broadcast(&myLock);
    myLock.release();
}

// Helpers (less detail was fine): insertSortedByPriorityAndInsertOrder
// inserts behind equal priorities; markFirstOkToGo pops the head and sets
// okToGo; markPriorityOkToGo(pri) pops while head->priority >= pri.`,
        rubric: [
          { label: "State: internal lock, condition variable, sorted wait queue", points: 8 },
          { label: "wait: atomic release + mesa-style while loop on a per-waiter flag", points: 10 },
          { label: "signal: wakes exactly the highest-priority, longest-waiting thread", points: 7 },
          { label: "broadcast: wakes all waiters at or above the given priority", points: 7 },
        ],
      },
    ],
  ),

  // -------------------------------------------------------------------------
  // CS 439H Fall 2011 Midterm 2
  // -------------------------------------------------------------------------
  "cs439-2011-fall-exam-2": exam(
    "cs439-2011-fall-exam-2",
    "CS 439 Fall 2011 Exam 2",
    "File system indexing, an on-disk file system image, disk performance, and RAID reliability",
    "Fall 2011",
    "Exam 2",
    ["exampdfs/cs439/2011-fall/exam-2-exam-midterm-2.pdf", "exampdfs/cs439/2011-fall/exam-2-solution-solution.pdf"],
    [
      {
        title: "1. File Systems: Maximum File Size",
        points: 15,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Suppose I have a multi-level index file system (like the fast file system FFS for Unix), and this file system has 2KB blocks, inodes with 10 direct, 1 indirect, 1 double-indirect, 1 triple-indirect, and 1 quadruple-indirect pointer, and 64-bit block identifiers. Estimate to within 2% the maximum size file this system supports.",
        officialSolution:
          "A 2KB block stores 2^11/2^3 = 2^8 = 256 block identifiers. So a single indirect block covers 2^8 blocks, a double indirect 2^16, a triple indirect 2^24, and a quadruple indirect 2^32 blocks. Total = 2^32 + 2^24 + 2^16 + 2^8 + 10 blocks of 2^11 bytes each, approximately 2^32 x 2^11 = 2^43 bytes - a bit over 8TB.",
        rubric: [
          { label: "Block identifiers per block computed correctly (256)", points: 5 },
          { label: "Blocks covered per indirection level", points: 5 },
          { label: "Final estimate about 2^43 bytes (8TB)", points: 5 },
        ],
      },
      {
        title: "2. File Systems: Reading a Disk Image",
        points: 20,
        type: "short",
        prompt:
          "Consider the tiny 64-sector disk shown in the reference, which stores an FFS-like file system. The disk reserves the first 16 sectors for its inode array. Each sector stores four 4-byte words. An inode fills a sector and contains 2 direct pointers, 1 indirect pointer, and 1 double-indirect pointer (in that order). An inumber is a 4-byte integer. In a directory, a file name is a 4-byte array of 1-byte characters. A block ID is a 4-byte integer. The root directory's inumber is 0.",
        code: `A. For the file system on this disk, how large (in sectors) is the file with inumber 1?
B. For the file system on this disk, how large (in sectors) is the file with inumber 4?
C. For the file system on this disk, list the file names for the root directory.
D. For the file system on this disk, what is the inumber of file /MARY/ABLE?
E. For the file system on this disk, what do I get if I read the entire file /ME/WAS?
F. Can this file system support soft links? Why or why not?`,
        reference: `The disk, sector by sector (each sector holds four 4-byte words; sectors 0-15 are inodes):

\`\`\`
sector:  0      1      2      3      4      5      6      7
        28     25     18     0      16     38     17     23
        19     0      44     29     60     45     54     39
        0      0      42     0      50     0      21     41
        0      0      0      0      0      56     0      0
sector:  8      9      10     11     12     13     14     15
        24     47     25     62     27     37     50     39
        57     0      33     0      35     46     0      46
        0      0      0      0      59     0      0      53
        0      0      0      0      0      0      63     61
sector: 16     17     18     19     20     21     22     23
        'ZED ' 'ABLE' 43     'MARY' 53     22     'BAR ' 47
        10     13     21     13     63     35     8      43
        'ZIPP' 'WAS ' 19     'HAD ' 24     0      'COOL' 38
        3      7      -1     10     10      0     -1     31
sector: 24     25     26     27     28     29     30     31
        55     'BAR ' 'A   ' 'APT ' 'HELP' 'LAMB' 'BAR ' 31
        0      9      11     2      4      14     14     27
        0      'ZED ' 'LITL' 'ZED ' 'ME  ' 'WAS ' 'ABLE' 19
        0      8      6      8      9      12     6      42
sector: 32     33     34     35     36     37     38     39
        'SNOW' 'THE ' 'CAR ' 'ABLE' 'FOO ' 'APT ' 3      'MARY'
        8      14     8      9      12     7      6      20
        'ABLE' 'END ' 'POOL' 'BEEF' 'MARY' 'ABLE' 9      'MARK'
        2      15     13     10     1      10     12     40
sector: 40     41     42     43     44     45     46     47
        'MARK' 42     0      'CAR ' 7      11     'MARY' 'FLCE'
        7      44     0      3      8      4      2      12
        'MARY' 0      43     'ABLE' 10     2      'MOVE' 'WAS '
        9      0      0      11     11     8      8      13
sector: 48     49     50     51     52     53     54     55
        'WHTE' 'ABLE' 51     'ABLE' 'BAR ' 15     'ABLE' 24
        8      2      0      8      11     14     5      0
        'AS  ' 'WAS ' 0      'WAS ' '    ' 13     'FOO ' 0
        12     14     0      6      -1     12     14     0
sector: 56     57     58     59     60     61     62     63
        0      58     8      52     'APT ' 43     'FAST' 0
        0      0      20     0      7      18     15     0
        0      0      15     0      'FOO ' 31     'FOOD' 0
        57     61     98     0      12     56     14     46
\`\`\``,
        answers: [
          "1 sector",
          "3 sectors",
          "HELP, ME, MARY, HAD",
          "10",
          "APT 7 ABLE 10 MARY 2 MOVE 8",
          "Yes, but only to paths whose names fit in the limited-size files this system supports",
        ],
        answerPoints: [3, 3, 3, 3, 4, 4],
        officialSolution:
          "A: 1 sector. B: 3 sectors. C: HELP, ME, MARY, HAD. D: 10. E: APT 7 ABLE 10 MARY 2 MOVE 8. F: It can, but only to paths whose names fit in the limited-sized files this system supports.",
      },
      {
        title: "3. Disk Performance",
        points: 40,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Suppose I have a disk such as the one described in the reference and a workload consisting of a continuous stream of updates to random blocks of the disk. Assume the disk scheduler uses the SCAN/Elevator algorithm. (a) What is the throughput in requests per second if the application issues one request at a time and waits until the block is safely stored on disk before issuing the next request? (b) What is the throughput if the application buffers 100MB of writes, issues them as a batch, and waits until they are safely on disk before the next batch? (c) Now suppose that - even in the event of a crash - the ith update can be observed by a read after crash recovery only if all preceding updates can also be read (FIFO updates). (1) Design an approach to get good performance for this workload (explain how writes, reads, and crash recovery work); (2) explain why your design ensures FIFO even if crashes occur; (3) estimate your approach's throughput in requests per second (your solution should not require significantly more than 100MB of buffer space).",
        reference: `Disk specification:

\`\`\`
Platters/Heads                              2/4
Capacity                                    320 GB
Spindle speed                               7200 RPM
Average seek time read/write                10.5 ms / 12.0 ms
Maximum seek time                           19 ms
Track-to-track seek time                    1 ms
Transfer rate (surface to buffer)           54-128 MB/s
Transfer rate (buffer to host)              375 MB/s
Buffer memory                               16 MB
Nonrecoverable read errors per sectors read 1 sector per 10^14
MTBF                                        600,000 hours
Typical power                               16.35 W
\`\`\``,
        officialSolution:
          "(a) Seek + half rotation + transfer = 12 + 4.17 + 512/54,000,000 = ~16.2 ms per request, so throughput is about 62 requests/s.\n(b) 100MB of writes is 200,000 512-byte writes. Each track holds about 833KB, so there are ~100,000 tracks per surface and ~400K tracks overall - about 0.5 buffered updates per track. Estimating seek time as the 1 ms track-to-track seek and rotation as a half rotation: 1 + 4.2 + ~0 = ~5.2 ms per request, or about 192 requests/sec.\n(c1) Use a replay log: write 100MB to the buffer, then to the log, commit the log, then replay to disk. In normal operation reads first check the buffer, then disk. On crash recovery, block reads until replay completes.\n(c2) FIFO holds because reads always observe all previously completed writes - via the buffer during normal operation or via replay after a crash.\n(c3) Performance is as in (b) plus the log write: 100MB at 128MB/s plus ~10 track seeks adds under 1 second per 200,000 updates (~5 microseconds per update) - a negligible addition.",
        rubric: [
          { label: "(a) Synchronous throughput (~62 requests/s)", points: 12 },
          { label: "(b) Batched SCAN throughput (~190 requests/s)", points: 12 },
          { label: "(c) Replay-log design, FIFO argument, and throughput estimate", points: 16 },
        ],
      },
      {
        title: "4. Disk Reliability (RAID)",
        points: 25,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Consider a RAID system with 20 disks of size 1TB arranged into 2 groups of 10 disks each, allowing 9 data blocks and one parity block to be stored across a group of 10 disks. Assume disk failures are uncorrelated, the MTTF of a single disk is 1.5 million hours, the MTTR (mean time to repair) is 10 hours, and sustained bandwidth is 100MB/s. (a) Considering only complete disk failures, what is the MTTDL (mean time to data loss - here, the mean time until a double-disk failure in a group)? (b) While one failed disk in a group is being replaced (instantly, via hot spare), what fraction of the other 9 disks' bandwidth is consumed by recovery if it must complete within 10 hours? (c) With an unrecoverable read error rate of 1 sector per 10^14 bits read, what is the probability of encountering an unrecoverable read error during the rebuild? (d) Assuming a 10% chance of a bit error during recovery, estimate the MTTDL accounting for both whole-disk failures and unrecoverable read errors.",
        officialSolution:
          "(a) MTTDL = MTTF^2 / (N x (G-1) x MTTR) = (1.5x10^6)^2 / (20 x 9 x 10) = 1.25x10^9 hours.\n(b) Rebuilding requires reading each surviving disk in its entirety: 1TB at 100MB/s = 10^4 seconds out of the 10-hour window, so 10,000/36,000 = 27.8% of each disk's bandwidth.\n(c) A rebuild reads 9TB = 72x10^12 bits; at 1 error per 10^14 bits that is 0.72 of the expected time to an error. More precisely, the chance of reading all bits successfully is (1 - 10^-14)^(72x10^12) = 0.487, so the probability of an error is about 51%.\n(d) Expected time to a first failure is MTTF/N = 1.5x10^6/20 = 7.5x10^4 hours (per array; per group 1.5x10^5). Treat unrecoverable-bit-error recovery failures and double-disk failures as failure rates and add them: 0.1 x (1/1.5x10^5) + 1/1.25x10^9, then invert - the combined MTTDL is about 1.5x10^6 hours (dominated by the bit-error term). Note that simply weighting separate recovery times does not work; failure rates must be added and then inverted.",
        rubric: [
          { label: "(a) Standard MTTDL formula applied correctly", points: 6 },
          { label: "(b) Rebuild bandwidth fraction (~28%)", points: 6 },
          { label: "(c) Unrecoverable-error probability during rebuild (~50%)", points: 6 },
          { label: "(d) Combines failure rates (not times) and inverts", points: 7 },
        ],
      },
    ],
  ),

  // -------------------------------------------------------------------------
  // CS 439H Fall 2011 Final
  // -------------------------------------------------------------------------
  "cs439-2011-fall-final": exam(
    "cs439-2011-fall-final",
    "CS 439 Fall 2011 Final Exam",
    "Consistency and security short answers, synchronization bugs, and back-of-envelope system design",
    "Fall 2011",
    "Final Exam",
    ["exampdfs/cs439/2011-fall/final-exam-final-exam.pdf", "exampdfs/cs439/2011-fall/final-solution-solution.pdf"],
    [
      {
        title: "1. Short Answer",
        points: 25,
        type: "short",
        prompt:
          "Answer each short-answer item. For true/false items answer true or false; for multiple-choice items answer with the roman numeral of your choice.",
        code: `A. True/False: Doubling the block size in a file system like FFS that uses multi-level indexing will double the maximum file size.
B. Write a one-sentence definition of the term transaction.
C. True/False: A disk's average seek time usually paints too optimistic a picture of a disk's performance for most workloads.
D. True/False: A disk's mean time to failure often paints too optimistic a picture of a disk's reliability when the disk is deployed.
E. Suppose I have 64-bit virtual addresses, 64-bit physical addresses, and 16KB pages. How many bits from the virtual address are used as the "offset" within a page when computing the physical address? Choices: i. 10, ii. 12, iii. 14, iv. 16, v. 18
F. True/False: The NFS distributed file system guarantees FIFO/PRAM consistency.
G. True/False: The NFS distributed file system guarantees causal consistency.
H. True/False: It is impossible for a distributed file system that uses callbacks and leases to implement FIFO/PRAM consistency.
I. True/False: It is impossible for a distributed file system that uses callbacks and leases to implement sequential consistency.
J. Suppose machine A encrypts a file using machine B's public key and sends the encrypted file to machine B. Which of the following guarantees does this strategy provide? Choices: i. Secrecy (no one but B could read this message), ii. Authentication (no one but A could send this message), iii. Both secrecy and authentication, iv. Neither secrecy nor authentication`,
        answers: [
          "false",
          "A way to update multiple values in stable storage that is guaranteed to be atomic, consistent, isolated, and durable",
          "false",
          "true",
          "iii (14 bits)",
          "false",
          "false",
          "false",
          "false",
          "i (secrecy)",
        ],
        officialSolution:
          "A: False - not only do the leaves grow, but also the internal nodes.\nB: A way to update multiple values in stable storage that is guaranteed to be atomic, consistent, isolated, and durable.\nC: False - too pessimistic.\nD: True - advertised failure rates are usually less than 1% per year, but measured rates are often more than twice that.\nE: iii - 14 bits (16KB pages).\nF: False - even if machine A updates f1 then f2, machine B can observe the new f2 and then the old f1.\nG: False - same scenario as F.\nH: False - callbacks and leases can even implement linearizability.\nI: False - callbacks and leases can even implement linearizability.\nJ: i - secrecy only.",
      },
      {
        title: "2. Atomic Queue Transfer",
        points: 10,
        type: "code",
        language: "c",
        gradingMode: "self",
        runnable: false,
        prompt:
          "SOS (Sleazy Operating Systems, Inc.) has a problem. Their OS has a set of queues, each protected by a lock; to enqueue or dequeue, a thread must hold the lock associated with the queue. SOS needs an atomic transfer routine that dequeues an item from one queue and enqueues it on another, with no interval during which an external thread can determine that an item has been removed from one queue but not yet placed on another. An SOS engineer implemented the version in the reference. Assume queue1 and queue2 never refer to the same queue, and that Queue::Address() returns a queue's address as an unsigned integer. (a) What is the concurrency bug with this code? (b) Implement a better version of the transfer() function.",
        reference: `void transfer (Queue *queue1, Queue *queue2) {
   Item thing; /* thing being transferred */
   queue1->lock.Acquire();
   queue2->lock.Acquire();

   thing = queue1->Dequeue();
   if (thing != NULL) {
      queue2->Enqueue(thing);
   }
   queue2->lock.Release();
   queue1->lock.Release();
}`,
        stub: `/* (a) Describe the concurrency bug.
   (b) Implement a better version of transfer(). */
`,
        answer: `// (a) It can deadlock: thread one calls transfer(q1, q2) and acquires q1's
// lock while thread two calls transfer(q2, q1) and acquires q2's lock; each
// then waits forever for the other's lock.
//
// (b) Order the lock acquisitions, e.g. by queue address:
void transfer (Queue *queue1, Queue *queue2) {
   Item thing;
   if (queue1->Address() < queue2->Address()) {
      queue1->lock.Acquire();
      queue2->lock.Acquire();
   } else {
      queue2->lock.Acquire();
      queue1->lock.Acquire();
   }

   thing = queue1->Dequeue();
   if (thing != NULL) {
      queue2->Enqueue(thing);
   }
   queue2->lock.Release();
   queue1->lock.Release();
}`,
        rubric: [
          { label: "(a) Identifies the lock-ordering deadlock", points: 4 },
          { label: "(b) Acquires locks in a global order (e.g., by address)", points: 6 },
        ],
      },
      {
        title: "3. One-Lane Bridge",
        points: 15,
        type: "code",
        language: "c",
        gradingMode: "self",
        runnable: false,
        prompt:
          "You have been hired by TxDOT to synchronize traffic over a narrow light-duty bridge. Traffic may only cross in one direction at a time, and if there are ever more than 3 vehicles on the bridge at one time it will collapse. Each car is a thread executing OneVehicle() (see reference); Bridge::Arrive() must not return until it is safe to cross in the given direction, and Bridge::Exit() lets additional cars cross. The solution need not guarantee fairness or freedom from starvation. One of the engineers proposes the solution in the reference. (a) Why does Bridge::Exit() call number.Broadcast() rather than number.Signal()? (b) The code has a serious bug: identify it and explain whether it can cause deadlock, bridge collapse, head-on collisions, or several of these. (c) Implement a solution that works by making small changes to Bridge::Arrive() and/or Bridge::Exit().",
        reference: `OneVehicle(Direction direc, Bridge *bridge){
  bridge->Arrive(direc);
  printf("Crossing bridge.\\n");
  bridge->Exit(direc);
}

class Bridge{
    enum Direction {EAST=0, WEST=1, ANY};
    Condition direction, number;
    Lock lock;
    int cars;
    Direction currentDir = ANY;
    int64 ticket[2] = {0,0}; // Assume these do not
    int64 turn[2] = {1,1};   // overflow/wrap around

    void Bridge::Arrive(Direction myDir) {
        lock.Acquire();
        int myTicket = ticket[myDir]++;
        while (currentDir != myDir && currentDir != ANY){
            direction.Wait(&lock);
        }
        currentDir = myDir;

        while (cars >= MAX_CARS || turn[myDir] < myTicket){
            number.Wait(&lock);
        }
        cars++;
        turn[myDir]++;
        lock.Release();
    }

    void Bridge::Exit(Direction myDir) {
        lock.Acquire();
        cars--;
        number.Broadcast(&lock);
        if (cars == 0) {
            currentDir = ANY;
            direction.Broadcast(&lock);
        }
        lock.Release();
    }
}`,
        stub: `/* (a) Why Broadcast rather than Signal in Exit()?
   (b) Identify the serious bug and its consequences.
   (c) Implement a fix with small changes to Arrive()/Exit(). */
`,
        answer: `// (a) Signal may not wake up the right waiting thread, so the system can
// get stuck; Broadcast lets every candidate re-check its condition.
//
// (b) A head-on collision is possible if the direction changes while a car
// waits in the second loop: under mesa semantics there can be a delay from
// number.Broadcast() until a waiting car proceeds, and during that time the
// bridge can drain and change direction before the waiting car continues.
//
// (c) Wait in just one place. Fold the second loop's conditions into the
// first while loop in Arrive:
//     while ((currentDir != myDir && currentDir != ANY) ||
//            cars >= MAX_CARS || turn[myDir] < myTicket) {
//         direction.Wait(&lock);
//     }
// then delete the second while loop, and in Exit() broadcast on the (now
// ill-named) direction condition variable instead of number and delete the
// second broadcast.`,
        rubric: [
          { label: "(a) Broadcast wakes the correct candidate under mesa semantics", points: 4 },
          { label: "(b) Head-on collision scenario identified and explained", points: 5 },
          { label: "(c) Single-wait fix with combined condition and single broadcast", points: 6 },
        ],
      },
      {
        title: "4. Memory-Cache Server Estimation",
        points: 15,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "A memory cache server workload consists of network clients sending 64-byte requests containing a hash key to a server, which reads a 1KB chunk from a hash table in DRAM and sends 1KB to the client. Each network interface has a bandwidth of 1 Gbit/s and there is a 400 microsecond one-way network latency between a client and the server; the interface is full-duplex. The CPU has an overhead of 100 microseconds to send or receive a network packet, plus 0.01 microseconds per byte sent, and the hash table lookup takes 10 microseconds. Rounding within 10% is fine. (a) How many requests per second can each network interface satisfy? (b) How many requests per second can the server CPU satisfy (assuming sufficient network interfaces)? (c) When loads are low, what is the latency from when a client begins to send a request until it receives and processes the last byte of the reply (ignore queuing delays)? (d) Assuming uncorrelated requests and a required average response time below 2 ms, how many requests per second can a system with 4 network interfaces and 4 CPUs handle?",
        officialSolution:
          "(a) Each NIC is limited by send bandwidth. Each response is 1024 x 8 = 8192 bits; 10^9/8192 = ~122,000 requests/sec per NIC.\n(b) Each request needs 2 packets (200 us) plus 1088 bytes sent/received (10.88 us) plus a lookup (10 us): ~221 us of CPU per request, so 10^6/221 = ~4,525 requests/sec per CPU.\n(c) CPU send + wire time + one-way latency + CPU receive + lookup + CPU send + wire + latency + CPU receive = 100 + 0.64 + ~0.5 + 400 + 100 + 10 + 100 + 81.92 + 8.2 + 400 + 100 + 81.92 = ~1,283 us total.\n(d) At most 2,000 - 1,283 = ~717 us of queuing delay is allowed. Queuing will be at the CPU (NICs have an order of magnitude more headroom). Modeling with an exponential distribution: queuing time = 221 x (1/(1-u) - 1); solving 717 = 221 x u/(1-u) gives u = 0.554. Each CPU can then handle 4,525 x 0.55 = ~2,489 requests/sec; with 4 CPUs, just under 10,000 requests/sec.",
        rubric: [
          { label: "(a) NIC limit ~122K requests/s", points: 4 },
          { label: "(b) CPU limit ~4.5K requests/s", points: 4 },
          { label: "(c) End-to-end latency ~1.28 ms", points: 4 },
          { label: "(d) Utilization bound and total ~10K requests/s", points: 3 },
        ],
      },
      {
        title: "5. Cluster File System Estimation",
        points: 15,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Consider a cluster file system that stores data in 10MB chunks on chunkservers, identifies each chunk with an 8-byte chunkID and each chunk server with a 2-byte server ID; to read a file, a node first asks a master which chunk server to go to, and then reads from that chunk server. (a) Assuming the chunk servers have disks with 10ms average seek + 10ms average half-rotation and 100MB/s sequential bandwidth, and the single-processor master can process a lookup in 5 microseconds of CPU time, what is the maximum read bandwidth this system can support (unlimited chunk servers and clients; network is not a bottleneck)? (b) If 1TB disks cost $100, each chunk server has 10 disks attached, each chunk server costs $1,000 plus its disks, the master costs $1,000 plus its memory, and DRAM costs $20 per GB, what percentage of total system cost is the master's DRAM for a 100 chunk-server system (assuming the master keeps in DRAM all information necessary to do its job)?",
        officialSolution:
          "(a) The master can handle 1/5us = 200K lookups/second and each lookup enables a 10MB read, so the maximum read bandwidth is 200,000 x 10MB = 2TB/s (2,000,000 MB/s; the per-chunkserver disks are not the limit because servers are unlimited).\n(b) System cost: 100 x ($1,000 + 10 x $100) + $1,000 + DRAM. 1,000TB of storage in 10MB chunks needs 10^8 chunk records of ~10 bytes = ~1GB... the official key computes 10 bytes of DRAM per MB of storage: 10^9 MB x 10 bytes = 10^10 bytes = 10GB of DRAM = $200. Total = $201,200, of which $200 is master DRAM = about 0.0994%.",
        rubric: [
          { label: "(a) Master-lookup-limited bandwidth (~2TB/s)", points: 8 },
          { label: "(b) DRAM sizing and percentage (~0.1%)", points: 7 },
        ],
      },
      {
        title: "6. Signed Email via Finger",
        points: 20,
        type: "free-response",
        gradingMode: "self",
        prompt:
          "Some people sign their email by including, at the bottom of an otherwise normal message, the sender's name and the date encrypted with the sender's private key. The message itself is unencrypted, but the signature can be validated by using the finger command to retrieve the sender's public key (users store their public key in their .finger file, which the finger daemon on their machine serves to anyone). Explain why this gives a completely false sense of security by outlining 5 different ways that you could make it appear that the sender signed mail saying \"Prof. Mike is a fink\". \"Different\" means each attack has a unique fix. For each attack, give a countermeasure the sender/receiver could take that would not help against any of the other attacks you list. Assume sender and receiver are on different machines, both running diskless workstations whose files are provided by NFS, and that you can spy on and/or alter packets on any network at the sender or receiver's site - but you cannot break into either machine.",
        officialSolution:
          "1. Signature not tied to the message: capture a signature from one message and replay it in a forged message. Fix: include a hash of the message in the signed portion.\n2. Finger request/response not authenticated: forge the finger response (or change the user ID being fingered) to supply an attacker's public key. Fix: encrypt/authenticate the channel between client and finger server.\n3. DNS not authenticated: direct the finger request to a server the attacker controls. Fix: authenticate the DNS server.\n4. The finger client binary is served over unauthenticated NFS at the receiver: alter it to print any public key. Fix: authenticate the NFS server at the receiver.\n5. The fingerd binary is served over unauthenticated NFS at the sender: alter it to send the wrong public key. Fix: authenticate the NFS server at the sender.\n(Also acceptable: the .finger file data itself is served over unauthenticated NFS - alter its contents; fixed by authenticating the sender-side NFS server.)",
        rubric: [
          { label: "Five distinct attacks spanning replay, finger, DNS, and NFS trust", points: 12 },
          { label: "A unique, attack-specific countermeasure for each", points: 8 },
        ],
      },
    ],
  ),
};
