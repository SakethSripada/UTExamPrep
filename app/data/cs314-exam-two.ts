import type { Exam } from "@/app/lib/exam-types";

export const cs314ExamTwo: Exam = {
  id: "cs314-fall-2025-e2",
  title: "CS 314 Fall 2025 Exam 2",
  subtitle: "Maps, linked lists, recursion, sorting, queues, and trees",
  sourceFiles: [
    { label: "Original exam", path: "exampdfs/CS_314_Fall_25_E2.pdf", role: "exam" },
    {
      label: "Official solution and grading criteria",
      path: "exampdfs/Fall_2025_E2_GradingCrit_And_Solutions.pdf",
      role: "solution",
    },
  ],
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
        "Implement playedMostRanked. Given a map from college volleyball team name to an ArrayList of teams it has played, and a Set of top-25 ranked team names, return the key team that has played the most ranked teams. If there is a tie, return any tied team. It is correct to count repeated games against ranked teams as repeated ranked opponents. Do not check preconditions.",
      reference: `Partial example of teams:
Texas -> [A&M, Pitt, SMU, TCU, Stanford, Baylor, Georgia, Vanderbilt, Wisconsin]
A&M -> [Texas, SMU, Florida, Alabama, Arkansas, Missouri, TxSt, Trinity, UNT]
SMU -> [Texas, A&M, TCU, UNT, Texas Tech, Colorado, Utah, Houston, West Virginia]
UNT -> [A&M, SMU, Sam Houston, TCU, TxSt, West Texas, Baylor, Texas Tech, UTD]
TxSt -> [UNT, Trinity, UTSA, UTD, Nebraska, Minnesota, Austin, SLU, Northwestern]

Allowed methods:
- Map<K, V>: Set<E> keySet(), V get(Object key)
- Set<E>: boolean contains(E value)
- Iterator<E>: boolean hasNext(), E next()
- ArrayList<E>: E get(int index), int size()
- You may use for-each loops.

Restrictions:
- At least one team represented by a key in teams has played at least one ranked team.
- Do not use any other Java methods or classes.
- Do not create any new data structures.
- You may use primitives.
- Do not use recursion.

/* pre: teams != null, no null key,
   none of the elements of the value lists are null,
   ranked != null, ranked.size() == 25
   post: per the problem description.
   Neither teams nor ranked is altered by this method. */`,
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
        "Inside LL314<E>, implement addIfFrequencyLessThan. Add tgt to the end of the list only if fewer than freq copies of tgt are already present. Return true if a node was added, false otherwise. For example, [A, B, C, A, B, B, X].addIfFrequencyLessThan(A, 2) returns false and leaves the list unchanged; with A, 3 it returns true and appends A; with missing value M it appends M. Do not check preconditions.",
      reference: `public class LL314<E> {
    private Node<E> first; // Stores null if this list is empty.

    private static class Node<E> {
        private E data;
        private Node<E> next; // Set to null if last node.
        public Node(E val) { data = val; } // Can use!
    }
}

Facts and restrictions:
- You may not use any other methods in LL314 unless you implement them yourself as part of your solution.
- You may not add instance or class variables to LL314.
- The list only has a reference to the first node in the chain of nodes. No size, no last.
- When the list is empty, first stores null.
- The list does not store null values.
- If the list is not empty, the last node stores null in its next variable.
- You may use the nested Node class and equals on objects.
- You may not use any other Java classes or native arrays.
- Do not create any new data structures. You may create a new Node object if necessary.
- Do not use recursion.

// pre: tgt != null, freq >= 1
// post: Per the problem description.`,
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
        "Implement canForm, a recursive backtracking helper. Determine whether dictionary can form at least one word loop with exactly goal words. The first word may be any dictionary word; each later word must start with the previous word's last character; the last word's last character must match the first word's first character. Words may not be reused. Example valid goal-5 loop: [blast, tall, lab, bad, dub]. Example invalid loop due to reuse: [pup, pip, pup, pip, pup]. Do not check preconditions.",
      reference: `Rules and restrictions:
- You may not add static variables.
- You may not add new parameters to canForm.
- The only helper method you may add is a helper that determines if the last character in one String equals the first character of another String.
- dictionary contains the valid words we can use to form the word loop.
- Do not alter dictionary in any way, not even temporarily.
- No elements of dictionary are null.
- All elements of dictionary have length() >= 2.
- Assume loop is initially empty: the original caller passes an ArrayList<String> with size() == 0.
- Assume goal >= 2. The loop must have exactly goal words.
- If a word loop can be formed, loop holds the first loop found when all calls complete.
- If no word loop can be formed, loop shall be empty when all calls complete.
- Do not create any new data structures. No new arrays, lists, maps, or sets.
- You may use String charAt(int index) and length().
- You may use ArrayList size(), get(int index), contains(E value), add(E value), remove(int index).
- You may use a for-each loop to iterate through dictionary.
- Do not use any other Java classes or methods. You can use primitive chars.`,
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
