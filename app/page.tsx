"use client";

import dynamic from "next/dynamic";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Code2,
  FileText,
  Flag,
  Home as HomeIcon,
  ListChecks,
  Play,
  RotateCcw,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading Java editor...</div>,
});

type QuestionType = "short" | "code";

type Rubric = {
  label: string;
  points: number;
};

type Question = {
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

type Exam = {
  id: string;
  title: string;
  subtitle: string;
  questions: Question[];
};

const computerContext = `public class Computer {
    private int memory;
    public Computer() { memory = 8; }
    public Computer(int m) { memory = m; }
    public void upgrade() { memory *= 2; }
    public String toString() { return "" + getMemory(); }
    public int getMemory() { return memory; }
}

public class PC extends Computer {
    public int getMemory() { return 10; }
}

public class Mac extends Computer {
    private int colors;
    public Mac(int c, int m) {
        super(m);
        colors = c;
    }
    public int getColors() { return colors; }
}`;

const roomContext = `public class Room {
    private int seats;
    public Room(int s) { seats = s; }
    public void expand() { seats += 5; }
    public int getSeats() { return seats; }
    public String toString() { return "room: " + seats; }
}

public class Meeting extends Room {
    private boolean tele;
    public Meeting(int s) { super(s); }
    public void expand() { tele = true; }
    public String toString() { return super.toString() + " " + tele; }
}

public class Classroom extends Room {
    private int plugs;
    public Classroom(int p, int s) {
        super(s * 2);
        plugs = p;
    }
    public void add(int p) {
        plugs += p;
        expand();
        expand();
    }
}`;

const examOne: Exam = {
  id: "sample-1",
  title: "CS 312 Sample Credit by Exam 1",
  subtitle: "UT Austin Computer Science sample exam",
  questions: [
    {
      id: "e1-q1",
      title: "1. Short Answer - Expressions",
      points: 10,
      type: "short",
      prompt:
        'For each Java expression, indicate the resulting value. You must show a value of the appropriate type, for example 7.0 rather than 7 for a double, "7" instead of 7 for a String, and \'7\' for a char.',
      code: `(int) (5 / 2 + 1.9 / .5)
12 % 15 + 15 % 12 + 291 / 100
"GDC".equals(new char[] {'G', 'D', 'C'})
"CS_PODS".substring(3).charAt(2)
"ECLIPSE".substring(2, 6).substring(3, 3)
(13 % 5 > 2) || (16 % (4 - 2 * 2) == 3)
Math.random() < 0.0 && Math.random() > 1.1
10 / 3 + 1.3 * 2 + 1 / 2
3 + 2 * 3 + "RING" + 10 / 2 + 5
"ABBA_BAD_CO".indexOf("BA", 4)`,
      answers: ["5", "17", "false", "'D'", '""', "true", "false", "5.6", '"9RING55"', "5"],
    },
    {
      id: "e1-q2",
      title: "2. Code Tracing",
      points: 22,
      type: "short",
      prompt:
        "For each code snippet, state the exact output to the screen. If the snippet contains a syntax error or other compile error, answer COMPILE ERROR. If it results in a runtime error or exception, answer RUNTIME ERROR. If it results in an infinite loop, answer INFINITE LOOP.",
      code: `A.
int[] data1 = {3, 1, 5};
a(data1, 3);
System.out.print(Arrays.toString(data1));

public static void a(int[] arr, int lim) {
    for (int i = 0; i < lim; i++) {
        int j = 0;
        while (j < i) {
            if (arr[j] % 2 == 1) {
                arr[i] += arr[j];
            }
            j++;
        }
    }
}

B. // Uses method a from part A.
int[] data2 = {4, 0, 2};
a(data2, 4);
System.out.print(Arrays.toString(data2));

C. // Uses method a from part A.
int[] data3 = new int[4];
a(data3, 2);
System.out.print(Arrays.toString(data3));

D. // Uses method a from part A.
int[] data4 = {1, 2, 1, 3, 0};
a(data4, 5);
System.out.print(Arrays.toString(data4));

E.
ArrayList<String> listE = new ArrayList<>();
System.out.print(listE.size() + " " );
listE.add("E");
listE.add("GC");
listE.add(0, "F");
System.out.print(listE + " " );

F.
int xf = 13;
double[][] dataF = new double[xf / 3][xf / 2 + 2];
System.out.print(dataF.length + " " + dataF[1].length + " " + dataF[1][2]);

G.
int[] dataG = {6, 3, 6, 10, 5};
int xg = dataG[dataG[1]];
System.out.println((xg < dataG.length) && (dataG[xg] == 0));

H.
int[] h1 = {1, 2, 4};
h(h1);
System.out.print(Arrays.toString(h1));

public static void h(int[] a) {
    a[1] *= a[2] + 1;
    a = new int[0];
}

I.
ArrayList<Integer> list2 = new ArrayList<>();
list2.add(list2.size());
list2.add(list2.size());
list2.add(7);
list2.add(list2.size());
list2.add(5 + list2.size() + list2.get(3));
list2.set(2, list2.size());
list2.remove(3);
list2.add(0);
System.out.print(list2);

J.
int xj = 5;
int[] dataj = new int[xj];
System.out.print(dataj[0] + " " + j(dataj));
public static int j(int[] data) {
    return 12 / data[2];
}

K.
int[] dataK = {0, 2};
System.out.print(Arrays.toString(dataK) + " " + k(dataK));
public static int k(int[] data) {
    data[0] += 2;
    data[1] += 3;
    System.out.print(data[1] + " ");
    return data[0] + data[1];
}

L.
int x5 = 10;
int y = 12;
int z = 20;
int t = 0;
while (x5 != y || y != z) {
    x5 += 4;
    t++;
}
System.out.print(t);

For M through V consider these classes:
public class Computer {
    private int memory;
    public Computer() { memory = 8; }
    public Computer(int m) { memory = m; }
    public void upgrade() { memory *= 2; }
    public String toString() { return "" + getMemory(); }
    public int getMemory() { return memory; }
}

public class PC extends Computer {
    public int getMemory() { return 10; }
}

public class Mac extends Computer {
    private int colors;
    public Mac(int c, int m) {
        super(m);
        colors = c;
    }
    public int getColors() { return colors; }
}

M.
PC p1 = new PC(16);        // legal or syntax error
Computer c1 = new PC();    // legal or syntax error

N.
Mac m1 = new Computer(12); // legal or syntax error
PC m2 = new Mac(10, 8);    // legal or syntax error

O.
Mac nm = new Mac(8, 4);
System.out.print(nm.getColors() + " " + nm.getMemory());

P.
Computer oc = new PC();
System.out.print(oc.getMemory());

Q.
Computer cp = new Mac(4, 8);
System.out.print(cp + " " + cp.getColors());

R.
PC pq = new PC();
System.out.print(pq);

S.
Mac mr1 = new Mac(8, 4);
Mac mr2 = new Mac(8, 4);
System.out.print((mr1 == mr2) + " " + mr2.equals(mr1));

T.
Computer cs = new Computer(4);
t(cs);
System.out.print(cs.toString());
public static void t(Computer c) {
    c.upgrade();
    c.upgrade();
}

U.
PC pt1 = new PC();
Computer ct1 = pt1;
u(pt1);
System.out.print(pt1 == ct1);
public static void u(PC p) {
    p = new PC();
    p.upgrade();
}

V.
If we try to add the following method to the Mac class, it won't compile.
Explain in one sentence why not.
public void upgrade(int x) { memory += x; }`,
      answers: [
        "[3, 4, 8]",
        "[4, 0, 2]",
        "[0, 0, 0, 0]",
        "[1, 3, 5, 12, 9]",
        "0 [F, E, GC]",
        "4 8 0.0",
        "false",
        "[1, 10, 4]",
        "[0, 1, 5, 12, 0]",
        "RUNTIME ERROR",
        "5 [0, 2] 7",
        "INFINITE LOOP",
        "syntax error; legal",
        "syntax error; syntax error",
        "8 4",
        "10",
        "SYNTAX ERROR",
        "10",
        "false false",
        "16",
        "true",
        "Because memory is private in Computer and is not accessible in Mac.",
      ],
    },
    {
      id: "e1-q3",
      title: "3. Critters - Yak",
      points: 16,
      type: "code",
      prompt:
        "Implement a Yak class that extends Critter. Override only fight, eat, and getMove. A Yak chooses a random NORTH/EAST/SOUTH/WEST direction with equal likelihood, moves 1 step that direction, then 2 steps in a new random direction, then 3, and so on. When fighting, a Yak ROARs if it would move NORTH or SOUTH next; otherwise it POUNCEs. A Yak always returns true when asked to eat.",
      stub: `public class Yak extends Critter {
    // include instance variables and any constructor you need

}`,
      answer: `public class Yak extends Critter {
    private static Direction[] dirs = Direction.values();
    private Direction dir;
    private int maxSteps;
    private int steps;

    public Yak() {
        dir = getRandomDirection();
        maxSteps = 1;
    }

    private Direction getRandomDirection() {
        int index = (int) (Math.random() * 4);
        return dirs[index];
    }

    public boolean eat() {
        return true;
    }

    public Direction getMove() {
        Direction result = dir;
        steps++;
        if (steps == maxSteps) {
            steps = 0;
            maxSteps++;
            dir = getRandomDirection();
        }
        return result;
    }

    public Attack fight(String opp) {
        if (dir == Direction.EAST || dir == Direction.WEST) {
            return Attack.POUNCE;
        }
        return Attack.ROAR;
    }
}`,
      rubric: [
        { label: "Header with extends clause", points: 1 },
        { label: "Instance variables track steps, leg length, and current direction", points: 1 },
        { label: "Instance variables are private", points: 1 },
        { label: "Random direction chosen correctly and equally among four directions", points: 2 },
        { label: "eat overridden correctly", points: 1 },
        { label: "fight checks the correct next direction and returns the correct attack", points: 4 },
        { label: "getMove handles incrementing steps this leg and direction to return", points: 2 },
        { label: "getMove updates steps, leg length, and direction at the end of a leg", points: 4 },
      ],
    },
    {
      id: "e1-q4",
      title: "4. Data Processing and Arrays",
      points: 17,
      type: "code",
      prompt:
        "Write capitalLettersPresent. The required array length is 26 and stores the minimum required count for 'A' through 'Z'. Determine whether the Scanner data source contains at least the required number of each English capital letter. You may use Scanner hasNext/next, String length/charAt, alter required, and use required.length. Do not create new arrays.",
      stub: `/* required.length = 26. All elements of required >= 0. */
public static boolean capitalLettersPresent(Scanner sc, int[] required) {

}`,
      answer: `public static boolean capitalLettersPresent(Scanner sc, int[] required) {
    while (sc.hasNext()) {
        String s = sc.next();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if ('A' <= ch && ch <= 'Z') {
                int index = ch - 'A';
                if (required[index] > 0) {
                    required[index]--;
                }
            }
        }
    }
    for (int numLeft : required) {
        if (numLeft > 0) {
            return false;
        }
    }
    return true;
}`,
      rubric: [
        { label: "Correctly loops while hasNext is true for the Scanner", points: 2 },
        { label: "Gets the next token from the Scanner", points: 2 },
        { label: "Loops through all characters of the token", points: 2 },
        { label: "Correctly checks that the current char is a capital letter", points: 4 },
        { label: "Correctly updates the counter for the given letter", points: 3 },
        { label: "After reading all tokens, checks counters and returns false if any are above zero", points: 3 },
        { label: "Returns true when requirements are met", points: 1 },
      ],
    },
    {
      id: "e1-q5",
      title: "5. Arrays - copyWithoutRange",
      points: 16,
      type: "code",
      prompt:
        "Write copyWithoutRange. Return a new array containing all elements from vals except indices in [start, stop). You may create one additional array. The original array is not altered. Use no Java classes or methods other than the array length field.",
      stub: `public static int[] copyWithoutRange(int[] vals, int start, int stop) {

}`,
      answer: `public static int[] copyWithoutRange(int[] vals, int start, int stop) {
    int newLen = vals.length - (stop - start);
    int[] result = new int[newLen];
    for (int i = 0; i < start; i++) {
        result[i] = vals[i];
    }
    int indexResult = start;
    for (int i = stop; i < vals.length; i++) {
        result[indexResult] = vals[i];
        indexResult++;
    }
    return result;
}`,
      rubric: [
        { label: "Creates result array of correct size", points: 2 },
        { label: "Copies elements before start", points: 4 },
        { label: "Copies elements from stop through the end", points: 4 },
        { label: "Tracks result index correctly", points: 4 },
        { label: "Returns the new array without altering vals", points: 2 },
      ],
    },
    {
      id: "e1-q6",
      title: "6. Arrays and Objects - minDistance",
      points: 17,
      type: "code",
      prompt:
        "Given an array of Point objects, return the minimum distance between the two closest Points. Assume pts.length >= 2 and no elements are null. Use only the given Point methods getX, getY, distance, and the array length field.",
      stub: `public static double minDistance(Point[] pts) {

}`,
      answer: `public static double minDistance(Point[] pts) {
    double min = pts[0].distance(pts[1]);
    for (int i = 0; i < pts.length; i++) {
        Point p1 = pts[i];
        for (int j = i + 1; j < pts.length; j++) {
            Point p2 = pts[j];
            double distance = p1.distance(p2);
            if (distance < min) {
                min = distance;
            }
        }
    }
    return min;
}`,
      rubric: [
        { label: "Variable for minimum distance of type double", points: 1 },
        { label: "Correctly initializes minimum distance", points: 2 },
        { label: "Outer loop covers all Points", points: 3 },
        { label: "Inner loop checks all Points after the current Point", points: 5 },
        { label: "Correctly accesses Point objects from the array", points: 1 },
        { label: "Correctly calculates distance using the distance method", points: 2 },
        { label: "Updates the minimum distance when current distance is smaller", points: 2 },
        { label: "Returns the correct result", points: 1 },
      ],
    },
    {
      id: "e1-q7",
      title: "7. ArrayLists and Data Processing",
      points: 16,
      type: "code",
      prompt:
        "Write removeStrings. Alter the given ArrayList<String> by removing values that appear in a file connected to a Scanner, and return the number removed. If duplicates exist, remove the matching value closest to the beginning for each file token. Use only size, get, remove, Scanner methods, and String equals.",
      stub: `public static int removeStrings(Scanner sc, ArrayList<String> list) {

}`,
      answer: `public static int removeStrings(Scanner sc, ArrayList<String> list) {
    int count = 0;
    while (sc.hasNext()) {
        String s = sc.next();
        boolean search = true;
        int i = 0;
        while (i < list.size() && search) {
            if (list.get(i).equals(s)) {
                search = false;
                list.remove(i);
                count++;
            }
            i++;
        }
    }
    return count;
}`,
      rubric: [
        { label: "Counts removals", points: 1 },
        { label: "Correct Scanner loop", points: 2 },
        { label: "Gets the next token", points: 1 },
        { label: "Loops through elements of the ArrayList", points: 3 },
        { label: "Stops when the first occurrence is found", points: 2 },
        { label: "Uses size and get methods for ArrayList", points: 2 },
        { label: "Uses equals method from String", points: 2 },
        { label: "Removes from list and increments counter if matched", points: 2 },
        { label: "Returns correct result", points: 1 },
      ],
    },
    {
      id: "e1-q8",
      title: "8. 2D Arrays - clampValues",
      points: 16,
      type: "code",
      prompt:
        "Write clampValues. Given a rectangular int matrix and the row/column of the lower-right corner of a region, set every in-bounds value in that region to at least the target value. The region has width w and height h; out-of-bounds cells are ignored. Do not create arrays or use other Java classes/methods.",
      stub: `public void clampValues(int[][] mat, int r, int c, int w, int h, int tgt) {

}`,
      answer: `public void clampValues(int[][] mat, int r, int c, int w, int h, int tgt) {
    int startRow = r - h + 1;
    if (startRow < 0) {
        startRow = 0;
    }
    int startCol = c - w + 1;
    if (startCol < 0) {
        startCol = 0;
    }
    for (int row = startRow; row <= r; row++) {
        for (int col = startCol; col <= c; col++) {
            if (mat[row][col] < tgt) {
                mat[row][col] = tgt;
            }
        }
    }
}`,
      rubric: [
        { label: "Uses nested loops over the specified region", points: 3 },
        { label: "Bounds-checks row and column starts correctly", points: 6 },
        { label: "Treats r,c as lower-right corner", points: 2 },
        { label: "Accesses elements and clamps only values below target", points: 4 },
        { label: "Avoids unnecessary or disallowed work", points: 1 },
      ],
    },
  ],
};

const examTwo: Exam = {
  id: "sample-2",
  title: "CS 312 Sample Credit by Exam 2",
  subtitle: "UT Austin Computer Science sample exam",
  questions: [
    {
      id: "e2-q1",
      title: "1. Short Answer - Expressions",
      points: 10,
      type: "short",
      prompt:
        'For each Java expression, indicate the resulting value with the appropriate type, for example 7.0 rather than 7 for a double, "7" for a String, and \'7\' for a char.',
      code: `(3 / 2 == 0) + "H" + 2 * 5 + 1.5
73983 % 1000 / 100 + 10 * 5 * 1.0
10 / 3 + 17 % 30 + 2.5 % 2.0
(int) 2.752 * 10 + 5.0
"CS312".charAt(2) == '3'
12 % 3 != 0 || 3 == '3'
Math.floor(-2.31) + Math.round(-1.5)
"cat".toUpperCase() == "CAT"
"longhorns_or+tv".indexOf("or") * 2
"super_tas".indexOf("TAs") - 3`,
      answers: ['"falseH101.5"', "59.0", "20.5", "25.0", "true", "false", "-4.0", "false", "10", "-4"],
    },
    {
      id: "e2-q2",
      title: "2. Code Tracing",
      points: 24,
      type: "short",
      prompt:
        "For each snippet, state the exact output. Answer COMPILE ERROR, RUNTIME ERROR, or INFINITE LOOP when appropriate.",
      code: `A.
int[] a1 = {5, 2, 4, 6, 1};
a(a1);
System.out.print(Arrays.toString(a1));

public static void a(int[] arr) {
    arr[0] = arr[3];
    arr[arr.length - 2] -= 3;
    arr[arr[1]] += 3;
    arr[arr.length / 2] += 5;
    arr[0] = arr[3];
    arr[3] = 7;
}

B.
double[] b1 = {.5, 2, 1.5};
double tot1 = 0.0;
for (double a : b1) {
    tot1 += a;
}
System.out.print(tot1 + " " + b1[1]);

C.
int c1 = 80;
int t2 = 0;
while (c1 > 0 && t2 < 20) {
    t2++;
    c1 /= 2;
}
System.out.print(c1 + " " + t2);

D.
String d1 = "CAT_DOG";
String d2 = "DOG";
String d3 = d1.substring(4);
String d4 = d2;
d2.substring(1);
System.out.print((d2 == d4) + " " + (d1 == d3));

E.
boolean[] es = new boolean[6];
System.out.println(es[2] + " " + (es[3] == es[4]));

F.
String[][] namTab = new String[10][4];
int ft = 0;
for (int r = 0; r < namTab.length; r++) {
    ft += namTab[r].length;
}
System.out.print(namTab.length + " " + ft);

G.
int[] g1 = {5};
g(g1);
System.out.print(Arrays.toString(g1));
public static void g(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = 0; j < i; j++) {
            arr[i] += arr[j];
        }
    }
}

H. (uses method from part G)
int[] h1 = {2, 1, 4};
g(h1);
System.out.print(Arrays.toString(h1));

I. (uses method from part G)
int[] i1 = {1, 1, 1, 1, 1, 2};
g(i1);
System.out.print(Arrays.toString(i1));

J. (uses method from part G)
int[] j1 = {-3, 0, 5, -2, 7, -10};
g(j1);
System.out.print(Arrays.toString(j1));

K. (Consider the given enum)
System.out.print(CS_Area.values().length + " " + CS_Area.values()[2]);
public enum CS_Area {
    PROGRAMMING, THEORY, SYSTEMS
}

L.
int[] va = new int[3];
va[1]++;
va[va.length - 1]--;
va++
va[1] += va[2];
System.out.print(Arrays.toString(va));

M.
ArrayList<String> w = new ArrayList<>();
w.add("K");
w.add("P");
w.add("B");
w.add(1, "G");
w.add("G");
w.remove(2);
w.add(3, "A");
w.remove("G");
System.out.print(w);

N.
ArrayList<String> xs = new ArrayList<>(5);
System.out.print(xs.size());

For O through X consider these classes:
public class Room {
    private int seats;
    public Room(int s) { seats = s; }
    public void expand() { seats += 5; }
    public int getSeats() { return seats; }
    public String toString() { return "room: " + seats; }
}

public class Meeting extends Room {
    private boolean tele;
    public Meeting(int s) { super(s); }
    public void expand() { tele = true; }
    public String toString() { return super.toString() + " " + tele; }
}

public class Classroom extends Room {
    private int plugs;
    public Classroom(int p, int s) {
        super(s * 2);
        plugs = p;
    }
    public void add(int p) {
        plugs += p;
        expand();
        expand();
    }
}

O.
Object obj = Room();              // legal or syntax error
Room r1 = new Classroom(10, 10);  // legal or syntax error

P.
Meeting m1 = new Object(5);       // legal or syntax error
Meeting m2 = new Classroom(10, 10); // legal or syntax error

Q.
Classroom c3 = new Classroom(10, 10);
c3.add(2);
System.out.print(c3);

R.
Room or = new Room(20);
o(or);
System.out.print(or);
public static void o(Room r) {
    r.expand();
    r.expand();
}

S.
Room pr = new Room(20);
p(pr);
System.out.print(pr);
public static void p(Room r) {
    r.expand();
    r = new Room(0);
}

T.
Room qr = new Room(10);
qr.seats -= 5;
System.out.print(qr.toString());

U.
Classroom cr1 = new Classroom(5, 5);
Classroom cr2 = new Classroom(10, 10);
cr2.expand();
cr2 = cr1;
cr1.expand();
cr2.expand();
System.out.print(cr1);

V.
Room cs = new Meeting(10);
cs.expand();
System.out.print(cs);

W.
Classroom ct1 = new Classroom(25, 10);
Classroom ct2 = new Classroom(25, 10);
System.out.print(ct1.toString().equals(ct2.toString()) + " " + ct1.equals(ct2));

X.
int[] ua = {-1, 2};
System.out.print(um(ua, 2) + " " + ua[1] + " " + um(ua, 1));
public static int um(int[] ar, int x) {
    ar[0] *= x;
    ar[1] += x;
    System.out.print(Arrays.toString(ar));
    return ar[0] + ar[1];
}`,
      answers: [
        "[3, 2, 12, 7, 1]",
        "4.0 2.0",
        "0 7",
        "true false",
        "false true",
        "10 40",
        "[5]",
        "[2, 3, 9]",
        "[1, 2, 4, 8, 16, 33]",
        "[-3, -3, -1, -9, -9, -35]",
        "3 SYSTEMS",
        "COMPILE ERROR",
        "[K, B, A, G]",
        "0",
        "syntax error; legal",
        "syntax error; syntax error",
        "room: 30",
        "room: 30",
        "room: 25",
        "COMPILE ERROR",
        "room: 20",
        "room: 10 true",
        "true false",
        "[-2, 4][-2, 5]2 4 3",
      ],
    },
    {
      id: "e2-q3",
      title: "3. Critters - JumpingBean",
      points: 16,
      type: "code",
      prompt:
        "Implement JumpingBean. It sits still until involved in a fight. If it wins, it later moves in random NORTH or WEST direction. After the first win it moves twice, after the second win 4 times, adding 2 moves each win. It SCRATCHes if sitting still and FORFEITs if it would move next.",
      stub: `public class JumpingBean extends Critter {
    // include instance variables and any constructor you need

}`,
      answer: `public class JumpingBean extends Critter {
    private int stepsSoFar;
    private int maxStepsThisLeg;
    private boolean moving;
    private Direction dir;

    public Attack fight(String opp) {
        if (moving) {
            return Attack.FORFEIT;
        }
        moving = true;
        maxStepsThisLeg += 2;
        stepsSoFar = 0;
        dir = Direction.NORTH;
        if (Math.random() >= 0.5) {
            dir = Direction.WEST;
        }
        return Attack.SCRATCH;
    }

    public Direction getMove() {
        if (!moving) {
            return Direction.CENTER;
        }
        stepsSoFar++;
        if (stepsSoFar == maxStepsThisLeg) {
            moving = false;
        }
        return dir;
    }
}`,
      rubric: [
        { label: "Header with extends clause", points: 2 },
        { label: "Instance variables track steps, leg length, direction, and moving/celebrating", points: 1 },
        { label: "Instance variables are private", points: 1 },
        { label: "fight forfeits when already moving", points: 1 },
        { label: "fight prepares for moving correctly when not moving", points: 5 },
        { label: "fight returns SCRATCH when sitting still", points: 1 },
        { label: "getMove returns CENTER when idle", points: 1 },
        { label: "getMove increments steps when moving", points: 1 },
        { label: "getMove checks for end of leg and stops moving", points: 2 },
        { label: "getMove returns the direction when moving", points: 1 },
      ],
    },
    {
      id: "e2-q4",
      title: "4. Data Processing - printMoney",
      points: 18,
      type: "code",
      prompt:
        "Write printMoney. Each file line has a name followed by zero or more int/symbol pairs using K, S, and G for Knuts, Sickles, and Galleons. Invalid symbols are ignored. Print each original name and total value in Galleons, using singular Galleon only for 1.0.",
      stub: `public static void printMoney(Scanner sc) {

}`,
      answer: `public static void printMoney(Scanner sc) {
    final double GALLEON_PER_SICKLE = 1 / 17.0;
    final double GALLEON_PER_KNUT = 1 / 29.0 / 17.0;
    while (sc.hasNextLine()) {
        Scanner line = new Scanner(sc.nextLine());
        while (!line.hasNextInt()) {
            System.out.print(line.next() + " ");
        }
        double total = 0.0;
        while (line.hasNext()) {
            int num = line.nextInt();
            String symbol = line.next();
            if (symbol.equals("K")) {
                total += GALLEON_PER_KNUT * num;
            } else if (symbol.equals("S")) {
                total += GALLEON_PER_SICKLE * num;
            } else if (symbol.equals("G")) {
                total += num;
            }
        }
        System.out.print(total + " Galleon");
        if (total != 1.0) {
            System.out.print("s");
        }
        System.out.println();
    }
}`,
      rubric: [
        { label: "Loops through lines correctly", points: 2 },
        { label: "Creates Scanner for line", points: 2 },
        { label: "Prints or saves the name correctly", points: 3 },
        { label: "Tracks total for current person", points: 1 },
        { label: "Loops while line has next correctly", points: 2 },
        { label: "Reads int value correctly", points: 1 },
        { label: "Gets and checks symbol correctly", points: 4 },
        { label: "Adds correct value to running total", points: 2 },
        { label: "Prints Galleon/Galleons correctly", points: 1 },
      ],
    },
    {
      id: "e2-q5",
      title: "5. Arrays - getReversedSubList",
      points: 12,
      type: "code",
      prompt:
        "Return a new int array containing vals[startIndex] through vals[stopIndex - 1] in reverse order. You may create the returned array and use no Java classes/methods other than array length.",
      stub: `public static int[] getReversedSubList(int[] vals, int startIndex, int stopIndex) {

}`,
      answer: `public static int[] getReversedSubList(int[] vals, int startIndex, int stopIndex) {
    int[] result = new int[stopIndex - startIndex];
    int indexVals = stopIndex - 1;
    for (int i = 0; i < result.length; i++) {
        result[i] = vals[indexVals];
        indexVals--;
    }
    return result;
}`,
      rubric: [
        { label: "Creates result array of correct size", points: 2 },
        { label: "Uses correct loop bounds", points: 4 },
        { label: "Copies the right values in reverse order", points: 4 },
        { label: "Returns result without altering vals", points: 2 },
      ],
    },
    {
      id: "e2-q6",
      title: "6. Arrays - insertElementsAtFront",
      points: 16,
      type: "code",
      prompt:
        "Insert all elements from the second array at the beginning of the first array, shifting original first-array elements down and dropping extras. If two is larger, copy only what fits. Do not create new arrays.",
      stub: `public static void insertElementsAtFront(int[] one, int[] two) {

}`,
      answer: `public static void insertElementsAtFront(int[] one, int[] two) {
    int numMove = one.length - two.length;
    for (int i = numMove - 1; i >= 0; i--) {
        one[i + two.length] = one[i];
    }
    int limit = two.length;
    if (one.length < two.length) {
        limit = one.length;
    }
    for (int i = 0; i < limit; i++) {
        one[i] = two[i];
    }
}`,
      rubric: [
        { label: "Shifts first-array elements down correctly", points: 7 },
        { label: "Limits copy when two is larger", points: 5 },
        { label: "Copies second-array elements into front", points: 4 },
      ],
    },
    {
      id: "e2-q7",
      title: "7. ArrayLists - removeValues",
      points: 16,
      type: "code",
      prompt:
        "Remove all String values that contain target character c in the first n characters. Preserve relative order and return number removed. Use only ArrayList size/get/remove and String methods; do not create new Strings or data structures.",
      stub: `public static int removeValues(ArrayList<String> list, char c, int n) {

}`,
      answer: `public static int removeValues(ArrayList<String> list, char c, int n) {
    int numRemoved = 0;
    for (int i = list.size() - 1; i >= 0; i--) {
        String s = list.get(i);
        boolean found = false;
        int index = 0;
        while (index < n && !found && index < s.length()) {
            found = s.charAt(index) == c;
            index++;
        }
        if (found) {
            list.remove(i);
            numRemoved++;
        }
    }
    return numRemoved;
}`,
      rubric: [
        { label: "Counts removals", points: 1 },
        { label: "Loops from back or otherwise avoids skipping elements on remove", points: 5 },
        { label: "Bounds check length of String", points: 3 },
        { label: "Bounds check n", points: 1 },
        { label: "Stops when target char is found", points: 1 },
        { label: "Accesses char correctly", points: 1 },
        { label: "Removes from list if char is found", points: 2 },
        { label: "Increments counter", points: 1 },
        { label: "Returns number removed", points: 1 },
      ],
    },
    {
      id: "e2-q8",
      title: "8. 2D Arrays - coinsCollected",
      points: 18,
      type: "code",
      prompt:
        "Return the number of coins collected by a robot starting in the leftmost column at initialRow. It moves up, down, or right, never left, never re-enters a cell, and stops when it first enters the rightmost column. Each move chooses the adjacent valid cell with the most coins; ties prefer up, then down, then right.",
      stub: `public int coinsCollected(int[][] mat, int initialRow) {

}`,
      answer: `public static int coinsCollected(int[][] mat, int initialRow) {
    int col = 0;
    int row = initialRow;
    int total = 0;
    while (col < mat[0].length - 1) {
        total += mat[row][col];
        mat[row][col] = -1;
        int up = -1;
        if (row > 0) {
            up = mat[row - 1][col];
        }
        int down = -1;
        if (row + 1 < mat.length) {
            down = mat[row + 1][col];
        }
        int right = mat[row][col + 1];
        if (up >= down && up >= right) {
            row--;
        } else if (down >= up && down >= right) {
            row++;
        } else {
            col++;
        }
    }
    total += mat[row][col];
    return total;
}`,
      rubric: [
        { label: "Tracks row and column", points: 2 },
        { label: "Loops until last column", points: 4 },
        { label: "Checks up/down/right with bounds", points: 4 },
        { label: "Marks visited cells to avoid re-entry", points: 5 },
        { label: "Chooses max and breaks ties up/down/right", points: 3 },
      ],
    },
  ],
};

const cs314ExamOne: Exam = {
  id: "cs314-fall-2025-e1",
  title: "CS 314 Fall 2025 Exam 1",
  subtitle: "Data structures, generics, matrices, and multisets",
  questions: [
    {
      id: "cs314-e1-q1",
      title: "1. Short Answer",
      points: 50,
      type: "short",
      prompt:
        "Answer each short-answer item. For compile errors answer compile error; for runtime errors answer runtime error; for infinite loops answer infinite loop. Big O answers should be the most restrictive correct Big O.",
      code: `A. A method is O(N^4). It takes 2 seconds when N = 5,000. Expected time when N = 10,000?
B. Using lecture rules, what is T(N) for b where N = n?
public static int b(int n) {
    int t = 0;
    for (int i = 0; i < n; i++) {
        int t2 = i * i;
        t += t2;
    }
    final int LIMIT = n * 3;
    for (int i = 0; i < LIMIT; i++) {
        t += i * 3;
    }
    return t;
}
C. Method b from 1.B takes 2 seconds when n = 1,000,000. Expected time when n = 5,000,000?
D. Using lecture rules, what is T(N) for d where N = data.length?
public static int d(int[] data) {
    int t = 0;
    for (int i = 0; i < data.length; i++) {
        int t1 = data[i];
        for (int j = 0; j < data.length; j++) {
            int t2 = data[j];
            for (int k = 0; k < data.length; k++) {
                t += data[k] * t1 / t2;
            }
        }
    }
    return t;
}
E. The method e was officially thrown out on the key. Answer with the official status.
F. What is the order of f? Method check is O(N) where N = n.
public static int f(int n) {
    int t = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            t += check(i, j, n);
        }
    }
    for (int i = 0; i < n; i++) {
        t += check(i, i, n);
    }
    return t;
}
G. What is the best-case order of g where N = list.size()?
public static void g(ArrayList<Integer> list) {
    for (int i = 0; i < list.size(); i++) {
        if (list.get(i) % 2 == 0) {
            list.remove(0);
        } else {
            list.remove(list.size() - 1);
        }
    }
}
H. What is output?
ArrayList<String> letters = new ArrayList<>();
letters.add("C");
letters.add("CS");
letters.add(1, "B");
letters.add(2, "GO");
letters.remove(1);
letters.add(2, letters.get(letters.size() - 3));
System.out.println(letters);
I. True or false: there is no way for a class that states implements Comparable to compile without implementing compareTo inside that class.
J. True or false: this IntList toString meets lecture requirements.
public String toString() {
    return Arrays.toString(con);
}
K. Method k takes 3 seconds with n = 25,000 and an all-zero int array. Expected time when n = 50,000?
L. GenericList<String> compile-time errors. List all line numbers or No compile errors.
GenericList<String> list = new GenericList<>(); // 1
list.add("CS314"); // 2
String s1 = "CS311"; // 3
list.add(s1); // 4
list.add(list.get(0).toLowerCase()); // 5
list.add(s1.substring(1, 15)); // 6
list.add("!"); // 7
M. GenericList<String> compile-time errors. List all line numbers or No compile errors.
GenericList<String> list1 = new GenericList<>(); // 1
list1.add(314 + ""); // 2
String s2 = "CS429"; // 3
list1.add(s2.charAt(2)); // 4
list1.add(list1.get(0).substring(1, 2)); // 5
list1.add(439); // 6
list1.add(s2 + s2 + s2); // 7
list1.add(list1.toString()); // 8
N. True or false: in Java, all data structures can be the target of enhanced for loops.
O1. StandardPackage sp1 = new FragilePackage(2, 50); // compiles or error
O2. Object o1 = new Package(5); // compiles or error
P1. Package p1 = new InsuredPackage(10, 3); // compiles or error
P2. FragilePackage fp1 = new Package(5); // compiles or error
Q. FeatherPackage fp2 = new FeatherPackage(); System.out.print(fp2.getCost() + " " + fp2.getWeight());
R. InsuredPackage ip1 = new InsuredPackage(2, 5); System.out.print(ip1);
S. InsuredPackage ip2 = new InsuredPackage(2, 5); System.out.print(ip2.getCost());
T. Package p2 = new FragilePackage(2, 5); p2.setInsure(5, 2); System.out.print(p2.getCost());
U. Package p3 = new Package(10); Package p4 = new Package(10); System.out.print(p3.equals(p4));
V. Package p5 = new FragilePackage(2, 5); System.out.print(p5.getCost());
W. Given w below, what is output?
public static void w(InsuredPackage ip) {
    ip.setInsure(2);
    System.out.print(ip.getCost() + " ");
    ip = new InsuredPackage(3, 3);
    ip.setInsure(3);
    System.out.print(ip.getCost() + " ");
}
InsuredPackage ip = new InsuredPackage(1, 1);
w(ip);
System.out.print(ip.getCost());
X. MediaPackage extends Package and tries to return 2 + mult * weight / 2 from getCost(int mult). MediaPackage mp1 = new MediaPackage(10); System.out.print(mp1.getCost(10));
Y. What is output when constructing new C?
public class A { public A() { System.out.print(4); } }
public class B extends A { public B() { System.out.print(1); } }
public class C extends B { public C() { System.out.print(3); } }`,
      reference: `public class Package {
    private int weight;
    public Package(int weight) { this.weight = weight; }
    public int getCost() { return 5 + weight * 2; }
    public int getWeight() { return weight; }
}

public class FeatherPackage extends Package {
    public FeatherPackage() { super(50); }
    public int getWeight() { return 0; }
}

public class StandardPackage extends Package {
    private int shippingTime;
    public StandardPackage(int weight, int time) {
        super(weight);
        shippingTime = time;
    }
    public int getCost() { return super.getCost() + 2 * shippingTime; }
    public String toString() { return "t: " + shippingTime; }
}

public class InsuredPackage extends StandardPackage {
    private int insuranceCost;
    public InsuredPackage(int wt, int t) { super(wt, t); }
    public void setInsure(int cost) { insuranceCost = cost; }
    public int getCost() { return super.getCost() + insuranceCost * 3; }
}

public class FragilePackage extends Package {
    private int fee;
    public FragilePackage(int weight, int fee) {
        super(weight);
        this.fee = fee;
    }
    public int getCost() { return 10 * fee + getWeight(); }
}`,
      answers: [
        "32 seconds",
        "13N + 7",
        "10 seconds",
        "3N^3 + 5N^2 + 5N + 4",
        "Thrown out",
        "O(N^3)",
        "O(N)",
        "[C, GO, C, CS]",
        "false",
        "false",
        "12 seconds",
        "No compile errors",
        "4 and 6",
        "false",
        "error",
        "compiles",
        "compiles",
        "error",
        "105 0",
        "t: 5",
        "19",
        "COMPILE ERROR",
        "false",
        "52",
        "15 26 15",
        "COMPILE ERROR",
        "413",
      ],
      answerPoints: [...Array(14).fill(2), 1, 1, 1, 1, ...Array(9).fill(2)],
    },
    {
      id: "cs314-e1-q2",
      title: "2. Lists - copyWithoutTarget",
      points: 17,
      type: "code",
      prompt:
        "Inside GenericList<E>, implement copyWithoutTarget. Return a new GenericList containing all elements of the calling list except those equal to target. Preserve relative order. This list is not altered. You may use equals and array length, create only the returned GenericList and its native array, and use only the shown zero-argument constructor unless you implement more yourself.",
      stub: `// pre: target != null
// post: per the problem description
public GenericList<E> copyWithoutTarget(E target) {

}`,
      answer: `public GenericList<E> copyWithoutTarget(E target) {
    GenericList<E> result = new GenericList<>();
    result.con = (E[]) new Object[size + 10];
    for (int i = 0; i < size; i++) {
        if (!con[i].equals(target)) {
            result.con[result.size] = con[i];
            result.size++;
        }
    }
    return result;
}`,
      rubric: [
        { label: "Creates a new GenericList result using an allowed constructor", points: 1 },
        { label: "Creates the result array correctly, with at least one element of extra capacity", points: 2 },
        { label: "Loops over exactly the active size elements of this list", points: 3 },
        { label: "Uses equals correctly to exclude target values", points: 3 },
        { label: "Adds kept elements to the correct next spot in the result array", points: 4 },
        { label: "Maintains result size and does not alter this list", points: 2 },
        { label: "Returns the resulting GenericList without disallowed methods or extra structures", points: 2 },
      ],
    },
    {
      id: "cs314-e1-q3",
      title: "3. MathMatrix - concatenate",
      points: 16,
      type: "code",
      prompt:
        "Inside MathMatrix, implement concatenate. Return a new MathMatrix formed by horizontally concatenating this matrix on the left and rhs on the right. Use only the shown constructor and array length; do not use other MathMatrix methods or create extra data structures beyond the result.",
      stub: `// pre: rhs != null. The number of rows in this and rhs are equal.
public MathMatrix concatenate(MathMatrix rhs) {

}`,
      answer: `public MathMatrix concatenate(MathMatrix rhs) {
    int newColumns = cells[0].length + rhs.cells[0].length;
    MathMatrix result = new MathMatrix(cells.length, newColumns);
    for (int r = 0; r < cells.length; r++) {
        for (int c = 0; c < cells[0].length; c++) {
            result.cells[r][c] = cells[r][c];
        }
    }
    int offset = cells[0].length;
    for (int r = 0; r < rhs.cells.length; r++) {
        for (int c = 0; c < rhs.cells[0].length; c++) {
            result.cells[r][c + offset] = rhs.cells[r][c];
        }
    }
    return result;
}`,
      rubric: [
        { label: "Creates the resulting MathMatrix with the given constructor", points: 1 },
        { label: "Computes result dimensions from both matrices correctly", points: 2 },
        { label: "Copies all elements from this matrix into the left side of result", points: 4 },
        { label: "Attempts to copy rhs elements into the result", points: 2 },
        { label: "Copies rhs with the correct column offset for horizontal concatenation", points: 4 },
        { label: "Accesses MathMatrix internal arrays correctly", points: 2 },
        { label: "Returns the resulting MathMatrix", points: 1 },
      ],
    },
    {
      id: "cs314-e1-q4",
      title: "4. MultiSet - getIntersection",
      points: 17,
      type: "code",
      prompt:
        "Inside MultiSet<E>, implement getIntersection. Return a new MultiSet containing each value that appears in both multisets with frequency equal to the smaller frequency. Do not alter either multiset. You may use equals and Math.min, and create only the new MultiSet and its necessary internal ValueAndFrequency entries.",
      stub: `/* pre: other != null
   post: per the problem description */
public MultiSet<E> getIntersection(MultiSet<E> other) {

}`,
      answer: `public MultiSet<E> getIntersection(MultiSet<E> other) {
    MultiSet<E> result = new MultiSet<>(numDistinct + 5);
    for (int i = 0; i < numDistinct; i++) {
        E target = con[i].element;
        int indexInOther = other.indexOf(target);
        if (indexInOther != -1) {
            int newFreq = Math.min(con[i].frequency, other.con[indexInOther].frequency);
            result.con[result.numDistinct] = new ValueAndFrequency<>(target, newFreq);
            result.numDistinct++;
            result.size += newFreq;
        }
    }
    return result;
}

private int indexOf(E tgt) {
    for (int i = 0; i < numDistinct; i++) {
        if (con[i].element.equals(tgt)) {
            return i;
        }
    }
    return -1;
}`,
      rubric: [
        { label: "Creates the resulting MultiSet with extra capacity", points: 2 },
        { label: "Loops over distinct active elements only", points: 2 },
        { label: "Searches the other MultiSet for matching elements correctly", points: 3 },
        { label: "Uses equals on stored elements correctly", points: 1 },
        { label: "Uses the minimum of the two frequencies", points: 2 },
        { label: "Creates new ValueAndFrequency objects instead of shallow copying", points: 2 },
        { label: "Stores entries in the correct result positions", points: 2 },
        { label: "Updates result size and numDistinct correctly", points: 2 },
        { label: "Returns the result without altering either operand or using disallowed structures", points: 1 },
      ],
    },
  ],
};

const cs314ExamTwo: Exam = {
  id: "cs314-fall-2025-e2",
  title: "CS 314 Fall 2025 Exam 2",
  subtitle: "Maps, linked lists, recursion, sorting, queues, and trees",
  questions: [
    {
      id: "cs314-e2-q1",
      title: "1. Short Answer",
      points: 50,
      type: "short",
      prompt:
        "Answer each short-answer item. For compile errors answer compile error; for runtime errors answer runtime error; for infinite loops answer infinite loop. Big O answers should be the most restrictive correct Big O.",
      code: `A. What is returned by a(4)?
public static int a(int x) {
    if (x == 0) {
        return 2;
    }
    return (x * 2) + a(x - 1);
}
B. What is returned by mosTQ(5)?
public static int mosTQ(int x) {
    if (x <= 2) {
        return 3;
    }
    return x + mosTQ(x - 2) + mosTQ(x - 1);
}
C. What is returned by c(2634)?
public static int c(int n) {
    if (n == 0) {
        return 0;
    } else if (n % 2 == 0) {
        return n % 10 - c(n / 10);
    }
    return n % 10 + c(n / 10);
}
D. What is the order of method c from 1.C? N = n.
E. HashMap output size after putting i % 7, i % 11, and i % 13 for i from 1 through 130.
F. TreeMap output for data {5, 2, 0, 0, 5, 5, 2}, putting key data[i] and value i.
G. HashMap + LinkedList loop takes 2 seconds when map.size() = 200,000 and list.size() = 50,000. Expected time when map.size() = 600,000 and list.size() = 100,000?
H. LinkedList314 indexed get loop takes 2 seconds when list.size() = 10,000. Expected time when list.size() = 30,000?
I. Dependent loop i *= 2 and inner j < i takes 10 seconds when n = 1,000,000. Expected time when n = 2,000,000?
J. A sorted ArrayList has two random values appended, then sort(list) is called. Which studied sort typically has the fewest computations? Choices: A Selection, B Insertion, C Radix, D Quicksort, E Mergesort.
K. TreeMap containsKey/get loop takes 10 seconds when map.size() = 1,000,000 and data.length = 1,000,000. Expected time when map.size() = 4,000,000 and data.length = 2,000,000?
L. Stack314 pushes 5 down to 0, then loops for i < st.size() and pops into sum. What is printed?
M. Which storage containers can make all four stack operations average case O(1)? Choices: A LL314, B java.util.LinkedList, C java.util.ArrayList, D native array, E none, F all.
N. Queue314 enqueues odd values from {5,3,2,7,1,2,4,12,3,9,8,3}, dequeues five into s, then prints s and q.front().
O. java.util.LinkedList iterator removal takes 3 seconds when list.size() = 250,000. Expected time when list.size() = 500,000?
P. Search an N by N row-major sorted 2d array with no new structures. Which order? Choices: A O(logN), B O((logN)^2), C O(N), D O(NlogN), E O(N^2).
Q. Mergesort on [9, 54, 5, 18, 78, 14, 23, 20, 0, 12]. Which array appears before final merge? Choices: A [5, 9, 18, 54, 78, 0, 12, 14, 20, 23], B [0, 5, 9, 14, 18, 20, 23, 54, 78, 12], C [9, 12, 5, 0, 14, 78, 23, 20, 18, 54], D original, E [20, 0, 12, 23, 54, 14, 5, 18, 78, 9].
R. Recursive method r makes three calls to r(n - 1). It takes 1 second when n = 20. Expected time when n = 23?
S. Recursive iterator method s over ArrayList [4, 5, 2, 1]. What is printed?
T. Which is likely faster for 5,000,000 distinct random ints? A quicksort(mergesort(nums)), B mergesort(quicksort(nums)), C roughly same.
U. In a full binary tree with 9 nodes, minimum possible number of leaf nodes with depth 2?
V. In a complete binary tree with 37 nodes, how many nodes have 2 children?
W. Tree: root 7; left child 3 with left child 4; right child 2 with left child 1 and right child 5. Alternating add/subtract during preorder traversal, starting with add.
X. Same tree and alternating add/subtract during inorder traversal, starting with add.
Y. Same tree and alternating add/subtract during postorder traversal, starting with add.`,
      answers: [
        "22",
        "30",
        "-3",
        "O(logN)",
        "13",
        "{0=3, 2=6, 5=5}",
        "4 seconds",
        "18 seconds",
        "20 seconds",
        "B",
        "22 seconds",
        "3",
        "F",
        "19 9",
        "6 seconds",
        "A",
        "A",
        "27 seconds",
        "12",
        "C",
        "0",
        "18",
        "2",
        "4",
        "-8",
      ],
    },
    {
      id: "cs314-e2-q2",
      title: "2. Maps - playedMostRanked",
      points: 16,
      type: "code",
      prompt:
        "Implement playedMostRanked. Given a map from team name to teams played, and a set of ranked team names, return a team key that has played the most ranked teams. Ties may return any tied team. At least one team has played a ranked team. Do not create new data structures or alter the inputs.",
      stub: `public static String playedMostRanked(
        Map<String, ArrayList<String>> teams,
        Set<String> ranked) {

}`,
      answer: `public static String playedMostRanked(
        Map<String, ArrayList<String>> teams,
        Set<String> ranked) {
    String bestTeam = "";
    int maxRanked = -1;
    for (String team : teams.keySet()) {
        int count = 0;
        for (String opponent : teams.get(team)) {
            if (ranked.contains(opponent)) {
                count++;
            }
        }
        if (count > maxRanked) {
            maxRanked = count;
            bestTeam = team;
        }
    }
    return bestTeam;
}`,
      rubric: [
        { label: "Iterates through the teams represented by map keys", points: 3 },
        { label: "Counts ranked opponents for one team correctly", points: 4 },
        { label: "Uses allowed Map, Set, Iterator, and ArrayList operations correctly", points: 3 },
        { label: "Tracks the best count and best team so far", points: 4 },
        { label: "Returns a valid best team without altering inputs or creating extra structures", points: 2 },
      ],
    },
    {
      id: "cs314-e2-q3",
      title: "3. Linked Lists - addIfFrequencyLessThan",
      points: 17,
      type: "code",
      prompt:
        "Inside LL314<E>, implement addIfFrequencyLessThan. Add tgt to the end of the list only if fewer than freq copies of tgt are already present. Return true if a node was added, false otherwise. The list has only first, no size and no last. Do not use recursion, arrays, or other data structures.",
      stub: `// pre: tgt != null, freq >= 1
// post: per the problem description
public boolean addIfFrequencyLessThan(E tgt, int freq) {

}`,
      answer: `public boolean addIfFrequencyLessThan(E tgt, int freq) {
    if (first == null) {
        first = new Node<>(tgt);
        return true;
    }
    Node<E> scout = first;
    Node<E> trailer = first;
    int count = 0;
    while (scout != null) {
        if (scout.data.equals(tgt)) {
            count++;
            if (count == freq) {
                return false;
            }
        }
        trailer = scout;
        scout = scout.next;
    }
    trailer.next = new Node<>(tgt);
    return true;
}`,
      rubric: [
        { label: "Handles the empty list by creating the first node", points: 3 },
        { label: "Traverses the linked nodes correctly", points: 3 },
        { label: "Uses equals and counts existing target occurrences correctly", points: 3 },
        { label: "Stops and returns false once freq occurrences are found", points: 2 },
        { label: "Tracks the last node for appending", points: 3 },
        { label: "Adds one new node at the end and returns true when appropriate", points: 3 },
      ],
    },
    {
      id: "cs314-e2-q4",
      title: "4. Recursive Backtracking - canForm",
      points: 17,
      type: "code",
      prompt:
        "Implement canForm. Determine whether dictionary words can form at least one word loop with exactly goal words. Words cannot be reused. Each next word must start with the previous word's last character, and the final word must link back to the first. Do not alter dictionary; if successful, loop holds the first loop found, otherwise loop is empty.",
      stub: `public static boolean canForm(ArrayList<String> dictionary,
        ArrayList<String> loop, int goal) {

}`,
      answer: `public static boolean canForm(ArrayList<String> dictionary,
        ArrayList<String> loop, int goal) {
    if (loop.size() == goal) {
        String first = loop.get(0);
        String last = loop.get(goal - 1);
        return charsMatch(last, first);
    }
    for (String nextWord : dictionary) {
        if (loop.size() == 0 || (!loop.contains(nextWord)
                && charsMatch(loop.get(loop.size() - 1), nextWord))) {
            loop.add(nextWord);
            if (canForm(dictionary, loop, goal)) {
                return true;
            }
            loop.remove(loop.size() - 1);
        }
    }
    return false;
}

private static boolean charsMatch(String s1, String s2) {
    return s1.charAt(s1.length() - 1) == s2.charAt(0);
}`,
      rubric: [
        { label: "Base case requires exactly goal words and checks final-to-first character match", points: 4 },
        { label: "Tries dictionary words as recursive choices", points: 2 },
        { label: "Handles the first word as a valid starting choice", points: 2 },
        { label: "Prevents word reuse with contains", points: 2 },
        { label: "Checks last-to-first character compatibility before recursing", points: 2 },
        { label: "Uses recursive return values to stop after success", points: 2 },
        { label: "Backtracks by removing the last word after failed recursive attempts", points: 2 },
        { label: "Respects method, data structure, and allowed-method restrictions", points: 1 },
      ],
    },
  ],
};

const cs314ExamThree: Exam = {
  id: "cs314-fall-2025-e3",
  title: "CS 314 Fall 2025 Exam 3",
  subtitle: "Trees, graphs, hashing, heaps, tries, and dynamic programming",
  questions: [
    {
      id: "cs314-e3-q1",
      title: "1. Short Answer",
      points: 50,
      type: "short",
      prompt:
        "Answer each short-answer item. For compile errors answer compile error; for runtime errors answer runtime error; for infinite loops answer infinite loop. Big O answers should be the most restrictive correct Big O.",
      code: `A. Order of a where N = list.size() and list is LinkedList314:
public static int a(LinkedList314<Integer> list) {
    int t = 0;
    for (int i = 1; i < list.size(); i *= 2) {
        t += list.get(i);
    }
    return t;
}
B. BST314 simple naive insertion of {5, 2, 10, 5, 4, 12, -12, 6, 10, 9}. Sum of nodes with depth 2?
C. BST314 simple naive insertion of i % 6 for i = 0 to 999. Height of resulting tree?
D. Iteratively adding sorted 0..n-1 to naive BST takes 10 seconds when n = 50,000. Expected time when n = 150,000?
E. Adding sorted 0..n-1 to java.util.TreeSet takes 10 seconds when n = 1,000,000. Expected time when n = 4,000,000?
F. RedBlackTree314 add values {2, 5, 10, 5, 2, -4, 13}. How many nodes are red?
G. Huffman STF tree bits with BITS_PER_WORD = 8 and input containing 15 distinct values. Exclude the 32-bit tree-size header.
H. Huffman frequencies 65:10, 66:20, 67:40, 68:80, 69:160. What is the encoding for value 67?
I. Assignment 8 AbstractSet: which methods could not be implemented correctly without an internal data structure or explicit subclass references? Choices: A add, B addAll, C intersection, D iterator, E remove, F size.
J. Graph stores vertices in HashMap<String, Vertex>. Given V vertices and average E outgoing edges, order of determining maximum outdegree?
K. Same graph representation. Given V vertices and average E outgoing edges, order of determining maximum indegree?
L. Weighted graph edges: A-B 17, A-G 3, B-G 18, B-C 2, G-E 1, G-H 5, E-C 9, E-H 2, C-D 7, C-I 4, H-I 2, D-I 11, D-F 4, I-F 6. Cost of shortest path from A to B?
M. Same graph. Starting at C, first four vertices visited by Dijkstra's algorithm as presented in lecture. No spaces or commas.
N. Same graph. Sum of edge weights in the minimum spanning tree?
O. Worst-case order of adding an element to the lecture hash table that already contains N elements.
P. Probing hash table iterator access all elements is O(N). What does N represent? Choices: A internal array length, B client element count, C null count, D load limit, E load factor.
Q. Chaining hash table has load limit 2.0, current load factor 1.5, N elements. Average-case order of adding an absent element?
R. For 150,000 English words, compare S = sum of String lengths and T = number of Trie nodes. Most likely? Choices: A T significantly less than S, B roughly same, C T significantly more than S.
S. Trie search with HashMap child references is worst-case O(N). What is N? Choices: A number of words, B number of nodes, C length of searched word, D alphabet size, E leaves.
T. 11 integer values are inserted into an initially empty min-heap. How many leaves?
U. Ternary heap stored in array with root at index 1. Parent index P for child index N? Choices: A N/3, B N/2, C (N/3)+1, D (N+1)/3, E N%3.
V. Values 5, 10, 8, 12, 18, 5, 20, 2, 8 are added to an initially empty min-heap. How many total swaps?
W. Minimum bits to encode 500 distinct colleges and universities?
X. 0-1 knapsack time orders. Choices: A O(N^2) and O(N^2), B O(2^N) and O(N^2), C O(N^2 C^2) and O(NC), D O(2^N) and O(NC), E O(CN) and O(N^2 C^2).
Y. Output of IntStream.range(4, 9).map(x -> x * 2 - 3).filter(y -> y < 9).sum()?`,
      answers: [
        "O(N)",
        "10",
        "5",
        "90 seconds",
        "44 seconds",
        "2",
        "175",
        "001",
        "A, D",
        "O(V)",
        "O(VE)",
        "14",
        "CBIH",
        "24",
        "O(N)",
        "A",
        "O(1)",
        "A",
        "C",
        "6",
        "D",
        "5",
        "9",
        "D",
        "12",
      ],
    },
    {
      id: "cs314-e3-q2",
      title: "2. Graphs - isBridge",
      points: 17,
      type: "code",
      prompt:
        "Inside Graph, implement isBridge(String v1, String v2). The graph is connected, undirected, unweighted, and v1/v2 are adjacent. Temporarily remove the edge if useful, perform breadth-first search with a single Queue314<Vertex>, restore the graph before returning, and return whether the edge is a bridge.",
      stub: `/* pre: v1 != null, v2 != null, !v1.equals(v2),
   the vertices are adjacent, and this Graph is connected.
   post: return true iff the specified edge is a bridge.
   This Graph is not altered after this method completes. */
public boolean isBridge(String v1, String v2) {

}`,
      answer: `public boolean isBridge(String v1, String v2) {
    clearAll();
    Vertex start = verts.get(v1);
    Vertex other = verts.get(v2);
    Edge removedEdge = start.removeEdge(other);
    start.scratch = 1;
    Queue314<Vertex> queue = new Queue314<>();
    queue.enqueue(start);
    while (!queue.isEmpty()) {
        Vertex current = queue.dequeue();
        for (Edge e : current.adjacent) {
            Vertex dest = e.dest;
            if (dest.scratch == 0) {
                if (dest == other) {
                    start.adjacent.add(removedEdge);
                    return false;
                }
                dest.scratch = 1;
                queue.enqueue(dest);
            }
        }
    }
    start.adjacent.add(removedEdge);
    return true;
}`,
      rubric: [
        { label: "Calls clearAll and initializes the start/target vertices correctly", points: 2 },
        { label: "Removes, stores, and restores the tested edge on every return path", points: 4 },
        { label: "Creates and uses one Queue314<Vertex> to perform BFS", points: 4 },
        { label: "Uses scratch to avoid revisiting vertices", points: 3 },
        { label: "Detects reaching the opposite endpoint and returns false promptly", points: 3 },
        { label: "Returns true when BFS cannot reconnect the endpoints", points: 1 },
      ],
    },
    {
      id: "cs314-e3-q3",
      title: "3. Trees - numInRange",
      points: 16,
      type: "code",
      prompt:
        "Inside IntBST, implement numInRange(low, high). Return the number of values in the BST in the inclusive range [low, high]. Use the BST property to avoid visiting unnecessary nodes. Do not create new data structures, arrays, class variables, or instance variables.",
      stub: `/* pre: low <= high
   post: per the problem description */
public int numInRange(int low, int high) {

}`,
      answer: `public int numInRange(int low, int high) {
    return help(root, low, high);
}

private int help(IntNode n, int low, int high) {
    if (n == null) {
        return 0;
    } else if (n.val < low) {
        return help(n.right, low, high);
    } else if (n.val > high) {
        return help(n.left, low, high);
    } else {
        return 1 + help(n.left, low, high) + help(n.right, low, high);
    }
}`,
      rubric: [
        { label: "Uses an appropriate helper and calls it correctly", points: 2 },
        { label: "Handles the null/base case correctly", points: 3 },
        { label: "Tests whether the current node value is in range and counts it", points: 2 },
        { label: "Uses BST comparisons to skip unnecessary subtrees", points: 4 },
        { label: "Recurses correctly to left and/or right children when needed", points: 4 },
        { label: "Returns the correct count without disallowed structures or extra parameters", points: 1 },
      ],
    },
    {
      id: "cs314-e3-q4",
      title: "4. Hash Tables - HIterator",
      points: 17,
      type: "code",
      prompt:
        "Inside HashTable314<E>, fully implement the inner HIterator class with instance variables, constructor if needed, hasNext, next, and remove. The table uses chaining with List<E>[] con and null empty buckets. hasNext must be O(1) and must not alter the iterator. Use bucket Iterators as needed and null out buckets emptied by remove.",
      stub: `private class HIterator implements Iterator<E> {
    // instance variables, constructor, hasNext, next, and remove

}`,
      answer: `private class HIterator implements Iterator<E> {
    private int numToReturn;
    private int bucketIndex;
    private Iterator<E> currentIterator;

    private HIterator() {
        numToReturn = size;
        if (numToReturn > 0) {
            findNextBucket();
        }
    }

    private void findNextBucket() {
        while (con[bucketIndex] == null) {
            bucketIndex++;
        }
        currentIterator = con[bucketIndex].iterator();
    }

    public boolean hasNext() {
        return numToReturn > 0;
    }

    public E next() {
        numToReturn--;
        if (!currentIterator.hasNext()) {
            bucketIndex++;
            findNextBucket();
        }
        return currentIterator.next();
    }

    public void remove() {
        currentIterator.remove();
        size--;
        if (con[bucketIndex].size() == 0) {
            con[bucketIndex] = null;
        }
    }
}`,
      rubric: [
        { label: "Declares useful private iterator state and initializes it correctly", points: 3 },
        { label: "hasNext is correct, O(1), and does not mutate iterator state", points: 3 },
        { label: "next finds and uses bucket iterators correctly across buckets", points: 5 },
        { label: "next returns the correct element", points: 2 },
        { label: "remove delegates to the current bucket iterator and updates outer size", points: 2 },
        { label: "remove nulls emptied buckets and avoids disallowed List operations or extra structures", points: 2 },
      ],
    },
  ],
};

function splitTracingQuestion(question: Question): Question[] {
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

const exams = [examOne, examTwo, cs314ExamOne, cs314ExamTwo, cs314ExamThree].map((exam) => ({
  ...exam,
  questions: exam.questions.flatMap(splitTracingQuestion),
}));

type AnswerState = Record<string, string | string[]>;
type ManualState = Record<string, number>;
type FlagState = Record<string, boolean>;
type JavaStatus = {
  available: boolean;
  message: string;
};
type JavaRunResult = {
  ok: boolean;
  phase: string;
  message: string;
  stdout?: string;
  stderr?: string;
  passed?: number;
  total?: number;
};
type JavaRunState = Record<string, JavaRunResult | { loading: true }>;
type ObjectivePart = {
  kind: "answer" | "context";
  label?: string;
  code: string;
  answerIndex?: number;
};
type MissingPart = {
  label: string;
  targetId?: string;
};
type IncompleteSection = {
  question: Question;
  questionIndex: number;
  missingParts: MissingPart[];
};
type PersistedExam = {
  answers?: AnswerState;
  manual?: ManualState;
  flags?: FlagState;
};

function isSameCode(left: string | undefined, right: string | undefined) {
  return normalizeCode(left ?? "") === normalizeCode(right ?? "");
}

function sanitizeAnswersForExam(exam: Exam, answers: AnswerState = {}) {
  const next: AnswerState = {};
  const codeStubs = exams
    .flatMap((item) => item.questions)
    .filter((question) => question.type === "code" && question.stub)
    .map((question) => question.stub ?? "");

  for (const question of exam.questions) {
    const value = answers[question.id];
    if (question.type === "short") {
      if (Array.isArray(value)) {
        next[question.id] = value;
      }
      continue;
    }

    if (typeof value !== "string" || !value.trim()) {
      continue;
    }

    const isOwnStarter = isSameCode(value, question.stub);
    const isOtherStarter = codeStubs.some((stub) => !isSameCode(stub, question.stub) && isSameCode(value, stub));
    if (!isOwnStarter && !isOtherStarter) {
      next[question.id] = value;
    }
  }

  return next;
}

function readPersistedExam(examId: string): PersistedExam {
  if (typeof window === "undefined") {
    return {};
  }
  const saved = window.localStorage.getItem(`digitalexams:${examId}`);
  if (!saved) {
    return {};
  }

  const persisted = JSON.parse(saved) as PersistedExam;
  const exam = exams.find((item) => item.id === examId);
  return {
    ...persisted,
    answers: exam ? sanitizeAnswersForExam(exam, persisted.answers) : persisted.answers,
  };
}

function readSavedExamIds() {
  if (typeof window === "undefined") {
    return [];
  }
  return exams.filter((item) => window.localStorage.getItem(`digitalexams:${item.id}`)).map((item) => item.id);
}

function normalizeAnswer(value: string) {
  return value
    .trim()
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

function isCorrect(given: string, expected: string) {
  const user = normalizeAnswer(given);
  const official = normalizeAnswer(expected);
  if (official === "-4.0" && (user === "-4.0" || user === "-5.0")) {
    return true;
  }
  return user === official;
}

function normalizeCode(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function hasEditedCodeAnswer(item: Question, answers: AnswerState) {
  const value = (answers[item.id] as string | undefined) ?? "";
  if (!value.trim()) {
    return false;
  }
  return !isSameCode(value, item.stub);
}

function labelForIndex(index: number) {
  return String.fromCharCode(65 + index);
}

function buildObjectiveParts(question: Question): ObjectivePart[] {
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
  let current: ObjectivePart | null = null;
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
  return parts;
}

function CodeBlock({ code, className = "" }: { code?: string; className?: string }) {
  return (
    <SyntaxHighlighter
      language="java"
      style={oneLight}
      className={`code-display ${className}`}
      customStyle={{
        margin: 0,
        padding: "18px",
        background: "#f2f4f7",
        border: "1px solid #d7dce3",
        borderRadius: "6px",
        fontSize: "13px",
        lineHeight: "1.55",
      }}
      codeTagProps={{
        style: {
          fontFamily:
            "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        },
      }}
      wrapLongLines
    >
      {code ?? ""}
    </SyntaxHighlighter>
  );
}

export default function Home() {
  const [selectedExamId, setSelectedExamId] = useState(exams[0].id);
  const [mode, setMode] = useState<"menu" | "exam" | "review">("menu");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [manual, setManual] = useState<ManualState>({});
  const [flags, setFlags] = useState<FlagState>({});
  const [savedExamIds, setSavedExamIds] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [javaStatus, setJavaStatus] = useState<JavaStatus | null>(null);
  const [javaRuns, setJavaRuns] = useState<JavaRunState>({});
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitRunning, setSubmitRunning] = useState(false);
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);

  const exam = exams.find((item) => item.id === selectedExamId) ?? exams[0];
  const question = exam.questions[index];
  const totalSections = exams.reduce((sum, item) => sum + item.questions.length, 0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const persisted = readPersistedExam(exams[0].id);
      setAnswers(persisted.answers ?? {});
      setManual(persisted.manual ?? {});
      setFlags(persisted.flags ?? {});
      setSavedExamIds(readSavedExamIds());
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    window.localStorage.setItem(
      `digitalexams:${selectedExamId}`,
      JSON.stringify({ answers, manual, flags }),
    );
  }, [answers, flags, manual, selectedExamId, storageReady]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/java/run")
      .then((response) => response.json() as Promise<JavaStatus>)
      .then((status) => {
        if (!cancelled) {
          setJavaStatus(status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJavaStatus({
            available: false,
            message: "Local Java status could not be checked.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pendingTargetId) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(pendingTargetId);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = target?.querySelector("input, textarea, [tabindex]") as HTMLElement | null;
      input?.focus({ preventScroll: true });
      setPendingTargetId(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [index, pendingTargetId]);

  const totals = (() => {
    let autoEarned = 0;
    let autoPossible = 0;
    let manualEarned = 0;
    let manualPossible = 0;

    for (const item of exam.questions) {
      if (item.type === "short" && item.answers) {
        autoPossible += item.points;
        const userAnswers = (answers[item.id] as string[] | undefined) ?? [];
        item.answers.forEach((expected, answerIndex) => {
          if (isCorrect(userAnswers[answerIndex] ?? "", expected)) {
            autoEarned += item.answerPoints?.[answerIndex] ?? item.points / item.answers!.length;
          }
        });
      } else {
        manualPossible += item.points;
        manualEarned += Math.min(item.points, Math.max(0, manual[item.id] ?? 0));
      }
    }
    return {
      autoEarned,
      autoPossible,
      manualEarned,
      manualPossible,
      earned: autoEarned + manualEarned,
      possible: autoPossible + manualPossible,
    };
  })();

  function questionAnswered(item: Question) {
    if (item.type === "short") {
      const userAnswers = (answers[item.id] as string[] | undefined) ?? [];
      return item.answers?.every((_, answerIndex) => Boolean(userAnswers[answerIndex]?.trim())) ?? false;
    }
    return hasEditedCodeAnswer(item, answers);
  }

  function questionHasPartialAnswer(item: Question) {
    if (item.type === "short") {
      return Boolean(((answers[item.id] as string[] | undefined) ?? []).some((answer) => answer?.trim()));
    }
    return hasEditedCodeAnswer(item, answers);
  }

  function getMissingParts(item: Question) {
    if (item.type === "code") {
      return questionAnswered(item) ? [] : [{ label: "Code response", targetId: `${item.id}-editor` }];
    }
    const userAnswers = (answers[item.id] as string[] | undefined) ?? [];
    return buildObjectiveParts(item)
      .filter((part) => part.kind === "answer")
      .filter((part) => !userAnswers[part.answerIndex ?? 0]?.trim())
      .map((part) => ({
        label: `Part ${part.label}`,
        targetId: `${item.id}-part-${part.label}`,
      }));
  }

  const incompleteSections: IncompleteSection[] = exam.questions
    .map((item, questionIndex) => ({
      question: item,
      questionIndex,
      missingParts: getMissingParts(item),
    }))
    .filter((section) => section.missingParts.length > 0);

  function setShortAnswer(questionId: string, answerIndex: number, value: string) {
    setAnswers((current) => {
      const list = [...(((current[questionId] as string[] | undefined) ?? []) as string[])];
      list[answerIndex] = value;
      return { ...current, [questionId]: list };
    });
  }

  function setCodeAnswer(item: Question, value: string | undefined) {
    setAnswers((current) => {
      const next = { ...current };
      const code = value ?? "";
      if (!code.trim() || isSameCode(code, item.stub)) {
        delete next[item.id];
      } else {
        next[item.id] = code;
      }
      return next;
    });
  }

  function startExam(target: Exam) {
    const persisted = readPersistedExam(target.id);
    setSelectedExamId(target.id);
    setAnswers(persisted.answers ?? {});
    setManual(persisted.manual ?? {});
    setFlags(persisted.flags ?? {});
    setMode("exam");
    setIndex(0);
  }

  function returnToMenu() {
    setSavedExamIds(readSavedExamIds());
    setMode("menu");
  }

  async function finalizeSubmit() {
    setSubmitRunning(true);
    try {
      if (javaStatus?.available) {
        const codeQuestions = exam.questions.filter(
          (item) => item.type === "code" && hasEditedCodeAnswer(item, answers),
        );
        const results = await Promise.all(
          codeQuestions.map(async (item) => ({
            item,
            result: await runJavaTests(item),
          })),
        );
        setManual((current) => {
          const next = { ...current };
          for (const { item, result } of results) {
            if (result && typeof result.passed === "number" && typeof result.total === "number" && result.total > 0) {
              next[item.id] = Math.round((item.points * result.passed * 10) / result.total) / 10;
            }
          }
          return next;
        });
      }
      setMode("review");
    } finally {
      setSubmitRunning(false);
    }
  }

  function requestSubmit() {
    if (incompleteSections.length > 0) {
      setSubmitModalOpen(true);
      return;
    }
    void finalizeSubmit();
  }

  function submitAnyway() {
    setSubmitModalOpen(false);
    void finalizeSubmit();
  }

  function resetExam() {
    setAnswers({});
    setManual({});
    setFlags({});
    setJavaRuns({});
    setIndex(0);
    setMode("exam");
    window.localStorage.removeItem(`digitalexams:${selectedExamId}`);
    setSavedExamIds(readSavedExamIds());
  }

  async function runJavaTests(item: Question): Promise<JavaRunResult | null> {
    const code = ((answers[item.id] as string | undefined) ?? item.stub ?? "").trim();
    if (!hasEditedCodeAnswer(item, answers)) {
      const result = {
        ok: false,
        phase: "request",
        message: "Add code before running local tests.",
      };
      setJavaRuns((current) => ({ ...current, [item.id]: result }));
      return result;
    }
    setJavaRuns((current) => ({ ...current, [item.id]: { loading: true } }));
    try {
      const response = await fetch("/api/java/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: item.id, code }),
      });
      const result = (await response.json()) as JavaRunResult;
      setJavaRuns((current) => ({ ...current, [item.id]: result }));
      if (result.phase === "java") {
        setJavaStatus({ available: false, message: result.message });
      }
      return result;
    } catch {
      const result = {
        ok: false,
        phase: "network",
        message: "Could not reach the local Java runner.",
      };
      setJavaRuns((current) => ({
        ...current,
        [item.id]: result,
      }));
      return result;
    }
  }

  if (mode === "menu") {
    return (
      <main className="exam-shell menu-shell">
        <section className="menu-hero">
          <div>
            <p className="eyebrow">DigitalExams</p>
            <h1>CS Practice Exam Workspace</h1>
            <p className="lede">
              Practice with UT Austin CS sample and Fall 2025 exams. Objective short-answer problems
              auto-grade; programming problems use the official rubric and local Java tests where available.
            </p>
          </div>
          <div className="menu-summary">
            <FileText aria-hidden />
            <span>{exams.length} exams</span>
            <span>{totalSections} sections</span>
            <span>Monaco Java editor</span>
          </div>
        </section>

        <section className="exam-list" aria-label="Available exams">
          {exams.map((item) => {
            const saved = savedExamIds.includes(item.id);
            return (
              <article className="exam-row" key={item.id}>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.subtitle}</p>
                  <span>
                    {item.questions.length} sections, {item.questions.reduce((sum, q) => sum + q.points, 0)}{" "}
                    points
                  </span>
                </div>
                <button className="primary-button" onClick={() => startExam(item)}>
                  <BookOpen size={18} />
                  {saved ? "Resume" : "Start"}
                </button>
              </article>
            );
          })}
        </section>
      </main>
    );
  }

  return (
    <main className={`exam-shell ${mode === "review" ? "review-shell" : ""}`}>
      <header className="topbar">
        <button className="icon-button" aria-label="Back to menu" onClick={returnToMenu}>
          <HomeIcon size={19} />
        </button>
        <div className="topbar-title">
          <span>{exam.title}</span>
          <strong>
            {mode === "review" ? "Review" : "In progress"} · Question {index + 1} of{" "}
            {exam.questions.length}
          </strong>
        </div>
        <div className="topbar-actions">
          <button className="secondary-button" onClick={resetExam}>
            <RotateCcw size={17} />
            Reset
          </button>
          {mode === "exam" ? (
            <button className="primary-button" onClick={requestSubmit} disabled={submitRunning}>
              <ClipboardCheck size={17} />
              {submitRunning ? "Grading" : "Submit"}
            </button>
          ) : (
            <button className="primary-button" onClick={() => setMode("exam")}>
              <Code2 size={17} />
              Continue Editing
            </button>
          )}
        </div>
      </header>

      <div className="workbench">
        <aside className="navigator" aria-label="Question navigator">
          <div className="score-panel">
            <span>Total Score</span>
            <strong>
              {totals.earned.toFixed(1)} / {totals.possible}
            </strong>
            <small>
              Short answer {totals.autoEarned.toFixed(1)}/{totals.autoPossible}; coding{" "}
              {totals.manualEarned}/{totals.manualPossible}
            </small>
          </div>
          <div className="question-map">
            {exam.questions.map((item, qIndex) => {
              const isComplete = questionAnswered(item);
              const isPartial = !isComplete && questionHasPartialAnswer(item);
              const itemRun = javaRuns[item.id];
              const passedJava = itemRun && !("loading" in itemRun) && itemRun.ok;
              const failedJava = itemRun && !("loading" in itemRun) && !itemRun.ok;
              return (
                <button
                  className={`map-item ${qIndex === index ? "active" : ""}`}
                  key={item.id}
                  onClick={() => setIndex(qIndex)}
                >
                  <span className="map-number">{qIndex + 1}</span>
                  <span className="map-copy">
                    <strong>{item.title.replace(/^\d+\.\s*/, "")}</strong>
                    <small>{item.points} pts</small>
                  </span>
                  <span className="map-badges">
                    {flags[item.id] ? (
                      <span className="map-badge flagged">
                        <Flag size={12} />
                      </span>
                    ) : null}
                    {passedJava ? (
                      <span className="map-badge passed">
                        <Terminal size={12} />
                      </span>
                    ) : failedJava ? (
                      <span className="map-badge failed">
                        <Terminal size={12} />
                      </span>
                    ) : isComplete ? (
                      <span className="map-badge answered">
                        <Check size={12} />
                      </span>
                    ) : isPartial ? (
                      <span className="map-badge partial" aria-label="Partially answered" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="question-pane">
          {mode === "review" ? (
            <section className="review-banner">
              <div>
                <p className="eyebrow">Scoring Mode</p>
                <h2>
                  {totals.earned.toFixed(1)} / {totals.possible} points
                </h2>
              </div>
              <p>
                Answers are locked while reviewing. Use Continue Editing to return to the exam and make
                changes.
              </p>
            </section>
          ) : null}

          <div className="question-header">
            <div>
              <p className="eyebrow">{question.points} points</p>
              <h1>{question.title}</h1>
            </div>
            <button
              className={`flag-button ${flags[question.id] ? "flagged" : ""}`}
              onClick={() => setFlags((current) => ({ ...current, [question.id]: !current[question.id] }))}
              disabled={mode === "review"}
            >
              <Flag size={17} />
              Flag
            </button>
          </div>

          <p className="prompt">{question.prompt}</p>
          {question.reference ? (
            <section className="reference-panel">
              <h2>Reference for this section</h2>
              <CodeBlock code={question.reference} />
            </section>
          ) : null}

          {question.type === "short" && question.answers ? (
            <div className="objective-list">
              {buildObjectiveParts(question).map((part, partIndex) => {
                if (part.kind === "context") {
                  return (
                    <section className="context-block" key={`${question.id}-context-${partIndex}`}>
                      <h2>Shared context</h2>
                      <CodeBlock code={part.code} />
                    </section>
                  );
                }

                const answerIndex = part.answerIndex ?? 0;
                const userAnswers = (answers[question.id] as string[] | undefined) ?? [];
                const submitted = mode === "review";
                const correct = submitted && isCorrect(userAnswers[answerIndex] ?? "", question.answers![answerIndex]);
                const partTargetId = `${question.id}-part-${part.label}`;
                return (
                  <section className="objective-part" id={partTargetId} key={`${question.id}-${answerIndex}`}>
                    <div className="part-code">
                      <div className="part-label">{part.label}</div>
                      <CodeBlock code={part.code.trim()} />
                    </div>
                    <label className="answer-line">
                      <span>Answer {part.label}</span>
                      <input
                        disabled={mode === "review"}
                        value={userAnswers[answerIndex] ?? ""}
                        onChange={(event) => setShortAnswer(question.id, answerIndex, event.target.value)}
                        placeholder="Type exact output"
                      />
                      {submitted ? (
                        <strong className={correct ? "correct" : "incorrect"}>
                          {correct ? "Correct" : question.answers![answerIndex]}
                        </strong>
                      ) : null}
                    </label>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="editor-wrap" id={`${question.id}-editor`}>
              <MonacoEditor
                key={`${selectedExamId}-${question.id}`}
                height="430px"
                defaultLanguage="java"
                language="java"
                path={`${selectedExamId}/${question.id}.java`}
                theme="vs"
                value={(answers[question.id] as string | undefined) ?? question.stub ?? ""}
                onChange={(value) => setCodeAnswer(question, value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 22,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 4,
                  automaticLayout: true,
                  readOnly: mode === "review",
                }}
              />
            </div>
          )}

          {question.type === "code" ? (
            <JavaRunnerPanel
              question={question}
              status={javaStatus}
              runState={javaRuns[question.id]}
              hasEditedCode={hasEditedCodeAnswer(question, answers)}
              onRun={() => runJavaTests(question)}
            />
          ) : null}

          {mode === "review" ? <ReviewPanel question={question} manual={manual} setManual={setManual} /> : null}

          <div className="question-footer">
            <button className="secondary-button" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              <ChevronLeft size={17} />
              Previous
            </button>
            <button
              className="secondary-button"
              disabled={index === exam.questions.length - 1}
              onClick={() => setIndex(index + 1)}
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      </div>
      {submitModalOpen ? (
        <SubmitModal
          incompleteSections={incompleteSections}
          javaAvailable={Boolean(javaStatus?.available)}
          submitting={submitRunning}
          onClose={() => setSubmitModalOpen(false)}
          onSubmit={submitAnyway}
          onJump={(targetIndex, targetId) => {
            setSubmitModalOpen(false);
            if (targetIndex >= 0) {
              setIndex(targetIndex);
              setPendingTargetId(targetId ?? null);
            }
          }}
        />
      ) : null}
    </main>
  );
}

function JavaRunnerPanel({
  question,
  status,
  runState,
  hasEditedCode,
  onRun,
}: {
  question: Question;
  status: JavaStatus | null;
  runState?: JavaRunResult | { loading: true };
  hasEditedCode: boolean;
  onRun: () => void;
}) {
  const isLoading = Boolean(runState && "loading" in runState);
  const result = runState && !("loading" in runState) ? runState : null;

  return (
    <section className="java-panel">
      <div className="java-panel-header">
        <div>
          <h2>
            <Terminal size={18} />
            Local Java Tests
          </h2>
          <p>
            Tests run on this computer through the local Next server using the installed JDK. Code is not
            uploaded.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={onRun}
          disabled={isLoading || status?.available === false || !question.stub || !hasEditedCode}
        >
          <Play size={17} />
          {isLoading ? "Running" : "Run Tests"}
        </button>
      </div>

      <div className={`java-status ${status?.available ? "available" : "missing"}`}>
        <ShieldCheck size={17} />
        <span>{status?.message ?? "Checking local Java availability..."}</span>
      </div>
      {!hasEditedCode ? <p className="java-hint">Edit the starter code to enable local tests.</p> : null}

      {result ? (
        <div className={`java-result ${result.ok ? "passed" : "failed"}`}>
          <strong>{result.message}</strong>
          {typeof result.passed === "number" && typeof result.total === "number" ? (
            <span className="java-estimate">
              Local test estimate: {result.passed}/{result.total} checks passed
            </span>
          ) : null}
          {result.stdout ? <pre>{result.stdout}</pre> : null}
          {result.stderr ? <pre>{result.stderr}</pre> : null}
        </div>
      ) : null}
    </section>
  );
}

function SubmitModal({
  incompleteSections,
  javaAvailable,
  submitting,
  onClose,
  onSubmit,
  onJump,
}: {
  incompleteSections: IncompleteSection[];
  javaAvailable: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onJump: (index: number, targetId?: string) => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="submit-modal" role="dialog" aria-modal="true" aria-labelledby="submit-title">
        <div className="modal-heading">
          <div>
            <h2 id="submit-title">Submit exam?</h2>
            <p>
              {incompleteSections.length} section{incompleteSections.length === 1 ? " is" : "s are"} still
              incomplete. Jump back to a section, continue editing, or submit anyway.
              {javaAvailable ? " Answered code questions will be tested locally before scoring." : ""}
            </p>
          </div>
          <button className="modal-close" aria-label="Close submit dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="incomplete-list">
          {incompleteSections.map((section) => (
            <details key={section.question.id} open>
              <summary>
                <span>{section.question.title}</span>
                <strong>
                  {section.missingParts.length} missing · {section.question.points} pts
                </strong>
              </summary>
              <div className="missing-parts">
                {section.missingParts.map((part) => (
                  <button key={part.label} onClick={() => onJump(section.questionIndex, part.targetId)}>
                    {part.label}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} disabled={submitting}>
            Continue Editing
          </button>
          <button className="primary-button" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Grading" : "Submit Anyway"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ReviewPanel({
  question,
  manual,
  setManual,
}: {
  question: Question;
  manual: ManualState;
  setManual: Dispatch<SetStateAction<ManualState>>;
}) {
  if (question.type === "short") {
    return (
      <section className="review-panel">
        <h2>
          <ListChecks size={18} />
          Official Answers
        </h2>
        <p>Each item is auto-scored. Spelling and type markers such as quotes still matter.</p>
      </section>
    );
  }

  return (
    <section className="review-panel">
      <h2>
        <ListChecks size={18} />
        Coding Score
      </h2>
      <label className="manual-score">
        <span>Your score for this problem</span>
        <input
          type="number"
          min="0"
          max={question.points}
          step="1"
          value={manual[question.id] ?? 0}
          onChange={(event) =>
            setManual((current) => ({
              ...current,
              [question.id]: Number(event.target.value),
            }))
          }
        />
        <strong>/ {question.points}</strong>
      </label>
      <div className="rubric">
        {question.rubric?.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.points}</strong>
          </div>
        ))}
      </div>
      <h3>Official solution</h3>
      <CodeBlock code={question.answer} className="solution" />
    </section>
  );
}
