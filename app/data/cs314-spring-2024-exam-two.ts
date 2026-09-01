import type { Exam } from "@/app/lib/exam-types";

export const cs314Spring2024ExamTwo: Exam = {
  id: "cs314-2024-spring-exam-2",
  title: "CS 314 Spring 2024 Exam 2",
  subtitle: "Recursion, linked structures, maps, and graph search",
  sourceFiles: [
    { label: "Original exam", path: "exampdfs/cs314/2024-spring/exam-2-exam-spring-2024.pdf", role: "exam" },
    { label: "Official solution", path: "exampdfs/cs314/2024-spring/exam-2-solution-spring-2024.pdf", role: "solution" },
  ],
  questions: [
    {
      id: "cs314-2024-spring-exam-2-q1",
      title: "1. Short Answer",
      points: 50,
      type: "short",
      prompt:
        "Answer each short-answer item. For a compile or syntax error, answer compile error; for a runtime exception, answer runtime error; for an infinite loop, answer infinite loop. Big O answers should be the most restrictive correct Big O. Assume all necessary imports have been made.",
      diagrams: [
        {
          kind: "source",
          beforePart: "V",
          title: "For parts V through X: Binary tree",
          description: "Use this exact tree for the traversal and full-tree questions.",
          src: "/exam-assets/cs314/cs314-spring-2024-e2-tree.svg",
          alt: "Root P has left child M and right child O. M has right child D, D has left child K, and O has left child J.",
          width: 640,
          height: 390,
        },
      ],
      code: `A. What is returned by a(9)?
public static int a(int x) {
    if (x <= 3) {
        return x;
    }
    int t = (x % 3) + 1;
    return 2 + a(x - t);
}
B. What is returned by b(8, 0)?
public static int b(int x, int y) {
    if (x <= 1) {
        return y;
    } else if (x % 2 == 0) {
        return y + b(x - 3, y + 1);
    } else {
        return x + b(x - 1, y + 1);
    }
}
C. What is returned by c(7)?
public static int c(int x) {
    if (x <= 2) {
        return 1;
    } else {
        return 1 + c(x - 2) + c(x - 4);
    }
}
D. What is output?
int[] count = {0};
d(4, count);
System.out.print(count[0]);

public static int d(int x, int[] count) {
    count[0]++;
    if (x <= 0) {
        return 1;
    }
    return 2 + d(x - 1, count) + d(x - 1, count);
}
E. We need a java.util.Map and want operations involving the key to be as fast as possible. Which map should we use? Choices: A. java.util.HashMap, B. java.util.TreeMap, C. either HashMap or TreeMap.
F. What is output? This uses java.util.TreeMap and its usual {key=value, ...} toString format.
TreeMap<String, Integer> map = new TreeMap<>();
map.put("N", 5);
map.put("L", 6);
map.put("E", 5);
map.put("G", 9);
map.put("A", map.get("G"));
map.put("S", map.remove("L"));
map.put("E", 7);
System.out.println(map);
G. Why does this class not compile?
public class Student {
    private String name;
    double gpa;

    public abstract void calculateGPA();

    public static void main(String[] args) {
        Student s = new Student();
        System.out.println(s.name);
        System.out.println(s.toString());
    }
}
H. The following method takes 1 second when t1.size() = t2.size() = 10,000. What is the expected time when both sizes are 20,000?
// pre: t1.size() == t2.size(). Uses Java's LinkedList.
public static int h(LinkedList<Double> t1, ArrayList<Double> t2) {
    int t = 0;
    for (int i = 0; i < t2.size(); i++) {
        double a = t2.get(i);
        for (int j = 0; j < t1.size(); j += 2) {
            if (t1.get(j).equals(a)) {
                t += t1.get(j);
            }
        }
    }
    return t;
}
I. Consider this Node class and code. Which diagram shows the variables, objects, and references after the code runs?
public class Node {
    public Object data;
    public Node next;
}

Node n1 = new Node();
n1.next = new Node();
n1.next.next = n1;
n1.next.data = new int[2];
J. A java.util.LinkedList storing Strings is sorted. Which search is typically more efficient without creating a new data structure? Choices: A. binary search, B. linear search, C. either binary or linear search.
K. This ArrayList code takes 5 seconds when list.size() = 10,000. What is the expected time when list.size() = 20,000?
public static double k1(ArrayList<Double> list) {
    double r = 0.0;
    while (list.size() > 0) {
        r += list.get(0);
        list.remove(0); // remove based on position
    }
    return r;
}
L. This java.util.LinkedList code takes 5 seconds when list.size() = 100,000. What is the expected time when list.size() = 200,000?
public static double k2(LinkedList<Double> list) {
    double r = 0.0;
    while (list.size() > 0) {
        r += list.get(0);
        list.remove(0); // remove based on position
    }
    return r;
}
M. What is output? Stack314 and Queue314 have the lecture behavior.
Queue314<Integer> q = new Queue314<>();
Stack314<Integer> st = new Stack314<>();
for (int i = 0; i < 6; i++) {
    q.enqueue(i);
    st.push(i);
}
int t = 0;
while (!q.isEmpty()) {
    if (q.dequeue() == st.pop()) {
        t++;
    }
}
System.out.print(t);
N. A computer system stores user-input events such as keyboard presses and mouse events so it can respond in order. Which data structure is most likely? Choices: A. stack, B. queue, C. either stack or queue.
O. The following ArrayList code takes 10 seconds when list.size() = 6,000,000 and data.length = 25,000. Each data element is present once in list. What is the expected time when list.size() = 2,000,000 and data.length = 150,000?
public static int o(ArrayList<Integer> list, Integer[] data) {
    int t = 0;
    for (int i = 0; i < data.length; i++) {
        if (list.contains(data[i])) {
            t++;
        }
    }
    return t;
}
P1. Which is typically faster for a large ascending sort when all array elements are equal: insertion sort or quicksort?
P2. Which is typically faster for a large ascending sort when all elements are distinct and initially in descending order: insertion sort or quicksort?
Q. Which line numbers cause a compile error?
Map<String, Object> map = new HashMap<>(); // 1
map = new TreeMap<>(); // 2
map = new Map<>(); // 3
map.put("CS314", new Object()); // 4
map.get("Namish").toString(); // 5
map.put("Casey", "Pavan"); // 6
map.get("Casey").toLowerCase(); // 7
R. We need to sort a large array of objects that is not already ordered, while preserving equal-object order. Which studied sort is most likely? Choices: selection, insertion, radix, quick, merge.
S. The following java.util.LinkedList code takes 2 seconds when list.size() = 1,000,000. What is the expected time when list.size() = 2,000,000? Every string length is at most 20.
public static int s(LinkedList<String> list) {
    int t = 0;
    while (list.size() > 0) {
        t += list.remove(list.size() - 1).length();
    }
    return t;
}
T. Method s from part S instead uses the singly linked LinkList class developed in lecture. It takes 2 seconds when list.size() = 100,000. What is the expected time when list.size() = 200,000?
U. In a complete binary tree with 19 nodes, how many nodes does the deepest level contain?
For V through X, consider the binary tree shown in the source diagram.
V. What is the result of a postorder traversal?
W. What is the result of a preorder traversal?
X. The tree is not full. What is the minimum number of nodes to add to make it a full binary tree, without removing nodes?
Y. What is the height of the BST created by simple insertion of each name length below?
String[] names = {"Devon", "G-lynn", "Brayden", "Aman", "Pavan", "Lauren", "Namish", "Nidhi", "Lauren", "Eliza", "Bersam", "Sumaya"};
BST<Integer> t = new BST<>();
for (String name : names) {
    t.add(name.length());
}`,
      answerChoices: {
        I: [
          {
            id: "A",
            text: "Diagram A",
            diagram: {
              kind: "source",
              src: "/exam-assets/cs314/cs314-spring-2024-e2-node-answer-a.svg",
              alt: "n1 points to a node whose next field points to a second node containing an int array; the second node's next field is null.",
              width: 680,
              height: 250,
            },
          },
          {
            id: "B",
            text: "Diagram B",
            diagram: {
              kind: "source",
              src: "/exam-assets/cs314/cs314-spring-2024-e2-node-answer-b.svg",
              alt: "n1 points to a node whose next field points to a second node containing an int array; the second node points back to the first node.",
              width: 680,
              height: 250,
            },
          },
          {
            id: "C",
            text: "Diagram C",
            diagram: {
              kind: "source",
              src: "/exam-assets/cs314/cs314-spring-2024-e2-node-answer-c.svg",
              alt: "n1 points to one node containing an int array whose next field points back to itself.",
              width: 680,
              height: 250,
            },
          },
          {
            id: "D",
            text: "Diagram D",
            diagram: {
              kind: "source",
              src: "/exam-assets/cs314/cs314-spring-2024-e2-node-answer-d.svg",
              alt: "n1 points to a node whose next field points to a second node containing an int array; the second node points to itself.",
              width: 680,
              height: 250,
            },
          },
        ],
      },
      answers: [
        "8",
        "10",
        "9",
        "31",
        "A",
        "{A=9, E=7, G=9, N=5, S=6}",
        "the class must also be declared abstract",
        "8 seconds",
        "B",
        "B",
        "20 seconds",
        "10 seconds",
        "0",
        "B",
        "20 seconds",
        "insertion sort",
        "quicksort",
        "3 and 7",
        "mergesort",
        "4 seconds",
        "8 seconds",
        "4",
        "K D M J O P",
        "P M D K O J",
        "3",
        "2",
      ],
      answerPoints: [...Array(15).fill(2), 1, 1, 2, ...Array(8).fill(2)],
    },
    {
      id: "cs314-2024-spring-exam-2-q2",
      title: "2. Linked Lists - isRectangular",
      points: 18,
      type: "code",
      prompt:
        "Inside LinkedMatrix<E>, implement private isRectangular. Return true exactly when every row has the same number of elements. An empty matrix is rectangular; a nonempty matrix whose rows all have zero elements is also rectangular. Do not use recursion, create data structures, alter the calling object, or use other Java classes or methods. Helpers are allowed.",
      diagrams: [
        {
          kind: "source",
          title: "LinkedMatrix representation",
          description: "The abstract 2 by 3 matrix and its row-header/data-node linked representation. A slash denotes null.",
          src: "/exam-assets/cs314/cs314-spring-2024-e2-linked-matrix.svg",
          alt: "An abstract matrix with rows 12 minus 3 7 and 5 0 19, represented by two linked row headers with three linked data nodes per row.",
          width: 1180,
          height: 500,
        },
      ],
      reference: `public class LinkedMatrix<E> {
    // Header of the first row. Stores null if the matrix is empty.
    private RowHeader<E> firstRow;

    private static class RowHeader<E> {
        private RowHeader nextRow; // null if this is the last row header
        private DataNode<E> first; // first data node, or null if the row is empty
    }

    private static class DataNode<E> {
        private E data;
        private DataNode<E> next; // next element, or null if none
    }
}

Restrictions:
- You may not use other LinkedMatrix methods unless you implement them yourself.
- Do not use recursion or create new data structures.
- Do not alter the calling object or use other Java classes or methods.

// pre: None. post: Per the problem description.`,
      stub: `// pre: None. post: Per the problem description.
private boolean isRectangular() {

}`,
      answer: `private boolean isRectangular() {
    if (firstRow == null) {
        return true;
    }
    int targetColumns = numColumns(firstRow);
    RowHeader<E> temp = firstRow.nextRow;
    while (temp != null) {
        int columns = numColumns(temp);
        if (columns != targetColumns) {
            return false;
        }
        temp = temp.nextRow;
    }
    return true;
}

private int numColumns(RowHeader<E> header) {
    int count = 0;
    DataNode<E> temp = header.first;
    while (temp != null) {
        count++;
        temp = temp.next;
    }
    return count;
}`,
      rubric: [
        { label: "Returns true for an empty matrix", points: 2 },
        { label: "Establishes the first row's column count as the target", points: 1 },
        { label: "Moves from a row header to its first data node", points: 1 },
        { label: "Visits all data nodes in a row", points: 2 },
        { label: "Counts one column for each data node", points: 1 },
        { label: "Advances through data nodes correctly", points: 3 },
        { label: "Moves to and checks later row headers", points: 3 },
        { label: "Returns false as soon as a row count differs", points: 2 },
        { label: "Advances through row headers correctly", points: 2 },
        { label: "Returns true for rectangular structures without altering them", points: 1 },
      ],
    },
    {
      id: "cs314-2024-spring-exam-2-q3",
      title: "3. Maps - getNum",
      points: 18,
      type: "code",
      prompt:
        "Implement getNum(Map<String, Set<String>> map, int minPeople). The keys are people and each value is the set of activities that person enjoys. Return how many distinct activities are enjoyed by minPeople or more people. For example, Teaching and Programming are the two activities enjoyed by at least four people in the source example. You may create and use one TreeMap or HashMap; do not use recursion or alter the supplied map.",
      reference: `Example map entries:
- Gracelynn: Teaching, Programming, Working, Canoeing, Making Donuts
- Namish: Programming, Checking Ed, Teaching, Skydiving, Volleyball
- Brayden: Skydiving, Canoeing, Kayaking, Chess, Programming
- Aman: Checking Ed, Programming, Teaching, Breakdancing, Wordle
- Lauren: Traveling, Teaching, Programming, Volleyball, Line Dancing

Allowed operations:
- Map: keySet(), containsKey(K key), get(K key), put(K key, V value), remove(K key)
- Set: enhanced for loops, or iterator(), hasNext(), next(), and remove().

Restrictions:
- Create and use one local Map (TreeMap or HashMap) only.
- Do not use other Java classes or methods, recursion, or new data structures.
- Do not alter the map parameter.

/* pre: map != null, minPeople >= 2
   post: Per the problem description. map is not altered by this method. */`,
      stub: `/* pre: map != null, minPeople >= 2
   post: Per the problem description. map is not altered by this method. */
public static int getNum(Map<String, Set<String>> map, int minPeople) {

}`,
      answer: `public static int getNum(Map<String, Set<String>> map, int people) {
    HashMap<String, Integer> freqs = new HashMap<>();
    for (String name : map.keySet()) {
        for (String activity : map.get(name)) {
            if (freqs.containsKey(activity)) {
                freqs.put(activity, freqs.get(activity) + 1);
            } else {
                freqs.put(activity, 1);
            }
        }
    }
    int result = 0;
    for (String activity : freqs.keySet()) {
        if (freqs.get(activity) >= people) {
            result++;
        }
    }
    return result;
}`,
      rubric: [
        { label: "Creates one local frequency map", points: 1 },
        { label: "Uses a HashMap for efficient frequency lookup", points: 2 },
        { label: "Loops through the supplied map's keys and gets each activity set", points: 3 },
        { label: "Visits every activity in each set", points: 1 },
        { label: "Tests whether an activity already has a frequency", points: 1 },
        { label: "Stores a frequency of one for new activities", points: 2 },
        { label: "Gets, increments, and stores existing frequencies correctly", points: 2 },
        { label: "Initializes a result counter and loops through frequency-map keys", points: 2 },
        { label: "Checks each activity frequency against minPeople", points: 2 },
        { label: "Counts qualifying activities and returns the result without altering the input", points: 2 },
      ],
    },
    {
      id: "cs314-2024-spring-exam-2-q4",
      title: "4. Recursive Backtracking - canConvert",
      points: 14,
      type: "code",
      prompt:
        "Complete the recursive help method used by canConvert. It returns whether frequent-flier miles from origin can be converted to destination through a path of codeshare partners. Airline supplies getPartners() and equals(Object). Use recursion and the supplied tried set to avoid revisiting airlines. The source's kickoff method names this helper helper, while the printed starter and executable exercise use help; implement help below. Do not create data structures, alter partner arrays, or add helpers.",
      reference: `public class Airline {
    // Returns partner airlines for this Airline.
    public Airline[] getPartners()

    // Returns true if this Airline equals other.
    public boolean equals(Object other)
}

Kickoff method:
// pre: org != null, dest != null
public static boolean canConvert(Airline org, Airline dest) {
    Set<Airline> tried = new HashSet<>();
    return help(org, dest, tried);
}

Allowed: array length; Airline; Set add and contains.
The helper must use recursion. Do not create data structures, alter arrays returned by getPartners, or add other helper methods.`,
      stub: `private static boolean help(Airline org, Airline dest, Set<Airline> tried) {

}`,
      answer: `private static boolean help(Airline org, Airline dest, Set<Airline> tried) {
    if (org.equals(dest)) {
        return true;
    }
    if (!tried.add(org)) {
        return false;
    }
    for (Airline partner : org.getPartners()) {
        if (help(partner, dest, tried)) {
            return true;
        }
    }
    return false;
}`,
      rubric: [
        { label: "Uses a success base case for origin equal to destination", points: 3 },
        { label: "Uses a failure base case for an already-tried airline", points: 2 },
        { label: "Records the current airline before recursive exploration", points: 2 },
        { label: "Gets and loops through every partner airline", points: 1 },
        { label: "Recurses with each partner as the new origin", points: 2 },
        { label: "Propagates a successful recursive result immediately", points: 2 },
        { label: "Returns false after all possible paths fail", points: 2 },
      ],
    },
  ],
};
