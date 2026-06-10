import type { Exam } from "@/app/lib/exam-types";
import { critterContext } from "./contexts";

export const examTwo: Exam = {
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
      reference: critterContext,
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

