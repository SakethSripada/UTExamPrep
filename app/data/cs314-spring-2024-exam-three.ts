import type { Exam } from "@/app/lib/exam-types";

export const cs314Spring2024ExamThree: Exam = {
  id: "cs314-2024-spring-exam-3",
  title: "CS 314 Spring 2024 Exam 3",
  subtitle: "Trees, encoding, heaps, hashing, and graphs",
  sourceFiles: [
    { label: "Original exam", path: "exampdfs/cs314/2024-spring/exam-3-exam-spring-2024.pdf", role: "exam" },
    { label: "Official solution", path: "exampdfs/cs314/2024-spring/exam-3-solution-spring-2024.pdf", role: "solution" },
  ],
  questions: [
    {
      id: "cs314-2024-spring-exam-3-q1",
      title: "1. Short Answer",
      points: 50,
      type: "short",
      prompt:
        "Answer each short-answer item. For a compile or syntax error, answer compile error; for a runtime exception, answer runtime error; for an infinite loop, answer infinite loop. Big O answers should be the most restrictive correct Big O. Assume all necessary imports have been made.",
      diagrams: [
        {
          kind: "source",
          beforePart: "P1",
          title: "For part P: Maximum binary heaps before and after removeMax",
          description:
            "The source problem's two heap states. The unknown value occupies the last node before removal and the left child of the root afterward.",
          src: "/exam-assets/cs314/cs314-spring-2024-e3-max-heaps.svg",
          alt: "Before removal: 100 at the root; 90 and 40 below; 10 and 5 below 90; an unknown left child below 40. After removal: 90 at the root; unknown and 40 below; 10 and 35 below the unknown.",
          width: 1180,
          height: 520,
        },
        {
          kind: "source",
          beforePart: "Q",
          title: "For part Q: Five-slot linear-probing table",
          description: "The source table has array indices 0 through 4 and starts empty.",
          src: "/exam-assets/cs314/cs314-spring-2024-e3-linear-probing.svg",
          alt: "An empty five-cell hash-table array labeled 0, 1, 2, 3, and 4.",
          width: 1000,
          height: 270,
        },
        {
          kind: "source",
          beforePart: "U",
          title: "For part U: Timing table",
          description: "The source timing observations for the unknown graph algorithm, in seconds.",
          src: "/exam-assets/cs314/cs314-spring-2024-e3-timing-table.svg",
          alt: "A five-by-five timing table with V and E values from 10,000 to 160,000.",
          width: 1030,
          height: 570,
        },
        {
          kind: "graph",
          beforePart: "W",
          title: "For parts W and X: Directed graph",
          description: "The graphical form of the source adjacency list. Arrowheads show edge direction.",
          directed: true,
          nodes: [
            { id: "A", label: "A", x: 110, y: 200 },
            { id: "B", label: "B", x: 260, y: 90 },
            { id: "C", label: "C", x: 260, y: 310 },
            { id: "D", label: "D", x: 420, y: 140 },
            { id: "E", label: "E", x: 520, y: 260 },
            { id: "F", label: "F", x: 660, y: 300 },
            { id: "G", label: "G", x: 420, y: 40 },
            { id: "H", label: "H", x: 610, y: 55 },
          ],
          edges: [
            { from: "A", to: "B" },
            { from: "A", to: "C" },
            { from: "B", to: "D" },
            { from: "B", to: "G" },
            { from: "C", to: "B" },
            { from: "C", to: "D" },
            { from: "D", to: "E" },
            { from: "E", to: "A" },
            { from: "E", to: "C" },
            { from: "E", to: "D" },
            { from: "E", to: "F" },
            { from: "G", to: "H" },
          ],
        },
      ],
      code: `A. What is output when the call a(9, 1) is made?
public static void a(int x, int y) {
    if (x < y)
        System.out.print(x - y);
    else {
        System.out.print(x);
        a(x / 2, y + 1);
        System.out.print(y);
    }
}
B. Using the techniques and rules from lecture, what is T(N) for b? N is parameter n. Assume n is a power of 2.
public static double b(int n) {
    int t = 0;
    for (int i = 1; i <= n; i *= 2) {
        for (int j = 0; j < n; j++) {
            t += i * j;
        }
    }
    return t;
}
C. The chars 'N', 'I', 'D', 'H', 'I' are inserted, left to right, into an initially empty binary search tree using simple add. What is the postorder traversal? Do not include quotes.
D. BST314.iterativeAdd implements simple iterative insertion. The following method takes 5 seconds when n = 40,000. What is the expected time when n = 80,000?
public static BST314<Integer> d(int n) {
    BST314<Integer> t = new BST314<>();
    for (int i = n; i >= -n; i--) {
        t.iterativeAdd(i);
    }
    return t;
}
E. The following TreeSet method takes 5 seconds when n = 1,000,000. What is the expected time when n = 4,000,000?
public static TreeSet<Integer> e(int n) {
    TreeSet<Integer> t = new TreeSet<>();
    for (int i = n; i >= -n; i--) {
        t.add(i);
    }
    return t;
}
F. Insert 9, 7, 5, 3, left to right, into an initially empty red-black tree using the lecture algorithm. Draw the resulting tree and label each node red or black. For automatic scoring, enter a semicolon-separated canonical description in this order: root, left child, left-left child, right child; use number(color), for example root=4(B); left=2(R); left.left=1(B); right=9(B).
G. A base-10 radix sort processes [725, 124, 131, 99, 1003]. What are the contents after the second pass?
H. The English letters in PAVANAN, with no pseudo-EOF, are placed in a Huffman Code tree as demonstrated in lecture. Give the level-order traversal of leaf nodes only, ignoring internal nodes.
I. How many bits are needed to encode a Huffman tree in Standard Tree Format with 10 internal nodes? Do not include the 32-bit tree-size header; BITS_PER_WORD = 8.
J. For Huffman coding to use fewer bits for a file that includes all possible BITS_PER_WORD = 8 values, which tree is desired? Choices: A. a tall, skinny tree; B. a short, broad tree; C. either likely compresses.
K. At POINT K, what is the size of stack st in Big O notation? N is parameter n.
public static void k(int n) {
    n = Math.abs(n);
    Stack314<Integer> st = new Stack314<>();
    while (n > 2) {
        st.push(n % 3);
        n /= 3;
    }
    st.push(n);
    // POINT K
    while (!st.isEmpty()) {
        System.out.print(st.pop());
    }
}
L. Does method k print the base-3 representation of abs(n), such as 1000 for n = 27? Choices: A. no; B. yes.
M. What is the order of m? N is data.length. data begins in random order. java.util.PriorityQueue is used.
public static void m(int[] data) {
    PriorityQueue<Integer> pq = new PriorityQueue<>();
    for (int x : data) {
        pq.add(x);
    }
    for (int i = 0; i < data.length; i++) {
        data[i] = pq.remove();
    }
}
N. What single word describes data after m completes?
O. Values 5, 15, 20, 5, 0, 25 are added, left to right, to an initially empty min heap using the lecture algorithm. How many value swaps occur in total?
P1. From the source heap diagram, enter the first valid answer choice in ascending letter order. Choices: A. 30; B. 37; C. 40; D. 47; E. 55.
P2. Enter the second valid answer choice in ascending letter order.
Q. Point.hashCode returns x + y. Points (4, 10), (0, 4), and (3, 4) are added, in that order, to a length-5 linear-probing hash table with load limit 0.75. Give all five internal-array cells in index order, using / for null.
R. What is the most likely output from r(1_000_000, rng)?
public static void r(int n, Random rng) {
    HashSet<Integer> hs = new HashSet<>();
    for (int i = 0; i < n; i++) {
        int x = Math.abs(rng.nextInt()); // Line 1
        x = x % 10; // Line 2
        hs.add(x); // Line 3
    }
    System.out.println(hs.size());
}
S. Method r takes 5 seconds for n = 1,000,000. What is the expected time for n = 2,000,000? Assume Random.nextInt and println are O(1).
T. In r, delete Lines 1 and 2 and replace Line 3 with hs.add(rng.nextInt()). The default HashSet capacity is 10, its load limit is 0.75, and each resize doubles capacity. How many resizes likely occur for n = 90?
U. Based on the timing table below, what is the most likely order of the graph algorithm in terms of V and E?
V. A Trie stores roughly 113,000 English words whose total characters are about 900,000. Approximately how many nodes result? Choices: A. 230,000; B. 460,000; C. 700,000; D. 900,000; E. 1,800,000.
W. This directed, unweighted graph uses the following adjacency list. Is it cyclical? Answer yes or no.
A: B, C
B: D, G
C: B, D
D: E
E: A, C, D, F
G: H
X. For the graph in W, what is the length of the shortest path from G to A?
Y. What is output?
int[] result =
    IntStream.range(1, 14)
        .filter(x -> x % 2 == 0 && x % 3 == 0)
        .map(x -> x * 2)
        .toArray();
System.out.print(Arrays.toString(result));`,
      answers: [
        "94-121",
        "3Nlog2N + 4log2N + 4",
        "H D I N",
        "20 seconds",
        "22 seconds",
        "root=7(B); left=5(B); left.left=3(R); right=9(B) or 7 black, 5 black, 3 red, 9 black",
        "[1003, 124, 725, 131, 99]",
        "A N P V",
        "120 bits",
        "A",
        "O(logN)",
        "B",
        "O(NlogN)",
        "sorted",
        "3",
        "B",
        "C",
        "[(0, 4), /, (3, 4), /, (4, 10)]",
        "10",
        "10 seconds",
        "4 times",
        "O(VE^2)",
        "A",
        "Yes",
        "No path exists from G to A",
        "[12, 24]",
      ],
      answerPoints: [...Array(15).fill(2), 1, 1, ...Array(9).fill(2)],
    },
    {
      id: "cs314-2024-spring-exam-3-q2",
      title: "2. Trees - count",
      points: 15,
      type: "code",
      prompt:
        "Inside BinTree<E>, implement count(tgt, minDepth). Return the number of nodes whose data equals tgt, whose depth is at least minDepth, and that have exactly two children. The tree is not altered. For example, use the source tree below: count(7, 2) returns 1, count(7, 1) returns 2, and count(3, 2) returns 0. Do not check preconditions.",
      diagrams: [
        {
          kind: "source",
          title: "Source example BinTree",
          description: "The source tree used for the count examples; the blue arrow denotes the tree root.",
          src: "/exam-assets/cs314/cs314-spring-2024-e3-count-tree.svg",
          alt: "Root 5. Its left child 7 has children 8 and 9. Its right child 3 has children 7 and 9. That 7 has children 5 and 4; its 5 has children 5 and 7; the latter 7 has right child 7. The right 9 has right child 0.",
          width: 1050,
          height: 770,
        },
      ],
      reference: `public class BinTree<E> {
    // stores null iff tree is empty
    private BNode<E> root;
    public int count(E tgt, int minDepth) // TO DO

    private static class BNode<E> {
        private E data; // Never null.
        private BNode<E> left;  // null if no left child
        private BNode<E> right; // null if no right child
    }
}

Restrictions:
- You may use Object.equals and the given BinTree and BNode classes.
- Do not use any other Java classes or methods.
- Do not create any new objects, even an array of length 1.
- You may implement a helper method; do not add unnecessary parameters.

/* pre: tgt != null, minDepth >= 0
   post: Per the problem description. This BinTree is not altered by this method. */`,
      stub: `/* pre: tgt != null, minDepth >= 0
   post: Per the problem description. This BinTree is not altered by this method. */
public int count(E tgt, int minDepth) {

}`,
      answer: `public int count(E tgt, int minDepth) {
    return help(root, tgt, 0, minDepth);
}

private int help(BNode<E> n, E tgt, int currentDepth, int minDepth) {
    if (n == null) {
        return 0;
    }
    int result = 0;
    if (currentDepth >= minDepth && n.left != null
            && n.right != null && n.data.equals(tgt)) {
        result++;
    }
    int newDepth = currentDepth + 1;
    return result + help(n.left, tgt, newDepth, minDepth)
            + help(n.right, tgt, newDepth, minDepth);
}`,
      rubric: [
        { label: "Creates an appropriate helper method", points: 1 },
        { label: "Makes the helper return an int", points: 1 },
        { label: "Handles a null current node by returning 0", points: 3 },
        { label: "Checks the current depth against minDepth", points: 1 },
        { label: "Checks target equality after the depth test", points: 1 },
        { label: "Requires both children to be non-null", points: 2 },
        { label: "Counts a qualifying current node", points: 1 },
        { label: "Recurses on both subtrees", points: 3 },
        { label: "Passes the incremented depth correctly", points: 1 },
        { label: "Returns the local and recursive counts without altering the tree", points: 1 },
      ],
    },
    {
      id: "cs314-2024-spring-exam-3-q3",
      title: "3. Encoding and Trees - decode",
      points: 19,
      type: "code",
      prompt:
        "Inside MorseCodeTree, implement decode(s). A period is a dot and moves left; a hyphen is a dash and moves right. Every encoded letter, including the last, ends with an asterisk separator. Return the decoded message or null for an invalid encoding. Do not use recursion or new data structures. Do not check preconditions.",
      diagrams: [
        {
          kind: "source",
          title: "Standard Morse-code tree used for examples",
          description: "The source reference shows dot edges to the left and dash edges to the right. Do not assume the implementation tree is exactly this reference, except that valid paths end at valid symbols.",
          src: "/exam-assets/cs314/cs314-spring-2024-e3-morse-tree.svg",
          alt: "A standard Morse-code tree with start at the root, dot left and dash right. It includes E and T at the first level and English letters through four symbols deep.",
          width: 1280,
          height: 700,
        },
      ],
      reference: `Examples:
- decode("-.*..*-..*....*") returns "NIDHI".
- decode("..-*-*-.-.*...*") returns "UTCS".
- decode("-.-.*.-*...*.*-.--*") returns "CASEY".
- decode("..--*-*") returns null because no code has ..--.
- decode("..--*-") returns null because it lacks an ending asterisk.
- decode("*.*.*") returns null because it starts with an asterisk.
- decode("..*+-*") returns null because + is invalid.

public class MorseCodeTree {
    private MNode root; // Does not store a valid letter.

    private static class MNode {
        private char letter;
        private MNode left;  // null if no left child
        private MNode right; // null if no right child
    }
}

Allowed:
- MNode and root instance variables.
- String charAt and length.
- A new empty String and String concatenation.

Restrictions:
- Do not use any other Java classes or methods.
- Do not create new data structures.
- Do not use recursion.

/* pre: s != null, s.length() >= 1
   post: return the message encoded by s or null if s is not a valid encoding.
   This MorseCodeTree is not altered by this method call. */`,
      stub: `/* pre: s != null, s.length() >= 1
   post: return the message encoded by s or null if s is not a valid encoding.
   This MorseCodeTree is not altered by this method call. */
public String decode(String s) {

}`,
      answer: `public String decode(String s) {
    if (s.charAt(0) == '*' || s.charAt(s.length() - 1) != '*') {
        return null;
    }
    String result = "";
    MNode n = root;
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (c == '*') {
            result += n.letter;
            n = root;
        } else if (c == '.') {
            n = n.left;
        } else if (c == '-') {
            n = n.right;
        } else {
            return null;
        }
        if (n == null) {
            return null;
        }
    }
    return result;
}`,
      rubric: [
        { label: "Returns null for an encoding that begins with *", points: 1 },
        { label: "Returns null when the final character is not *", points: 1 },
        { label: "Uses a local node initialized at root", points: 1 },
        { label: "Loops through the String characters", points: 2 },
        { label: "Moves left for a dot", points: 2 },
        { label: "Moves right for a hyphen", points: 2 },
        { label: "Appends the current letter at a separator", points: 2 },
        { label: "Resets the current node to root after each separator", points: 3 },
        { label: "Returns null for an invalid character", points: 2 },
        { label: "Returns null after walking off the tree", points: 2 },
        { label: "Returns the decoded String without disallowed structures or recursion", points: 1 },
      ],
    },
    {
      id: "cs314-2024-spring-exam-3-q4",
      title: "4. Graphs and Recursion - Hamiltonian Path",
      points: 16,
      type: "code",
      prompt:
        "Complete the recursive backtracking helper for Graph.containsHamiltonianPath. It returns true when the directed graph contains a path that visits every vertex exactly once. You do not need to store the path. The start and end vertices are different. Do not add helpers or change the helper parameters.",
      diagrams: [
        {
          kind: "source",
          title: "Hamiltonian-path illustration",
          description: "The source graph marks the illustrated Hamiltonian path with solid red edges and unused edges with black dotted lines.",
          src: "/exam-assets/cs314/cs314-spring-2024-e3-hamiltonian-path.svg",
          alt: "An unlabeled graph whose solid red edges show a Hamiltonian path through every displayed vertex exactly once; unused edges are dotted black.",
          width: 840,
          height: 560,
        },
      ],
      reference: `public class Graph {
    private Map<String, Vertex> vertices;
    private String currentStartVertex;
    private void clearAll() // sets all Vertex scratch values to 0

    private static class Vertex {
        private String name;
        private List<Edge> adjacent;
        private int scratch;
    }

    private static class Edge {
        private Vertex dest;
        private double cost;
    }

    public boolean containsHamiltonianPath() {
        clearAll();
        for (String name : vertices.keySet()) {
            if (helper(name, 0)) {
                currentStartVertex = name;
                return true;
            }
        }
        return false;
    }
}

Allowed:
- Map get and size.
- List get, size, and iterator.
- Iterator hasNext and next, explicitly or in an enhanced for loop.
- The Graph, Vertex, and Edge instance variables.

Restrictions:
- Do not create any new data structures other than iterators.
- Do not add helpers or alter the helper parameter list.
- Do not add or remove elements from the map named vertices.`,
      stub: `/* Complete the following method. Do not add any other helper methods.
   Do not change the method header. Do not add or remove elements from vertices. */
private boolean helper(String currentVertexName, int verticesInPath) {

}`,
      answer: `private boolean helper(String currentVertexName, int verticesInPath) {
    Vertex current = vertices.get(currentVertexName);
    if (current.scratch == 1) {
        return false;
    }
    current.scratch = 1;
    verticesInPath++;
    if (verticesInPath == vertices.size()) {
        return true;
    }
    for (Edge e : current.adjacent) {
        if (helper(e.dest.name, verticesInPath)) {
            return true;
        }
    }
    current.scratch = 0;
    return false;
}`,
      rubric: [
        { label: "Gets the current Vertex from the map using its name", points: 1 },
        { label: "Rejects a vertex that is already in the current path", points: 2 },
        { label: "Counts the current vertex in the path", points: 1 },
        { label: "Recognizes a path containing every vertex", points: 2 },
        { label: "Marks the current vertex before continuing", points: 2 },
        { label: "Loops over the current vertex's outgoing edges", points: 1 },
        { label: "Recurses to adjacent destinations", points: 2 },
        { label: "Returns true as soon as a recursive call succeeds", points: 2 },
        { label: "Unmarks the vertex when this route fails", points: 2 },
        { label: "Returns false at a dead end without disallowed structures", points: 1 },
      ],
    },

  ],
};
