import type { Exam } from "@/app/lib/exam-types";
import { critterContext } from "./contexts";

export const examOne: Exam = {
  id: "sample-1",
  title: "CS 312 Sample Credit by Exam 1",
  subtitle: "UT Austin Computer Science sample exam",
  sourceFiles: [
    {
      label: "Official sample solution and grading criteria",
      path: "exampdfs/CS312_Sample_Exam_1_SOLUTION_0.pdf",
      role: "solution",
    },
  ],
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
      reference: critterContext,
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
