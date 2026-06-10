import type { Exam } from "@/app/lib/exam-types";

export const cs314ExamThree: Exam = {
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
        "Inside Graph, implement isBridge(String v1, String v2). Return true if the specified adjacent edge is a bridge, false otherwise. A bridge is an edge whose removal makes the connected undirected graph no longer connected. In the shown exam graph, D-F is a bridge, while D-C is not. Do not check preconditions.",
      reference: `The Graph, Vertex, and Edge classes for this question are essentially the same as assignment 11.
Vertex has an added removeEdge method that removes and returns the edge with the given destination Vertex from the calling Vertex object's adjacency List.

public class Graph {
    private Map<String, Vertex> verts; // keys are names of vertices

    private void clearAll() // Sets all Vertex.scratch variables to 0.

    public boolean isBridge(String v1, String v2) // TO DO

    private static class Vertex {
        private String name;
        private List<Edge> adjacent;
        private int scratch;
        public Edge removeEdge(Vertex dest)
        // Do not use or add other instance variables or methods.
    }

    private static class Edge {
        private Vertex dest;
        // Do not use or add other instance variables or methods.
    }
}

Restrictions:
- The graph is unweighted and undirected. All edge costs are 1.
- If vertex A has an edge in its adjacency list to B, B also has an edge to A.
- The graph is connected.
- The two vertices specified by v1 and v2 are adjacent.
- Do not use recursion. Implement a breadth-first search.
- You may create and use a single Queue314<Vertex>; allowed Queue314 methods are enqueue(E e), boolean isEmpty(), E front(), E dequeue().
- You may use Map get(Object key) and size().
- The Map verts is not altered by this method.
- You may use the given clearAll method.
- You may temporarily alter the Vertex objects connected by the target edge by removing that edge, but must restore adjacency lists before returning.
- Use Vertex.scratch variables as needed.
- You may use List size(), get(int pos), add(E val), iterator().
- You may use Iterator next() and hasNext().
- Do not create new data structures other than the single Queue314<Vertex> and Iterator objects.

/* pre: v1 != null, v2 != null, !v1.equals(v2),
   the vertices specified by v1 and v2 are adjacent,
   there is an edge between them, and this Graph is connected.
   post: return true if the specified edge is a bridge edge, false otherwise.
   This Graph is not altered after this method completes. */`,
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
        "Inside IntBST, implement numInRange(low, high). Return the number of int values in the binary search tree that are in the inclusive range [low, high]. Use the BST property to avoid visiting unnecessary nodes. The calling object is not altered. Do not check preconditions.",
      reference: `Example tree:
        5
      /   \\
     3     12
    /     /  \\
   0     9    15
        /
       7

Example calls:
- numInRange(3, 6) returns 2
- numInRange(20, 30) returns 0
- numInRange(-5, -10) returns 0
- numInRange(3, 3) returns 1
- numInRange(3, 5) returns 2
- numInRange(-5, 20) returns 7
- numInRange(0, 15) returns 7
- numInRange(3, 10) returns 4

public class IntBST {
    private IntNode root; // stores null if tree is empty
    // no size variable

    private static class IntNode {
        private int val;
        private IntNode left;  // stores null if no left child
        private IntNode right; // stores null if no right child
    }
}

Restrictions:
- You may use the nested IntNode class.
- You may not create any new data structures, not even an array of length 1.
- If you create a helper method, do not include unnecessary parameters.
- Do not add any class or instance variables to IntBST.
- The calling object is not altered by this method.

/* pre: low <= high, post: per the problem description. */`,
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
        "Inside HashTable314<E>, fully implement the inner HIterator class with instance variables, constructor if needed, and the hasNext, next, and remove methods. The iterator must allow clients to access all elements of the hash table. hasNext must be O(1) in all cases and must not alter iterator state.",
      reference: `public class HashTable314<E> implements Iterable<E> {
    private List<E>[] con;
    private int size; // number of elements in this HashTable314.

    public Iterator<E> iterator() {
        return new HIterator();
    }

    private class HIterator implements Iterator<E> { // TO DO
    }
}

Facts and restrictions:
- HashTable314 uses closed addressing (chaining/buckets) to resolve collisions.
- Buckets in con are objects that implement java.util.List.
- Empty buckets store null in con.
- Hash tables do not provide E get(int pos).
- Declare the necessary HIterator instance variables and implement a constructor if necessary.
- Do NOT check preconditions for next or remove.
- If a bucket becomes empty due to HIterator.remove, null out that element in con.
- You may create and use Iterator objects for internal buckets via the List iterator methods.
- You may call hasNext, next, and remove on those bucket Iterators.
- Do not create any new data structures other than Iterators for internal buckets.
- You may call List.size() on non-null List objects stored in con.
- Do not attempt to deal with potential ConcurrentModificationExceptions with the outer HashTable314 object.
- Do not use any other Java methods or classes than those described above.
- Do not add methods or variables to HashTable314.
- Do not use recursion.`,
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

