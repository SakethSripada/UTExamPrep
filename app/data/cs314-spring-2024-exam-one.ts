import type { Exam } from "@/app/lib/exam-types";

export const cs314Spring2024ExamOne: Exam = {
  id: "cs314-2024-spring-exam-1",
  title: "CS 314 Spring 2024 Exam 1",
  subtitle: "Algorithm analysis, lists, baby names, and multisets",
  sourceFiles: [
    { label: "Original exam", path: "exampdfs/cs314/2024-spring/exam-1-exam-spring-2024.pdf", role: "exam" },
    { label: "Official solution", path: "exampdfs/cs314/2024-spring/exam-1-solution-spring-2024.pdf", role: "solution" },
  ],
  questions: [
    {
      id: "cs314-2024-spring-exam-1-q1",
      title: "1. Short Answer",
      points: 50,
      type: "short",
      prompt:
        "Answer each short-answer item. For a compile or syntax error, answer compile error; for a runtime exception, answer runtime error; for an infinite loop, answer infinite loop. Big O answers should be the most restrictive correct Big O. Assume all necessary imports have been made.",
      code: `A. Using the techniques and rules from lecture, what is T(N) for a where N = data.length?
public static int a(int[] data) {
    int t = 0;
    final int LIMIT = data.length;
    for (int i = 0; i < LIMIT; i += 4) { // Note the update statement.
        t += data[i] / 2;
        t += data[i] * data[i];
    }
    return t;
}
B. Using the techniques and rules from lecture, what is T(N) for b where N = n?
public static double b(int n) {
    double t = 0.0;
    final int LIMIT = n * n;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            t += i / (j + 1.0);
        }
        for (int j = 0; j < LIMIT; j++) {
            t += i * j;
        }
    }
    return t;
}
C. What is the order of c? N = data.length. Method process is O(N), where N is the length of its array argument.
public static int c(int[] data) {
    int t = 0;
    for (int i = 0; i < data.length / 2; i++) {
        t += process(data, i);
        t += data[i];
    }
    return t;
}
D. What is the order of d? N = data.length. Methods process2 and check1 are O(N), where N is the length of their array argument. Assume check1 returns true for the given array roughly half of the time.
public static int d(int[] data) {
    int t = 0;
    for (int i = 0; i < data.length; i++) {
        t += process2(data, i);
        for (int j = 0; j < data.length; j++) {
            if (check1(data, j)) {
                t += process2(data, j);
            }
        }
    }
    return t;
}
E. A method is O(N^3). It takes 1 second when N = 10,000. What is the expected time when N = 30,000?
F. A method is O(N!). It takes 1 second when N = 99. What is the expected time when N = 101?
G. The following ArrayList code takes 0.2 seconds when list.size() = 1,000,000. What is the expected time when list.size() = 2,000,000?
public static int g(ArrayList<Integer> list) {
    int result = 0;
    for (int i = 0; i < list.size(); i++) {
        for (int j = 1; j < list.size(); j *= 2) {
            result += list.get(i) * list.get(j);
        }
    }
    return result;
}
H. What is the worst-case order of h where N = list.size()?
public static void h(ArrayList<Double> list, double target) {
    for (int i = list.size() - 1; i >= 0; i--) {
        if (list.get(i) < target) {
            list.remove(i); // Remove element at given position.
        }
    }
}
I. What is output? The code uses java.util.ArrayList.
ArrayList<Integer> list = new ArrayList<>(10);
list.add(3);
list.add(0, 5); // position to add, value
list.add(0, 1);
list.add(2, 4);
list.add(1, 7);
list.remove(3); // Remove element at given position.
System.out.print(list);
J. What is output?
public static void j(ArrayList<Integer> list) {
    list.add(3);
    list.add(0);
    list = new ArrayList<Integer>();
    list.add(4);
    System.out.print(list.size() + " ");
}

// client code
ArrayList<Integer> listJ = new ArrayList<>();
listJ.add(12);
j(listJ);
System.out.print(listJ.size());
K. The following method takes 5 seconds when n = 1,000,000. What is the expected time when n = 2,000,000? GenericList uses the resize method shown.
public static GenericList<Integer> k(int n) {
    GenericList<Integer> r = new GenericList<>();
    for (int i = 0; i < n; i++) {
        r.add(i * i);
    }
    return r;
}

// resize method in GenericList
private void resize() {
    con = Arrays.copyOf(con, con.length + con.length / 3 + 1);
}
L. What is output?
String s1 = "ABC";
String s2 = "MNOP";
String r = "";
if (s1.compareTo(s2) >= 0)
    r += "x";
else
    r += "o";
r += s1.length() == s2.length();
System.out.print(r);
M. Generic ArrayList compile-time errors. List all line numbers or No compile errors.
ArrayList listM = new ArrayList(20); // 1
listM.add(12); // 2
listM.add("Devon"); // 3
listM.add(listM.get(1)); // 4
listM.add(listM.get(10)); // 5
listM.add(listM.get(1).substring(3)); // 6
listM.add(new ArrayList<Double>()); // 7
N. What is output when n is called with ["Devon", "Gracelynn", "Brayden", "Aman", "Pavan", "Lauren", "Namish", "Nidhi", "Lauren", "Eliza", "Bersam"]?
public static void n(ArrayList<String> list) {
    int t = 0;
    Iterator<String> it = list.iterator();
    for (int i = 0; i < 6; i++)
        it.next();
    while (it.hasNext())
        if (it.next().length() >= 6)
            t++;
    System.out.print(t);
}
O. What is output?
public class Book implements Comparable<Book> {
    private int pages;
    public Book(int p) { pages = p; }
    public int compareTo(Book other) { return pages - other.pages; }
}

Comparable b1 = new Book(10);
Comparable b2 = new Book(5);
System.out.print(b1.compareTo(b2));
For P1 through Y, consider the Vehicle classes in the reference panel.
P1. ElectricCar ec = new Car(); // compiles or compile error
P2. Vehicle v1 = new Motorcycle("red"); // compiles or compile error
Q1. Object o3 = new ElectricCar(); // compiles or compile error
Q2. Motorcycle mv = new Car(); // compiles or compile error
R. What is output?
Vehicle vr = new ElectricCar();
vr.recharge();
System.out.print(vr);
S. What is output?
Motorcycle mc3 = new Motorcycle("red");
System.out.print(mc3.getTopSpeed());
T. What is output?
Vehicle v4 = new Car();
v4.enhance();
System.out.print(v4);
U. What is output?
ElectricCar ec3 = new ElectricCar();
System.out.print(ec3.getTopSpeed());
V. Yes or No, will the following code compile? If not, explain why not.
Motorcycle mv4 = new Motorcycle("orange");
System.out.print(mv4.getClass());
W. What is output?
Object o1 = new Motorcycle("black");
Object o2 = new Motorcycle("black");
System.out.print((o1 == o2) + " " + o1.equals(o2));
X. What is output?
Vehicle v5 = new Vehicle();
v5.enhance();
v5.enhance();
System.out.print(v5.getTopSpeed());
Y. Assume the following method is added to Vehicle. What is output?
public static void checkDoors(Car c) {
    if (c.doors == 4) {
        c.doors = 6;
    }
}

Car c4 = new Car();
Vehicle.checkDoors(c4);
System.out.print(c4);`,
      reference: `Vehicle classes for short-answer parts P1 through Y:
public class Vehicle {
    private int topSpeed;
    public Vehicle(int s) { topSpeed = s; }
    public void enhance() { topSpeed += 5; }
    public int getTopSpeed() { return topSpeed; }
}

public class Motorcycle extends Vehicle {
    private String color;
    public Motorcycle(String c) {
        super(150);
        color = c;
    }
    public String getString() { return color + getTopSpeed(); }
}

public class Car extends Vehicle {
    private int doors;
    public Car() {
        super(90);
        doors = 4;
    }
    public void enhance() { doors++; }
    public String toString() { return "zoom: " + doors; }
}

public class ElectricCar extends Car {
    private int batteryLife;
    public void recharge() { batteryLife = 4; }
    public String toString() { return "days: " + batteryLife; }
}`,
      answers: [
        "N + 5",
        "3N^3 + 3N^2 + 6N + 5",
        "O(N^2)",
        "O(N^3)",
        "27 seconds",
        "10,100 seconds",
        "0.42 seconds",
        "O(N^2)",
        "[1, 7, 5, 3]",
        "1 3",
        "10 seconds",
        "ofalse",
        "6",
        "3",
        "5",
        "compile error",
        "compiles",
        "compiles",
        "compile error",
        "compile error",
        "150",
        "zoom: 5",
        "90",
        "Yes",
        "false false",
        "compile error",
        "compile error",
      ],
      answerPoints: [...Array(15).fill(2), ...Array(4).fill(1), ...Array(8).fill(2)],
    },
    {
      id: "cs314-2024-spring-exam-1-q2",
      title: "2. Lists - removeLast",
      points: 14,
      type: "code",
      prompt:
        "Inside GenericList<E>, implement removeLast. It removes the last occurrence of target from the list, if present, and returns the index of that occurrence before removing it. If target is not present, the list is unaltered and the method returns -1. For example, [A, B, AA, C, A, B].removeLast(A) returns 4 and leaves [A, B, AA, C, B]; removeLast(B) returns 5 and leaves [A, B, AA, C, A]; and removeLast(FX) returns -1 without changing the list. Do not check preconditions.",
      reference: `public class GenericList<E> {
    // This GenericList does NOT allow the client to store null values.
    private E[] con;
    private int size;
}

Storage model:
- The first size elements of con store the list elements.
- An element's list position is the same as its array position.
- con may have extra capacity; extra array slots store null.

Restrictions:
- You may not use any other GenericList methods unless you implement them yourself as part of your solution.
- You may call equals on objects and use the length field for arrays.
- You may not use any other Java classes or methods.
- Do not create any new data structures.

// pre: target != null
// post: Per the problem description.`,
      stub: `// pre: target != null
// post: Per the problem description.
public int removeLast(E target) {

}`,
      answer: `public int removeLast(E target) {
    for (int index = size - 1; index >= 0; index--) {
        if (con[index].equals(target)) {
            remove(index);
            return index;
        }
    }
    return -1;
}

private E remove(int position) {
    E old = con[position];
    size--;
    for (int index = position; index < size; index++) {
        con[index] = con[index + 1];
    }
    con[size] = null;
    return old;
}`,
      rubric: [
        { label: "Loops over the active array range", points: 1 },
        { label: "Starts at the back to locate the last occurrence efficiently", points: 1 },
        { label: "Finds the last occurrence of target correctly", points: 2 },
        { label: "Uses equals to compare the current element with target", points: 2 },
        { label: "Attempts to shift later elements after a match", points: 2 },
        { label: "Shifts the retained elements correctly", points: 2 },
        { label: "Updates size only when an element is removed", points: 2 },
        { label: "Nulls the old final active slot", points: 1 },
        { label: "Returns the removed index or -1 correctly without disallowed structures", points: 1 },
      ],
    },
    {
      id: "cs314-2024-spring-exam-1-q3",
      title: "3. Baby Names - formelyPopular",
      points: 18,
      type: "code",
      prompt:
        "Inside Names, implement formelyPopular. Return an ArrayList<String> containing every name that was formerly popular: it is unranked in the last numUnrankedEnd decades and was ranked minRank or better in at least one earlier decade. A rank of 0 means unranked, and a lower positive rank is more popular. For example, with a cutoff of 300 and the last 4 decades unranked, a record with ranks 638, 324, 223, 409, 0, 0, 0, 0, 0 qualifies; one that is ranked in a recent decade does not. Return an empty ArrayList if none qualify. Do not check preconditions.",
      reference: `public class Names {
    /* All NameRecords in this Names object have the same number of decades. */
    private ArrayList<NameRecord> names;
}

Allowed NameRecord methods:
- String getName() returns this record's name.
- int numDecades() returns the total number of decades, including unranked decades.
- int getRank(int decade) returns the 0-based decade's rank, or 0 when unranked.

Allowed ArrayList operations:
- new ArrayList<>()
- add(E obj), size(), get(int pos), and enhanced for loops.

Restrictions:
- Do not use any other Java classes or methods besides those listed.
- Create one ArrayList<String>, the result to return. Do not create other data structures.
- Do not add methods to NameRecord.`,
      stub: `/* pre: 1 <= minRank < 1000, numUnrankedEnd is less than the number of
   decades in which records in this Names object are ranked.
   post: this Names object is not altered and per the problem description. */
public ArrayList<String> formelyPopular(int minRank, int numUnrankedEnd) {

}`,
      answer: `public ArrayList<String> formelyPopular(int minRank, int numUnrankedEnd) {
    ArrayList<String> result = new ArrayList<>();
    for (NameRecord record : names) {
        if (meetsCriteria(record, minRank, numUnrankedEnd)) {
            result.add(record.getName());
        }
    }
    return result;
}

private boolean meetsCriteria(NameRecord record, int minRank, int numUnrankedEnd) {
    int cutoffDecade = record.numDecades() - numUnrankedEnd;
    for (int decade = cutoffDecade; decade < record.numDecades(); decade++) {
        if (record.getRank(decade) != 0) {
            return false;
        }
    }
    for (int decade = 0; decade < cutoffDecade; decade++) {
        int rank = record.getRank(decade);
        if (rank != 0 && rank <= minRank) {
            return true;
        }
    }
    return false;
}`,
      rubric: [
        { label: "Creates the resulting ArrayList<String>", points: 1 },
        { label: "Loops through the Names collection correctly", points: 2 },
        { label: "Attempts to verify the final unranked decades", points: 2 },
        { label: "Correctly verifies every final required decade is unranked", points: 3 },
        { label: "Stops promptly when a final decade is ranked", points: 1 },
        { label: "Attempts the earlier-decade popularity cutoff check", points: 2 },
        { label: "Correctly handles ranks of 0 and ranks at or better than minRank", points: 3 },
        { label: "Stops once a qualifying earlier rank is known", points: 1 },
        { label: "Adds the qualifying name String to the result exactly once", points: 2 },
        { label: "Returns the result without disallowed structures or hard-coded criteria", points: 1 },
      ],
    },
    {
      id: "cs314-2024-spring-exam-1-q4",
      title: "4. Other Data Structures - isSubset",
      points: 18,
      type: "code",
      prompt:
        "Inside MultiSet<E>, implement isSubset. Return true if other is a subset of the calling multiset, false otherwise. A multiset stores each distinct element with its frequency, and other is a subset only when every element in other occurs in this multiset at least as many times. For example, [B, B, B, C, C, C, C, A].isSubset([A, C, C]) returns true, while isSubset([A, A, C]) returns false. Neither multiset may be altered. Do not check preconditions.",
      reference: `public class MultiSet<E> { // Does NOT allow the client to add null.
    private ValueAndFrequency<E>[] con; // May have extra capacity.
    // ValueAndFrequency objects are stored in the first numDistinct spots.
    private int numDistinct; // Number of distinct elements.
    private int size; // Total number of elements, including duplicates.

    private static class ValueAndFrequency<E> {
        private E element; // Never null.
        private int frequency; // Always >= 1.
    }
}

Restrictions:
- Use only MultiSet instance variables and the nested ValueAndFrequency class.
- You may use equals on objects and the length field for arrays.
- Do not use other Java classes or methods.
- Do not create new data structures.

/* pre: other != null
   post: Per the problem description. */`,
      stub: `/* pre: other != null
   post: Per the problem description. */
public boolean isSubset(MultiSet<E> other) {

}`,
      answer: `public boolean isSubset(MultiSet<E> other) {
    for (int i = 0; i < other.numDistinct; i++) {
        E element = other.con[i].element;
        int index = find(element);
        if (index == -1 || con[index].frequency < other.con[i].frequency) {
            return false;
        }
    }
    return true;
}

private int find(E target) {
    for (int i = 0; i < numDistinct; i++) {
        if (con[i].element.equals(target)) {
            return i;
        }
    }
    return -1;
}`,
      rubric: [
        { label: "Loops over exactly the distinct elements of other", points: 2 },
        { label: "Accesses other multiset entries and their elements correctly", points: 4 },
        { label: "Searches this multiset for each element from other", points: 2 },
        { label: "Uses equals correctly and stops the search when a match is found", points: 3 },
        { label: "Returns false immediately when this multiset lacks a needed element", points: 2 },
        { label: "Compares frequencies in the correct direction", points: 3 },
        { label: "Returns false immediately for an insufficient frequency", points: 1 },
        { label: "Returns true only when all other entries are supported and leaves both multisets unchanged", points: 1 },
      ],
    },
  ],
};
