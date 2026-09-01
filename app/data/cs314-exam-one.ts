import type { Exam } from "@/app/lib/exam-types";

export const cs314ExamOne: Exam = {
  id: "cs314-fall-2025-e1",
  title: "CS 314 Fall 2025 Exam 1",
  subtitle: "Data structures, generics, matrices, and multisets",
  questions: [
    {
      id: "cs314-e1-q1",
      title: "1. Short Answer",
      points: 50,
      type: "short",
      thrownOut: {
        label: "E",
        afterLabel: "D",
        note: "This question was thrown out after the exam. Its 2 points are awarded automatically to everyone.",
        points: 2,
      },
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
      answerPoints: [...Array(13).fill(2), 1, 1, 1, 1, ...Array(9).fill(2)],
    },
    {
      id: "cs314-e1-q2",
      title: "2. Lists - copyWithoutTarget",
      points: 17,
      type: "code",
      prompt:
        "Inside GenericList<E>, implement copyWithoutTarget. Return a new GenericList that is a copy of the calling object except elements equal to target are excluded; preserve the relative order of all remaining elements. Examples: [A, B, C, A, B, B, X].copyWithoutTarget(A) returns [B, C, B, B, X]; target B returns [A, C, A, X]; all matching values return []; no matches return a full copy. Do not check preconditions.",
      reference: `public class GenericList<E> {
    // This GenericList does NOT allow the client to store null values.
    private E[] con;
    private int size;

    public GenericList() { } // Sets instance vars to 0 equivalent.
}

Storage model:
- The first size elements of con store the list elements.
- An element's list position is the same as its array position.
- con may have extra capacity; extra array slots store null.

Restrictions:
- You may not use any other GenericList methods or constructors except the shown zero-argument constructor unless you implement them yourself.
- You may call equals on objects.
- You may use the length field for arrays.
- You may not use any other Java classes or methods.
- Do not create any new data structures other than a native array for the resulting GenericList and the resulting GenericList itself.

// pre: target != null
// post: Per the problem description. This GenericList is not altered.`,
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
        "Inside MathMatrix, implement concatenate. Return a new MathMatrix that horizontally concatenates the calling object on the left with rhs on the right. For example, a 2x3 matrix [1 5 3; 2 7 6] concatenated with a 2x4 matrix [12 10 -3 0; 9 -5 4 8] returns [1 5 3 12 10 -3 0; 2 7 6 9 -5 4 8]. Do not check preconditions.",
      reference: `public class MathMatrix {
    // No extra capacity. No other instance variables.
    private int cells[][];

    public MathMatrix(int rows, int columns) {
        cells = new int[rows][columns];
    }
}

Facts and restrictions:
- MathMatrix objects are rectangular: every row in one MathMatrix has the same number of columns.
- Every MathMatrix object is at least 1 x 1; no zero-row or zero-column matrices.
- You may not use any other MathMatrix methods or constructors other than the constructor shown.
- You may use the length field for arrays.
- You may not use any other Java classes or methods.
- Do not create any new data structures other than a 2d native array for the resulting MathMatrix and the resulting MathMatrix itself.

// pre: rhs != null. The number of rows in this and rhs are equal.`,
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
        "Inside MultiSet<E>, implement getIntersection. Return a new MultiSet that represents the intersection of the calling object and other. Each element in both multisets appears in the result with frequency equal to the smaller of the two frequencies. The result is an abstract multiset, so internal order does not matter. Do not check preconditions.",
      reference: `public class MultiSet<E> { // Does NOT allow client to add null.
    private ValueAndFrequency<E>[] con; /* May have extra capacity.
        ValueAndFrequency objects stored in first numDistinct spots. */
    private int numDistinct; /* Number of distinct elements. */
    private int size; /* Total number of elements including duplicates. */

    public MultiSet(int initialCapacity) { // pre: initialCap > 0
        con = new ValueAndFrequency[initialCapacity];
    }

    private static class ValueAndFrequency<E> {
        private E element; // Never null.
        private int frequency; // Always >= 1.

        private ValueAndFrequency(E e, int f) { // pre: e != null, f > 0
            element = e;
            frequency = f;
        }
    }
}

Examples:
- [B, B, B, C, C, C, C, A].getIntersection([A, C, C]) returns [C, C, A]
- [B, B, C, C, C, C, A].getIntersection([Y, Z, X]) returns []
- [].getIntersection([A, A, C]) returns []
- [B, B, B, C, A, A].getIntersection([A, A, A, B, B]) returns [A, A, B, B]
- [B, X, X, C, C, C, C, A].getIntersection([A, B, M]) returns [A, B]
- [].getIntersection([]) returns []
- [B, A, X, X, X, C, C].getIntersection([A, A, B, B]) returns [A, B]

Restrictions:
- Do not use any other Java methods or classes except the MultiSet instance variables, constructor, and nested ValueAndFrequency class.
- You may use equals on Objects and Math.min(int, int).
- Do not create any new data structures besides the new MultiSet and the necessary internal variables for that MultiSet.

/* pre: other != null post: per the problem description. */`,
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

