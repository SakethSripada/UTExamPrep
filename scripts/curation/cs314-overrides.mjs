// Hand-curated fixes for parsed CS 314 exams, applied by generate-cs-archive.mjs.
//
// Shape, keyed by exam id (e.g. "cs314-2016-fall-exam-2"):
//   subtitle: replace the generated subtitle
//   questions: { [questionNumber]: {
//     replace: { ...full question object, sans id }   // use verbatim, skip parsing
//     set: { field: value, ... }                      // overwrite parsed fields
//     parts: { [label]: "new part text" }             // rewrite one lettered part
//     partAnswers: { [label]: "expected answer" }     // fix one expected answer
//   } }
//
// Diagram transcriptions (trees, graphs, hash tables) are written as prose
// descriptions in the house style ("Tree: root 7; left child 3 with left child
// 4; ...") or as fenced ``` blocks when alignment matters.

export const cs314Overrides = {
  "cs314-2011-fall-exam-1": {
    questions: {
      4: {
        set: {
          answer: `public void newDecade(Map<String, Integer> newRanks) {
    String allZeros = " ";
    for (int i = 0; i < numDecades; i++) allZeros += "0 ";
    for (String name : newRanks.keySet()) {
        NameRecord value = data.get(name);
        if (value == null) data.put(name, new NameRecord(name + allZeros + newRanks.get(name)));
        else value.addRank(newRanks.get(name));
    }
    numDecades++;
    for (String name : data.keySet()) {
        NameRecord value = data.get(name);
        if (value.numDecades() != numDecades) value.addRank(0);
    }
}`,
        },
      },
      5: {
        set: {
          answer: `public int numLessThan(E target) {
    int result = 0;
    Node<E> current = first;
    while (current != null) {
        if (current.getData().compareTo(target) < 0) result++;
        current = current.getNext();
    }
    return result;
}`,
        },
      },
    },
  },
  "cs314-2012-fall-exam-1": {
    questions: {
      3: {
        set: {
          answer: `public boolean isIntegerMultiple(MathMatrix other) {
    int magicMultiple = other.elements[0][0] / this.elements[0][0];
    int remainder = other.elements[0][0] % this.elements[0][0];
    boolean integerMultiple = remainder == 0;
    int row = 0;
    while (row < elements.length && integerMultiple) {
        int column = 0;
        while (column < elements[0].length && integerMultiple) {
            int multiple = other.elements[row][column] / elements[row][column];
            remainder = other.elements[row][column] % elements[row][column];
            integerMultiple = multiple == magicMultiple && remainder == 0;
            column++;
        }
        row++;
    }
    return integerMultiple;
}`,
        },
      },
      4: {
        set: {
          stub: `// pre: 0 < rangeSize <= MAX_RANK
// post: Per the problem description.
public ArrayList<String> inRange(int rangeSize) {

}`,
          answer: `public ArrayList<String> inRange(int rangeSize) {
    ArrayList<String> result = new ArrayList<>();
    for (NameRecord name : namesList) {
        if (name.alwaysPresent()) {
            int maximum = 0;
            int minimum = MAX_RANK + 1;
            for (int decade = 0; decade < NUM_DECADES; decade++) {
                int rank = name.getRank(decade);
                maximum = Math.max(maximum, rank);
                minimum = Math.min(minimum, rank);
            }
            if (maximum - minimum <= rangeSize) result.add(name.getName());
        }
    }
    return result;
}`,
        },
      },
    },
  },
  "cs314-2012-fall-exam-2": {
    questions: {
      3: {
        set: {
          answer: `public static String getMissingGroupingSymbols(String str) {
    Stack<Character> symbols = new Stack<>();
    for (int i = 0; i < str.length(); i++) {
        char ch = str.charAt(i);
        if (isOpening(ch)) symbols.push(ch);
        else if (symbols.isEmpty() || !matches(ch, symbols.peek())) return null;
        else symbols.pop();
    }
    String result = "";
    while (!symbols.isEmpty()) result += getMatch(symbols.pop());
    return result;
}

private static boolean matches(char close, char open) {
    return close == ']' ? open == '[' : open == '(';
}

private static boolean isOpening(char ch) { return ch == '[' || ch == '('; }
private static char getMatch(char ch) { return ch == '(' ? ')' : ']'; }`,
        },
      },
      4: {
        set: {
          answer: `public void removeRepeats() {
    if (first != null) {
        Node<E> trailer = first;
        Node<E> lead = first.getNext();
        while (lead != null) {
            if (lead.getData().equals(trailer.getData())) trailer.setNext(lead.getNext());
            else trailer = lead;
            lead = lead.getNext();
        }
    }
}`,
        },
      },
    },
  },
  "cs314-2013-spring-exam-1": {
    questions: {
      2: {
        set: {
          stub: `// pre: 0 <= start < size
// post: Return a new GenericList containing the elements from start through the end.
public GenericList<E> sublist(int start) {

}`,
        },
      },
      3: {
        set: {
          stub: `// pre: vector != null
// post: as described above
public void multiplyByVector(ArrayList<Integer> vector) {

}`,
          answer: `public void multiplyByVector(ArrayList<Integer> vector) {
    if (vector.size() == coeffs.length || vector.size() == coeffs[0].length) {
        boolean matchesRows = vector.size() == coeffs.length;
        for (int row = 0; row < coeffs.length; row++) {
            for (int column = 0; column < coeffs[0].length; column++) {
                coeffs[row][column] *= matchesRows ? vector.get(row) : vector.get(column);
            }
        }
    }
}`,
        },
      },
      4: {
        set: {
          answer: `public boolean isTrendy(int cutoff) {
    boolean result = ranks.get(0) == UNRANKED;
    if (result) {
        int index = 1;
        while (index < ranks.size() && ranks.get(index) == UNRANKED) index++;
        if (index < ranks.size()) result = ranks.get(index) <= cutoff;
    }
    return result;
}`,
        },
      },
    },
  },
  "cs314-2014-spring-exam-2": {
    questions: {
      3: {
        set: {
          answer: `public void removeBetween(E target) {
    int found = 0;
    Node<E> current = first;
    Node<E> firstOccurrence = null;
    while (current != null && found < 2) {
        if (current.getData().equals(target)) {
            found++;
            if (found == 1) firstOccurrence = current;
            else firstOccurrence.setNext(current);
        }
        current = current.getNext();
    }
}`,
        },
      },
    },
  },
  "cs314-2016-fall-exam-1": {
    questions: {
      2: {
        set: {
          answer: `public int frequency(E value) {
    int matches = 0;
    for (int index = 0; index < size; index++) {
        if (value == null && container[index] == null) {
            matches++;
        } else if (value != null && value.equals(container[index])) {
            matches++;
        }
    }
    return matches;
}`,
        },
      },
    },
  },
  "cs314-2016-fall-exam-2": {
    questions: {
      3: {
        set: {
          answer: `public int removeNum(int start, int number) {
    int removed = 0;
    if (number > 0) {
        if (start == 0) {
            while (first != null && removed < number) {
                first = first.next;
                removed++;
            }
        } else {
            Node<E> current = first;
            for (int index = 1; index < start; index++) current = current.next;
            while (current.next != null && removed < number) {
                current.next = current.next.next;
                removed++;
            }
        }
    }
    size -= removed;
    return removed;
}`,
        },
      },
    },
  },
  "cs314-2016-fall-final": {
    questions: {
      6: {
        set: {
          answer: `public static int maxCoins(int[][] coins) {
    int[][] best = new int[coins.length][coins[0].length];
    best[0][0] = coins[0][0];
    for (int column = 1; column < best[0].length; column++)
        best[0][column] = coins[0][column] + best[0][column - 1];
    for (int row = 1; row < best.length; row++)
        best[row][0] = coins[row][0] + best[row - 1][0];
    for (int row = 1; row < best.length; row++)
        for (int column = 1; column < best[0].length; column++)
            best[row][column] = coins[row][column]
                + Math.max(best[row - 1][column], best[row][column - 1]);
    return best[best.length - 1][best[0].length - 1];
}`,
        },
      },
    },
  },
  "cs314-2016-spring-exam-2": {
    questions: {
      6: {
        set: {
          answer: `public boolean isSemiperfect(int[] properDivisors, int value) {
    return semiPerfectHelper(properDivisors, 0, value);
}

private static boolean semiPerfectHelper(int[] properDivisors, int index, int target) {
    if (target == 0) return true;
    if (target < 0 || index == properDivisors.length) return false;
    return semiPerfectHelper(properDivisors, index + 1, target - properDivisors[index])
        || semiPerfectHelper(properDivisors, index + 1, target);
}`,
        },
      },
    },
  },
  "cs314-2017-fall-exam-2": {
    questions: {
      5: {
        set: {
          answer: `public static boolean canShip(int[] trucks, int[] items) {
    return canShipHelp(trucks, items, 0);
}

private static boolean canShipHelp(int[] trucks, int[] items, int index) {
    if (allZeros(trucks)) return true;
    if (index == items.length) return false;
    int item = items[index];
    for (int i = 0; i < trucks.length; i++) {
        if (trucks[i] >= item) {
            trucks[i] -= item;
            boolean solved = canShipHelp(trucks, items, index + 1);
            trucks[i] += item;
            if (solved) return true;
        }
    }
    return canShipHelp(trucks, items, index + 1);
}

private static boolean allZeros(int[] trucks) {
    for (int capacityLeft : trucks) if (capacityLeft > 0) return false;
    return true;
}`,
        },
      },
    },
  },
  "cs314-2018-fall-exam-1": {
    questions: {
      3: {
        set: {
          answer: `public boolean hasIntegerMultipleRow() {
    for (int first = 0; first < cells.length; first++) {
        for (int second = first + 1; second < cells.length; second++) {
            if (isMultiple(cells[first], cells[second]) || isMultiple(cells[second], cells[first])) {
                return true;
            }
        }
    }
    return false;
}

private static boolean isMultiple(int[] first, int[] second) {
    int multiple = second[0] / first[0];
    if (multiple == 0) return false;
    for (int index = 0; index < first.length; index++) {
        if (multiple * first[index] != second[index]) return false;
    }
    return true;
}`,
        },
      },
      4: {
        set: {
          answer: `public ArrayList<String> getSteadyNames(ArrayList<String> namesToCheck, int limit) {
    ArrayList<String> result = new ArrayList<>();
    for (String name : namesToCheck) {
        NameRecord record = myRecs.get(name);
        if (record != null) {
            boolean steady = true;
            int previous = fixRank(record.getRank(0));
            int decade = 1;
            while (steady && decade < numDecades) {
                int current = fixRank(record.getRank(decade));
                steady = Math.abs(current - previous) <= limit;
                previous = current;
                decade++;
            }
            if (steady) result.add(name);
        }
    }
    return result;
}

private static int fixRank(int rank) { return rank == 0 ? 1001 : rank; }`,
        },
      },
    },
  },
  "cs314-2017-fall-exam-1": {
    questions: {
      4: {
        set: {
          answer: `public ArrayList<String> getComebackNames() {
    ArrayList<String> result = new ArrayList<>();
    for (NameRecord record : nameRecordList)
        if (comebackName(record)) result.add(record.getName());
    return result;
}

private boolean comebackName(NameRecord record) {
    if (record.getRank(0) == 0) return false;
    int limit = record.numDecades() - 2;
    boolean threeZeros = false;
    int index = 1;
    while (!threeZeros && index < limit) {
        threeZeros = record.getRank(index) == 0
            && record.getRank(index + 1) == 0
            && record.getRank(index + 2) == 0;
        index++;
    }
    if (threeZeros)
        for (int later = index; later < record.numDecades(); later++)
            if (record.getRank(later) != 0) return true;
    return false;
}`,
        },
      },
    },
  },
  "cs314-2017-spring-exam-1": {
    questions: {
      5: {
        set: {
          answer: `public ArrayList<String> getSubstringNames(int requiredNames, int requiredRank) {
    ArrayList<String> result = new ArrayList<>();
    for (NameRecord record : names) {
        String currentName = record.getName();
        if (hasRequiredRank(record, requiredRank)
                && isPresentInRequiredNames(currentName, requiredNames))
            result.add(currentName);
    }
    return result;
}

private boolean isPresentInRequiredNames(String name, int requiredNames) {
    int count = 0;
    name = name.toLowerCase();
    int index = 0;
    while (index < names.size() && count < requiredNames) {
        String other = names.get(index).getName().toLowerCase();
        if (other.length() > name.length() && other.contains(name)) count++;
        index++;
    }
    return count == requiredNames;
}

private boolean hasRequiredRank(NameRecord record, int requiredRank) {
    for (int index = 0; index < record.numDecades(); index++) {
        int rank = record.getRank(index);
        if (rank != 0 && rank <= requiredRank) return true;
    }
    return false;
}`,
        },
      },
    },
  },
  "cs314-2017-spring-exam-2": {
    questions: {
      2: {
        set: {
          answer: `public int getNumDifferences(LinkedList314<E> other) {
    Node<E> left = first;
    Node<E> right = other.first;
    int result = 0;
    while (left != null && right != null) {
        if (left.data == null || right.data == null) {
            if (left.data != right.data) result++;
        } else if (!left.data.equals(right.data)) result++;
        left = left.next;
        right = right.next;
    }
    Node<E> remainder = left != null ? left : right;
    while (remainder != null) {
        result++;
        remainder = remainder.next;
    }
    return result;
}`,
        },
      },
    },
  },
  "cs314-2017-spring-final": {
    questions: {
      2: {
        set: {
          answer: `public LinkedList314 combine(LinkedList314 other) {
    LinkedList314 result = new LinkedList314();
    if (first == null || other.first == null) return result;
    result.first = new Node(first.data + other.first.data);
    Node left = first.next;
    Node right = other.first.next;
    Node resultNode = result.first;
    while (left != null && right != null) {
        resultNode.next = new Node(left.data + right.data);
        left = left.next;
        right = right.next;
        resultNode = resultNode.next;
    }
    return result;
}`,
        },
      },
    },
  },
  "cs314-2018-spring-exam-2": {
    questions: {
      2: {
        set: {
          answer: `public LinkedList314<E> getCopyWithoutTarget(E target) {
    LinkedList314<E> result = new LinkedList314<>();
    Node<E> source = first;
    Node<E> resultTail = null;
    while (source != null) {
        if (!source.data.equals(target)) {
            Node<E> added = new Node<>(source.data);
            if (resultTail == null) result.first = added;
            else resultTail.next = added;
            resultTail = added;
            result.size++;
        }
        source = source.next;
    }
    return result;
}`,
        },
      },
    },
  },
  "cs314-2018-spring-final": {
    questions: {
      2: {
        set: {
          answer: `public LinkedList314<E> getSubList(int startIndex, int stopIndex) {
    LinkedList314<E> result = new LinkedList314<>();
    if (startIndex == stopIndex) return result;
    Node<E> source = first;
    int position = 0;
    while (position < startIndex && source != null) {
        source = source.next;
        position++;
    }
    Node<E> resultTail = null;
    while (source != null && position < stopIndex) {
        Node<E> added = new Node<>(source.data);
        if (resultTail == null) result.first = added;
        else resultTail.next = added;
        resultTail = added;
        result.size++;
        source = source.next;
        position++;
    }
    return result;
}`,
        },
      },
    },
  },
  "cs314-2018-spring-exam-1": {
    questions: {
      2: {
        set: {
          answer: `public E mode() {
    int maxFrequency = 0;
    E result = null;
    for (int first = 0; first < size; first++) {
        int frequency = 1;
        for (int second = first + 1; second < size; second++) {
            if (con[first].equals(con[second])) frequency++;
        }
        if (frequency > maxFrequency) {
            maxFrequency = frequency;
            result = con[first];
        }
    }
    return result;
}`,
        },
      },
      3: {
        set: {
          answer: `public GenericList<E> getRevCopyWithoutValue(E value) {
    GenericList<E> result = new GenericList<>(size + 10);
    for (int index = size - 1; index >= 0; index--) {
        if (!con[index].equals(value)) {
            result.con[result.size] = con[index];
            result.size++;
        }
    }
    return result;
}`,
        },
      },
      4: {
        set: {
          answer: `public boolean isUpperBidiagonal() {
    if (myCells.length == 1 || myCells.length != myCells[0].length) return false;
    for (int row = 0; row < myCells.length; row++) {
        for (int column = 0; column < myCells[0].length; column++) {
            if (row == column || column == row + 1) {
                if (myCells[row][column] == 0) return false;
            } else if (myCells[row][column] != 0) {
                return false;
            }
        }
    }
    return true;
}`,
        },
      },
      5: {
        set: {
          answer: `public ArrayList<String> getNamesInSync(String name, int maxDiff) {
    ArrayList<String> result = new ArrayList<>();
    NameRecord target = getRecord(name);
    for (NameRecord other : names) {
        if (!other.getName().equals(name)) {
            boolean inSync = true;
            int decade = 0;
            while (inSync && decade < target.numDecades()) {
                int targetRank = target.getRank(decade) == 0 ? 1001 : target.getRank(decade);
                int otherRank = other.getRank(decade) == 0 ? 1001 : other.getRank(decade);
                inSync = Math.abs(targetRank - otherRank) <= maxDiff;
                decade++;
            }
            if (inSync) result.add(other.getName());
        }
    }
    return result;
}`,
        },
      },
    },
  },
  "cs314-2019-spring-exam-1": {
    questions: {
      2: {
        set: {
          answer: `public int removeAll(E target) {
    int index = 0;
    int removed = 0;
    while (index < size) {
        if (con[index].equals(target)) {
            remove(index);
            removed++;
        } else {
            index++;
        }
    }
    return removed;
}

private void remove(int index) {
    size--;
    for (int current = index; current < size; current++) con[current] = con[current + 1];
    con[size] = null;
}`,
        },
      },
    },
  },
  "cs314-2019-fall-exam-2": {
    questions: {
      2: {
        set: {
          answer: `public boolean listsConverge(LinkedList314<E> other) {
    if (size == 0 || other.size == 0) return false;
    int difference = size - other.size;
    Node<E> longer = first;
    Node<E> shorter = other.first;
    if (difference < 0) {
        difference = -difference;
        longer = other.first;
        shorter = first;
    }
    while (difference-- > 0) longer = longer.next;
    while (longer != null) {
        if (longer == shorter) return true;
        longer = longer.next;
        shorter = shorter.next;
    }
    return false;
}`,
        },
      },
    },
  },
  "cs314-2021-fall-exam-1": {
    questions: {
      2: {
        set: {
          answer: `public GenericList<E> getMaxList(GenericList<E> other) {
    int newSize = Math.max(size, other.size);
    E[] resultArray = (E[]) new Comparable[newSize + 10];
    int minSize = Math.min(size, other.size);
    for (int index = 0; index < minSize; index++) {
        resultArray[index] = con[index].compareTo(other.con[index]) > 0 ? con[index] : other.con[index];
    }
    E[] rest = size > other.size ? con : other.con;
    for (int index = minSize; index < newSize; index++) resultArray[index] = rest[index];
    GenericList<E> result = new GenericList<>();
    result.con = resultArray;
    result.size = newSize;
    return result;
}`,
        },
      },
      3: {
        set: {
          answer: `public int removeNotRanked(int n) {
    int originalSize = records.size();
    for (int index = records.size() - 1; index >= 0; index--)
        if (shouldRemove(records.get(index), n)) records.remove(index);
    return originalSize - records.size();
}

private boolean shouldRemove(NameRecord record, int n) {
    int start = NUM_DECADES - n;
    for (int decade = start; decade < NUM_DECADES; decade++)
        if (record.getRank(decade) != 0) return false;
    return true;
}`,
        },
      },
    },
  },
  "cs314-2023-fall-exam-1": {
    questions: {
      3: {
        set: {
          answer: `public ArrayList<String> getRareish(int cutoff, int requiredRanks) {
    ArrayList<String> result = new ArrayList<>();
    for (NameRecord record : names)
        if (isRareish(record, cutoff, requiredRanks)) result.add(record.getName());
    return result;
}

private boolean isRareish(NameRecord record, int cutoff, int requiredRanks) {
    int ranked = 0;
    for (int decade = 0; decade < record.numDecades(); decade++) {
        int rank = record.getRank(decade);
        if (rank != 0) {
            if (rank < cutoff) return false;
            ranked++;
        }
    }
    return ranked >= requiredRanks;
}`,
        },
      },
    },
  },
  "cs314-2023-spring-exam-1": {
    questions: {
      3: {
        set: {
          answer: `public ArrayList<String> outOfSync(String name, int minDiff) {
    ArrayList<String> result = new ArrayList<>();
    NameRecord target = getRecord(name);
    for (NameRecord other : names)
        if (outOfSync(target, other, minDiff)) result.add(other.getName());
    return result;
}

private boolean outOfSync(NameRecord target, NameRecord other, int minDiff) {
    for (int decade = 0; decade < target.numDecades(); decade++) {
        int targetRank = target.getRank(decade) == 0 ? 1001 : target.getRank(decade);
        int otherRank = other.getRank(decade) == 0 ? 1001 : other.getRank(decade);
        if (Math.abs(targetRank - otherRank) < minDiff) return false;
    }
    return true;
}`,
        },
      },
    },
  },
  "cs314-2024-spring-exam-1": {
    questions: {
      2: {
        set: {
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
    for (int index = position; index < size; index++) con[index] = con[index + 1];
    con[size] = null;
    return old;
}`,
        },
      },
      3: {
        set: {
          answer: `public ArrayList<String> formelyPopular(int minRank, int numUnrankedEnd) {
    ArrayList<String> result = new ArrayList<>();
    for (NameRecord record : names)
        if (meetsCriteria(record, minRank, numUnrankedEnd)) result.add(record.getName());
    return result;
}

private boolean meetsCriteria(NameRecord record, int minRank, int numUnrankedEnd) {
    int cutoffDecade = record.numDecades() - numUnrankedEnd;
    for (int decade = cutoffDecade; decade < record.numDecades(); decade++)
        if (record.getRank(decade) != 0) return false;
    for (int decade = 0; decade < cutoffDecade; decade++) {
        int rank = record.getRank(decade);
        if (rank != 0 && rank <= minRank) return true;
    }
    return false;
}`,
        },
      },
    },
  },
  "cs314-2023-fall-exam-2": {
    questions: {
      3: {
        set: {
          answer: `public int longestRun(E target) {
    int longest = 0;
    int currentRun = 0;
    Node<E> current = first;
    while (current != null) {
        if (current.data.equals(target)) {
            currentRun++;
            if (currentRun > longest) longest = currentRun;
        } else {
            currentRun = 0;
        }
        current = current.next;
    }
    return longest;
}`,
        },
      },
    },
  },
};

function addQuestionOverride(examId, questionNumber, set) {
  cs314Overrides[examId] ??= { questions: {} };
  cs314Overrides[examId].questions ??= {};
  cs314Overrides[examId].questions[questionNumber] = {
    ...(cs314Overrides[examId].questions[questionNumber] ?? {}),
    set: { ...(cs314Overrides[examId].questions[questionNumber]?.set ?? {}), ...set },
  };
}

addQuestionOverride("cs314-2012-fall-final", 5, {
  answer: `private void medianHelper(BSTNode<E> node, int[] count, E[] result) {
    if (node != null) {
        medianHelper(node.getLeft(), count, result);
        count[0]++;
        if (size % 2 == 1 && count[0] == size / 2 + 1)
            result[0] = node.getData();
        else if (size % 2 == 0 && count[0] == size / 2) {
            result[0] = node.getData();
            medianHelper(node.getRight(), count, result);
        } else if (size % 2 == 0 && count[0] == size / 2 + 1)
            result[1] = node.getData();
        else if (count[0] < size / 2)
            medianHelper(node.getRight(), count, result);
    }
}`,
});

addQuestionOverride("cs314-2013-spring-final", 5, {
  answer: `private boolean pathRuleMet() {
    return pathRuleHelp(root, blackNodesInRootToMinPath);
}

private boolean pathRuleHelp(RBNode<E> node, int blackNodesLeft) {
    if (node == null && blackNodesLeft == 0) return true;
    if (node == null || blackNodesLeft <= 0) return false;
    if (node.isBlack) blackNodesLeft--;
    return pathRuleHelp(node.left, blackNodesLeft)
        && pathRuleHelp(node.right, blackNodesLeft);
}`,
});

addQuestionOverride("cs314-2016-fall-exam-2", 5, {
  answer: `public int numNodesWithValueAndLeftChildOnly(E value) {
    return countMatching(root, value);
}

private int countMatching(BNode<E> node, E value) {
    if (node == null) return 0;
    if (node.left != null && node.right == null && value.equals(node.data))
        return 1 + countMatching(node.left, value);
    return countMatching(node.left, value) + countMatching(node.right, value);
}`,
});

addQuestionOverride("cs314-2016-fall-final", 3, {
  answer: `public IntTree getCombinedTrees(IntTree other) {
    IntTree result = new IntTree();
    result.root = combineNodes(root, other.root);
    return result;
}

private BNode combineNodes(BNode thisNode, BNode otherNode) {
    if (thisNode == null && otherNode == null) return null;
    BNode result = new BNode();
    if (otherNode == null) {
        result.value = result.data = result.val = 1;
        result.left = combineNodes(thisNode.left, null);
        result.right = combineNodes(thisNode.right, null);
    } else if (thisNode == null) {
        result.value = result.data = result.val = 2;
        result.left = combineNodes(null, otherNode.left);
        result.right = combineNodes(null, otherNode.right);
    } else {
        result.value = result.data = result.val = 3;
        result.left = combineNodes(thisNode.left, otherNode.left);
        result.right = combineNodes(thisNode.right, otherNode.right);
    }
    return result;
}`,
});

addQuestionOverride("cs314-2017-spring-final", 4, {
  answer: `public void makeFull() {
    root = makeFull(root);
}

private BNode makeFull(BNode node) {
    if (node == null || (node.left == null && node.right == null)) return node;
    node.left = makeFull(node.left);
    node.right = makeFull(node.right);
    if (node.left != null && node.right != null) return node;
    return node.left != null ? node.left : node.right;
}`,
});

addQuestionOverride("cs314-2019-fall-exam-2", 4, {
  answer: `public int numNodeAndChildrenEqualValue(int target) {
    return matchingSums(root, target);
}

private int matchingSums(BNode node, int target) {
    if (node == null) return 0;
    int sum = node.data;
    if (node.left != null) sum += node.left.data;
    if (node.right != null) sum += node.right.data;
    int result = sum == target ? 1 : 0;
    return result + matchingSums(node.left, target) + matchingSums(node.right, target);
}`,
});

addQuestionOverride("cs314-2019-spring-final", 4, {
  answer: `public int numDifferences(BinaryTree other) {
    return countDifferences(root, other.root);
}

private int countDifferences(BNode left, BNode right) {
    if (left == null && right == null) return 0;
    if (left != null && right != null)
        return countDifferences(left.left, right.left) + countDifferences(left.right, right.right);
    if (left == null)
        return 1 + countDifferences(null, right.left) + countDifferences(null, right.right);
    return 1 + countDifferences(left.left, null) + countDifferences(left.right, null);
}`,
});

addQuestionOverride("cs314-2023-fall-exam-3", 2, {
  answer: `public int deepestDepth(E target) {
    return deepestDepth(root, 0, target);
}

private int deepestDepth(BNode<E> node, int depth, E target) {
    if (node == null) return -1;
    int here = target.equals(node.data) ? depth : -1;
    return Math.max(here, Math.max(
        deepestDepth(node.left, depth + 1, target),
        deepestDepth(node.right, depth + 1, target)));
}`,
});

addQuestionOverride("cs314-2024-spring-exam-3", 2, {
  answer: `public int count(E target, int minDepth) {
    return count(root, target, 0, minDepth);
}

private int count(BNode<E> node, E target, int depth, int minDepth) {
    if (node == null) return 0;
    int result = depth >= minDepth && node.left != null && node.right != null
        && node.data.equals(target) ? 1 : 0;
    return result + count(node.left, target, depth + 1, minDepth)
        + count(node.right, target, depth + 1, minDepth);
}`,
});

addQuestionOverride("cs314-2011-fall-final", 3, {
  answer: `public boolean partOfCycle(String start) {
    if (!containsVertex(start)) throw new IllegalArgumentException("No vertex named " + start);
    clearAll();
    Queue<Vertex> toVisit = new LinkedList<>();
    Vertex startVertex = vertices.get(start);
    for (Edge edge : startVertex.adjacent) toVisit.add(edge.dest);
    while (!toVisit.isEmpty()) {
        Vertex current = toVisit.remove();
        if (current.name.equals(start)) return true;
        if (current.scratch == 0) {
            current.scratch = 1;
            for (Edge edge : current.adjacent) toVisit.add(edge.dest);
        }
    }
    return false;
}`,
});

addQuestionOverride("cs314-2012-fall-final", 3, {
  answer: `public boolean partOfCycle(String start) {
    if (!containsVertex(start)) throw new IllegalArgumentException("No vertex named " + start);
    clearAll();
    Queue<Vertex> toVisit = new LinkedList<>();
    for (Edge edge : vertices.get(start).adjacent) toVisit.add(edge.dest);
    while (!toVisit.isEmpty()) {
        Vertex current = toVisit.remove();
        if (current.name.equals(start)) return true;
        if (current.scratch == 0) {
            current.scratch = 1;
            for (Edge edge : current.adjacent) toVisit.add(edge.dest);
        }
    }
    return false;
}`,
});

addQuestionOverride("cs314-2013-spring-final", 6, {
  answer: `private boolean helper(String currentVertex, int verticesVisited) {
    Vertex current = vertices.get(currentVertex);
    if (current.scratch == 1) return false;
    verticesVisited++;
    current.scratch = 1;
    if (verticesVisited == vertices.size()) return true;
    for (Edge edge : current.adjacent)
        if (helper(edge.dest.name, verticesVisited)) return true;
    current.scratch = 0;
    return false;
}`,
});

addQuestionOverride("cs314-2014-spring-final", 5, {
  stub: `// post: Per the problem description.
private boolean connectedHelper(Vertex currentVertex, int[] numVisited) {

}`,
});

addQuestionOverride("cs314-2016-spring-final", 6, {
  answer: `public ArrayList<String> getToposort() {
    updateIndegree();
    ArrayList<String> result = new ArrayList<>();
    Queue<Vertex> zeroIndegree = new LinkedList<>();
    for (Vertex vertex : vertices.values()) if (vertex.scratch == 0) zeroIndegree.add(vertex);
    while (!zeroIndegree.isEmpty()) {
        Vertex current = zeroIndegree.remove();
        result.add(current.name);
        for (Edge edge : current.adjacent) {
            edge.dest.scratch--;
            if (edge.dest.scratch == 0) zeroIndegree.add(edge.dest);
        }
    }
    return result;
}`,
});

addQuestionOverride("cs314-2017-fall-final", 5, {
  answer: `public double dfsPathCost(String start, String dest) {
    if (!vertices.containsKey(start) || !vertices.containsKey(dest)) return -1;
    clearAll();
    return dfsPathCost(vertices.get(start), dest);
}

private double dfsPathCost(Vertex current, String dest) {
    if (current.name.equals(dest)) return 0;
    if (current.scratch == 1) return -1;
    current.scratch = 1;
    for (Edge edge : current.adjacent) {
        double result = dfsPathCost(edge.dest, dest);
        if (result != -1) return result + edge.cost;
    }
    return -1;
}`,
});

addQuestionOverride("cs314-2017-spring-final", 6, {
  answer: `public boolean formsAClique(Set<String> names) {
    for (String name : names) {
        Vertex vertex = vertices.get(name);
        int count = 0;
        for (Edge edge : vertex.adjacent) if (names.contains(edge.dest.name)) count++;
        if (count != names.size() - 1) return false;
    }
    return true;
}`,
});

addQuestionOverride("cs314-2021-fall-exam-3", 4, {
  stub: `// pre: requiredHubs > 0, factor > 1.0.
// post: per the problem description.
public boolean hasRequiredHubs(int requiredHubs, double factor) {

}`,
  answer: `public boolean hasRequiredHubs(int requiredHubs, double factor) {
    int totalEdges = 0;
    for (Vertex vertex : vertices.values()) totalEdges += vertex.adjacent.size();
    double threshold = (1.0 * totalEdges / vertices.size()) * factor;
    int hubs = 0;
    for (Vertex vertex : vertices.values())
        if (vertex.adjacent.size() >= threshold && ++hubs == requiredHubs) return true;
    return false;
}`,
});

addQuestionOverride("cs314-2024-spring-exam-3", 4, {
  answer: `private boolean helper(String currentVertexName, int verticesInPath) {
    Vertex current = vertices.get(currentVertexName);
    if (current.scratch == 1) return false;
    current.scratch = 1;
    verticesInPath++;
    if (verticesInPath == vertices.size()) return true;
    for (Edge edge : current.adjacent)
        if (helper(edge.dest.name, verticesInPath)) return true;
    current.scratch = 0;
    return false;
}`,
});

addQuestionOverride("cs314-2011-fall-exam-2", 3, {
  answer: `public boolean add(E value) {
    if (first == null || value.compareTo(first.getData()) < 0) {
        first = new Node<>(value, first);
        return true;
    }
    Node<E> lead = first.getNext();
    Node<E> trail = first;
    while (lead != null) {
        int difference = value.compareTo(lead.getData());
        if (difference == 0) return false;
        if (difference < 0) {
            trail.setNext(new Node<>(value, lead));
            return true;
        }
        trail = lead;
        lead = lead.getNext();
    }
    trail.setNext(new Node<>(value, null));
    return true;
}`,
});

addQuestionOverride("cs314-2016-spring-final", 3, {
  answer: `public int remove(int value) {
    int removed = 0;
    IntNode lead = first;
    IntNode trailer = null;
    while (lead != null && lead.value <= value) {
        if (lead.value == value) removed++;
        if (removed == 0) trailer = lead;
        lead = lead.next;
    }
    if (removed != 0) {
        if (trailer == null) first = lead;
        else trailer.next = lead;
        size -= removed;
    }
    return removed;
}`,
});

addQuestionOverride("cs314-2018-fall-exam-2", 4, {
  answer: `public boolean removeFirstOccurrenceStartingAt(int start, E target) {
    Node<E> current = header;
    int index = 0;
    while (index < start && current.next != null) {
        index++;
        current = current.next;
    }
    while (current.next != null) {
        if (current.next.data.equals(target)) {
            current.next = current.next.next;
            size--;
            return true;
        }
        current = current.next;
    }
    return false;
}`,
});

addQuestionOverride("cs314-2019-spring-exam-2", 3, {
  answer: `public LinkedIntList combineIgnoreValue(LinkedIntList other, int target) {
    LinkedIntList result = new LinkedIntList();
    IntNode left = first;
    IntNode right = other.first;
    IntNode resultTail = null;
    while (left != null && right != null) {
        if (left.data != target && right.data != target)
            resultTail = add(result, resultTail, left.data + right.data);
        left = left.next;
        right = right.next;
    }
    IntNode remainder = left != null ? left : right;
    while (remainder != null) {
        if (remainder.data != target) resultTail = add(result, resultTail, remainder.data);
        remainder = remainder.next;
    }
    return result;
}

private IntNode add(LinkedIntList list, IntNode last, int value) {
    IntNode node = new IntNode(value);
    if (last == null) list.first = node;
    else last.next = node;
    list.size++;
    return node;
}`,
});

addQuestionOverride("cs314-2019-spring-final", 3, {
  answer: `public int placeBetween(E firstValue, E secondValue, E value) {
    Node<E> current = header.next;
    int count = 0;
    while (current.next != header) {
        if (current.data.equals(firstValue) && current.next.data.equals(secondValue)) {
            Node<E> node = new Node<>(value);
            node.prev = current;
            node.next = current.next;
            current.next.prev = node;
            current.next = node;
            current = node;
            count++;
            size++;
        }
        current = current.next;
    }
    return count;
}`,
});

addQuestionOverride("cs314-2015-spring-exam-2", 4, {
  answer: `public static TreeSet<Integer> getMostSolvedProblems(Map<String, Set<Integer>> solved) {
    HashMap<Integer, Integer> frequencies = new HashMap<>();
    for (Set<Integer> problems : solved.values())
        for (int problem : problems)
            frequencies.put(problem, frequencies.getOrDefault(problem, 0) + 1);
    int maximum = 0;
    for (int frequency : frequencies.values()) maximum = Math.max(maximum, frequency);
    TreeSet<Integer> result = new TreeSet<>();
    for (int problem : frequencies.keySet())
        if (frequencies.get(problem) == maximum) result.add(problem);
    return result;
}`,
});

addQuestionOverride("cs314-2016-spring-final", 2, {
  answer: `public static <E extends Comparable<E>> boolean isDescending(Stack<E> stack) {
    Stack<E> temporary = new Stack<>();
    boolean descending = true;
    if (!stack.isEmpty()) {
        temporary.push(stack.pop());
        while (descending && !stack.isEmpty()) {
            E current = stack.pop();
            descending = current.compareTo(temporary.top()) <= 0;
            temporary.push(current);
        }
        while (!temporary.isEmpty()) stack.push(temporary.pop());
    }
    return descending;
}`,
});

addQuestionOverride("cs314-2017-spring-exam-2", 4, {
  answer: `public static void removePointsHalfAverageDistance(Map<String, Point> points, String target) {
    Point center = points.get(target);
    if (center == null) return;
    double total = 0.0;
    for (Point point : points.values()) total += center.distance(point);
    double halfAverage = total / (points.size() - 1) / 2;
    Iterator<String> iterator = points.keySet().iterator();
    while (iterator.hasNext()) {
        String key = iterator.next();
        if (!key.equals(target) && center.distance(points.get(key)) < halfAverage) iterator.remove();
    }
}`,
});

addQuestionOverride("cs314-2022-spring-exam-2", 5, {
  answer: `public static boolean knightCanReach(int rows, Position knight, Position target, int numMoves) {
    if (knight.row == target.row && knight.col == target.col) return true;
    if (numMoves == 0) return false;
    for (int[] deltas : KNIGHT_DIRECTIONS) {
        int newRow = knight.row + deltas[0];
        int newCol = knight.col + deltas[1];
        if (0 <= newRow && newRow < rows && 0 <= newCol && newCol < rows
                && knightCanReach(rows, new Position(newRow, newCol), target, numMoves - 1))
            return true;
    }
    return false;
}`,
});

addQuestionOverride("cs314-2012-fall-exam-2", 5, {
  answer: `public boolean isPresent(String word, int row, int col) {
    if (word.length() == 0) return true;
    if (!inbounds(row, col) || theBoard[row][col] != word.charAt(0)) return false;
    char oldCharacter = theBoard[row][col];
    theBoard[row][col] = '*';
    String remaining = word.substring(1);
    for (int nextRow = row - 1; nextRow <= row + 1; nextRow++) {
        for (int nextColumn = col - 1; nextColumn <= col + 1; nextColumn++) {
            if ((nextRow != row || nextColumn != col) && isPresent(remaining, nextRow, nextColumn)) {
                theBoard[row][col] = oldCharacter;
                return true;
            }
        }
    }
    theBoard[row][col] = oldCharacter;
    return false;
}`,
});

addQuestionOverride("cs314-2023-fall-exam-2", 4, {
  answer: `public static void update(int row, int col) {
    if (0 <= row && row < numMines.length && 0 <= col && col < numMines[0].length
            && !revealed[row][col]) {
        revealed[row][col] = true;
        if (numMines[row][col] == MINE) gameOver = true;
        else if (numMines[row][col] == 0)
            for (int nextRow = row - 1; nextRow <= row + 1; nextRow++)
                for (int nextColumn = col - 1; nextColumn <= col + 1; nextColumn++)
                    update(nextRow, nextColumn);
    }
}`,
});

addQuestionOverride("cs314-2018-spring-exam-2", 5, {
  answer: `public static boolean canSchedule(String[][] tas, String[][] sections) {
    return schedule(tas, sections, 0);
}

private static boolean schedule(String[][] tas, String[][] sections, int index) {
    if (index == tas.length) return true;
    for (int time = 1; time < tas[index].length; time++) {
        for (int section = 0; section < sections.length; section++) {
            if (tas[index][time].equals(sections[section][0]) && sections[section][1] == null) {
                sections[section][1] = tas[index][0];
                if (schedule(tas, sections, index + 1)) return true;
                sections[section][1] = null;
            }
        }
    }
    return false;
}`,
});

addQuestionOverride("cs314-2019-spring-exam-2", 6, {
  answer: `private int help(int start, int dest, TNode node, int distanceFromStart) {
    if (node == null) return -1;
    if (node.data == dest) return distanceFromStart == -1 ? -2 : distanceFromStart;
    if (node.children != null) {
        int newDistance = node.data == start || distanceFromStart >= 0 ? distanceFromStart + 1 : -1;
        for (TNode child : node.children) {
            int result = help(start, dest, child, newDistance);
            if (result == -2 || result >= 0) return result;
        }
    }
    return -1;
}`,
});

addQuestionOverride("cs314-2024-spring-exam-2", 4, {
  answer: `private static boolean help(Airline origin, Airline destination, Set<Airline> tried) {
    if (origin.equals(destination)) return true;
    if (!tried.add(origin)) return false;
    for (Airline partner : origin.getPartners())
        if (help(partner, destination, tried)) return true;
    return false;
}`,
});

addQuestionOverride("cs314-2021-fall-exam-1", 4, {
  answer: `public void removeAll(Object[] keys) {
    for (Object key : keys) {
        int index = 0;
        while (index < size) {
            if (kvPairs[0][index].equals(key)) {
                size--;
                kvPairs[0][index] = kvPairs[0][size];
                kvPairs[1][index] = kvPairs[1][size];
                kvPairs[0][size] = null;
                kvPairs[1][size] = null;
                break;
            }
            index++;
        }
    }
}`,
});

addQuestionOverride("cs314-2023-spring-exam-1", 4, {
  stub: `/* pre: key != null. post: per the problem description. */
public V remove(K key) {

}`,
  answer: `public V remove(K key) {
    for (int index = 0; index < con.length; index++) {
        if (con[index] != null && con[index].key.equals(key)) {
            V result = con[index].value;
            con[index] = null;
            size--;
            return result;
        }
    }
    return null;
}`,
});

addQuestionOverride("cs314-2013-spring-exam-1", 5, {
  answer: `public boolean removeSingleOccurrence(Object target) {
    for (int index = 0; index < numberOfElements; index++) {
        if (target.equals(elements[index])) {
            numberOfElements--;
            elements[index] = elements[numberOfElements];
            elements[numberOfElements] = null;
            size = numberOfElements;
            return true;
        }
    }
    return false;
}`,
});

addQuestionOverride("cs314-2022-spring-exam-1", 4, {
  answer: `public int removeAll(ArraySet<E> other) {
    int originalSize = size;
    for (int otherIndex = 0; otherIndex < other.size; otherIndex++) {
        E target = other.con[otherIndex];
        int index = 0;
        while (index < size) {
            if (con[index].equals(target)) {
                size--;
                con[index] = con[size];
                con[size] = null;
                break;
            }
            index++;
        }
    }
    return originalSize - size;
}`,
});

addQuestionOverride("cs314-2015-spring-final", 5, {
  answer: `public void decreaseElement(int element, int amount) {
    int index = 1;
    while (index <= size && con[index] != element) index++;
    if (index <= size) {
        con[index] -= amount;
        while (index > 1 && con[index] < con[index / 2]) {
            int temporary = con[index];
            con[index] = con[index / 2];
            con[index / 2] = temporary;
            index /= 2;
        }
    }
}`,
});

addQuestionOverride("cs314-2018-spring-final", 6, {
  answer: `public void add(E value) {
    size++;
    if (size == con.length) resize();
    int child = size;
    int parent = (child + 1) / 3;
    while (child > 1 && value.compareTo(con[parent]) > 0) {
        con[child] = con[parent];
        child = parent;
        parent = (child + 1) / 3;
    }
    con[child] = value;
}`,
});

addQuestionOverride("cs314-2017-fall-final", 6, {
  stub: `// post: Per the problem description.
public static int bitsSaved(BitInputStream in) {

}`,
});

addQuestionOverride("cs314-2018-fall-final", 5, {
  answer: `public ArrayList<Integer> writeFile(BitInputStream in, BitOutputStream out) throws IOException {
    ArrayList<Integer> result = new ArrayList<>();
    int chunkSize = in.readBits(6) + 1;
    int numChunks = in.readBits(32);
    for (int chunk = 0; chunk < numChunks; chunk++) {
        int ones = 0;
        for (int bitIndex = 0; bitIndex < chunkSize; bitIndex++) {
            int bit = in.readBits(1);
            out.writeBits(1, bit);
            ones += bit;
        }
        ones += in.readBits(1);
        if (ones % 2 != 0) result.add(chunk);
    }
    return result;
}`,
});

addQuestionOverride("cs314-2018-spring-final", 5, {
  answer: `public int decodeTriplets(BitInputStream in, BitOutputStream out) {
    int[] bitmap = {0, 0, 0, 1, 0, 1, 1, 1};
    int errors = 0;
    int bits = in.readBits(3);
    while (bits != -1) {
        out.writeBits(1, bitmap[bits]);
        if (bits != 0 && bits != 7) errors++;
        bits = in.readBits(3);
    }
    return errors;
}`,
});

const completeHuffmanAnswer = `private boolean completeHelper(HuffNode node) {
    if (node == null) return true;
    if (node.left == null && node.right == null) return true;
    if (node.left != null && node.right != null)
        return completeHelper(node.left) && completeHelper(node.right);
    return false;
}`;
addQuestionOverride("cs314-2011-fall-final", 2, { answer: completeHuffmanAnswer });
addQuestionOverride("cs314-2012-fall-final", 2, { answer: completeHuffmanAnswer });

addQuestionOverride("cs314-2016-fall-final", 4, {
  answer: `public HuffmanTree(Map<Integer, String> codes) {
    root = new TreeNode();
    for (int leafValue : codes.keySet()) {
        String code = codes.get(leafValue);
        TreeNode current = root;
        for (int index = 0; index < code.length(); index++) {
            if (code.charAt(index) == '0') {
                if (current.left == null) current.left = new TreeNode();
                current = current.left;
            } else {
                if (current.right == null) current.right = new TreeNode();
                current = current.right;
            }
        }
        current.value = leafValue;
    }
}`,
});

addQuestionOverride("cs314-2022-spring-exam-3", 4, {
  answer: `public HuffmanCodeTree(String[][] codes) {
    root = new TreeNode(-1, -1);
    numLeaves = codes.length;
    for (String[] row : codes) {
        int value = Integer.parseInt(row[0]);
        TreeNode current = root;
        for (int index = 0; index < row[1].length(); index++) {
            if (row[1].charAt(index) == '0') {
                if (current.left == null) current.left = new TreeNode(-1, -1);
                current = current.left;
            } else {
                if (current.right == null) current.right = new TreeNode(-1, -1);
                current = current.right;
            }
        }
        current.value = value;
    }
}`,
});

addQuestionOverride("cs314-2024-spring-exam-3", 3, {
  answer: `public String decode(String encoded) {
    if (encoded.charAt(0) == '*' || encoded.charAt(encoded.length() - 1) != '*') return null;
    String result = "";
    MNode current = root;
    for (int index = 0; index < encoded.length(); index++) {
        char symbol = encoded.charAt(index);
        if (symbol == '*') {
            result += current.letter;
            current = root;
        } else if (symbol == '.') current = current.left;
        else if (symbol == '-') current = current.right;
        else return null;
        if (current == null) return null;
    }
    return result;
}`,
});

addQuestionOverride("cs314-2013-spring-exam-2", 2, {
  answer: `public int countUnrankedNames(int n) {
    int count = 0;
    int startDecade = NUM_DECADES - n;
    for (NameRecord record : data.values()) {
        boolean allUnranked = true;
        int decade = startDecade;
        while (decade < NUM_DECADES && allUnranked) {
            allUnranked = record.getRank(decade) == NameRecord.UNRANKED;
            decade++;
        }
        if (allUnranked) count++;
    }
    return count;
}`,
});

addQuestionOverride("cs314-2013-spring-final", 4, {
  answer: `public boolean remove(E target) {
    int index = Math.abs(target.hashCode()) % con.length;
    int checked = 0;
    while (con[index] != null && checked < con.length) {
        if (target.equals(con[index])) {
            con[index] = (E) EMPTY;
            size--;
            return true;
        }
        index = (index + 1) % con.length;
        checked++;
    }
    return false;
}`,
});

addQuestionOverride("cs314-2017-spring-final", 5, {
  answer: `public boolean remove(E value) {
    int oldSize = size;
    int index = Math.abs(value.hashCode() % con.length);
    if (con[index] != null) {
        if (con[index].data.equals(value)) {
            size--;
            con[index] = con[index].next;
        } else {
            Node<E> current = con[index];
            while (current.next != null && size == oldSize) {
                if (value.equals(current.next.data)) {
                    size--;
                    current.next = current.next.next;
                } else current = current.next;
            }
        }
    }
    return oldSize != size;
}`,
});

// The PDF layout placed later inheritance examples into these programming
// questions. Restore the method stubs and suggested solutions from the keyed
// solution pages before generating runnable harnesses.
addQuestionOverride("cs314-2016-fall-exam-1", 6, {
  stub: `public E remove(int pos) {

}`,
  answer: `public E remove(int pos) {
    int index = 0;
    while (index < elementsStored && values[index].getPosition() < pos) index++;
    boolean explicit = index < elementsStored && values[index].getPosition() == pos;
    E result = explicit ? values[index].getData() : defaultValue;
    for (int i = index; i < elementsStored; i++)
        values[i].setPosition(values[i].getPosition() - 1);
    if (explicit) {
        elementsStored--;
        for (int i = index; i < elementsStored; i++) values[i] = values[i + 1];
        values[elementsStored] = null;
    }
    sizeOfList--;
    return result;
}`,
});

addQuestionOverride("cs314-2018-spring-exam-1", 6, {
  answer: `public ArrayList<E> getExplicitList() {
    ArrayList<E> result = new ArrayList<>();
    int explicitIndex = 0;
    for (int position = 0; position < sizeOfList; position++) {
        if (explicitIndex < elementsStored && values[explicitIndex].getPosition() == position) {
            result.add(values[explicitIndex].getData());
            explicitIndex++;
        } else result.add(defaultValue);
    }
    return result;
}`,
});

addQuestionOverride("cs314-2013-spring-final", 2, {
  answer: `public UnsortedSet(ArrayList<E> init) {
    con = new ArrayList<>(init);
    int index = 0;
    while (index < con.size()) {
        E current = con.get(index);
        int earlier = 0;
        while (earlier < index && !current.equals(con.get(earlier))) earlier++;
        if (earlier < index) con.remove(index);
        else index++;
    }
}`,
});

addQuestionOverride("cs314-2014-spring-final", 6, {
  stub: `public E dequeue() {

}`,
  answer: `public E dequeue() {
    if (root == null) return null;
    if (root.left == null) {
        E result = root.data;
        root = root.right;
        return result;
    }
    BSTNode<E> parent = root;
    while (parent.left.left != null) parent = parent.left;
    E result = parent.left.data;
    parent.left = parent.left.right;
    return result;
}`,
});

addQuestionOverride("cs314-2011-fall-exam-2", 4, {
  stub: `public FuzzySet<E> getFuzzyIntersection(FuzzySet<E> other) {

}`,
  answer: `public FuzzySet<E> getFuzzyIntersection(FuzzySet<E> other) {
    FuzzySet<E> result = new FuzzySet<>();
    Iterator<SetPair<E>> first = iterator();
    while (first.hasNext()) {
        SetPair<E> left = first.next();
        Iterator<SetPair<E>> second = other.iterator();
        boolean found = false;
        while (!found && second.hasNext()) {
            SetPair<E> right = second.next();
            if (left.getElem().equals(right.getElem())) {
                result.add(new SetPair<>(left.getElem(), left.getDegree() * right.getDegree()));
                found = true;
            }
        }
    }
    return result;
}`,
});

addQuestionOverride("cs314-2013-spring-exam-2", 4, {
  answer: `public double getAveDistanceFromFront(Queue<Object> q, Object target) {
    double positionSum = 0;
    int matches = 0;
    int position = 0;
    Queue<Object> temporary = new Queue<>();
    while (!q.isEmpty()) {
        Object value = q.dequeue();
        if (target.equals(value)) {
            matches++;
            positionSum += position;
        }
        position++;
        temporary.enqueue(value);
    }
    while (!temporary.isEmpty()) q.enqueue(temporary.dequeue());
    return matches == 0 ? -1 : positionSum / matches;
}`,
});

addQuestionOverride("cs314-2021-fall-exam-3", 5, {
  answer: `public void add(String value) {
    Node lead = FIRST;
    Node trailer = lead;
    int carry = 0;
    for (int i = value.length() - 1; i >= 0; i--) {
        int digit = value.charAt(i) - '0';
        carry = addVal(lead, carry + digit);
        if (lead.next == null) lead.next = new Node(0);
        trailer = lead;
        lead = lead.next;
    }
    while (carry == 1) {
        carry = addVal(lead, carry);
        if (lead.next == null) lead.next = new Node(0);
        trailer = lead;
        lead = lead.next;
    }
    if (carry == 0) trailer.next = null;
}

private int addVal(Node node, int value) {
    node.digit += value;
    int carry = node.digit / 10;
    node.digit %= 10;
    return carry;
}`,
});

addQuestionOverride("cs314-2019-spring-exam-1", 4, {
  answer: `public static Map<String, Integer> getSemanticDescriptor(Scanner scanner, String word) {
    String target = " " + word + " ";
    HashMap<String, Integer> result = new HashMap<>();
    while (scanner.hasNextLine()) {
        String sentence = scanner.nextLine();
        if (sentence.contains(target)) {
            Scanner words = new Scanner(sentence);
            while (words.hasNext()) {
                String current = words.next();
                if (!current.equals(word)) {
                    Integer count = result.get(current);
                    result.put(current, count == null ? 1 : count + 1);
                }
            }
        }
    }
    return result;
}`,
});

addQuestionOverride("cs314-2016-fall-exam-2", 6, {
  answer: `public boolean canBeSolved(Board board) {
    if (board.numMarblesOnBoard() == 1) return true;
    Move[] moves = board.getMoves();
    for (Move move : moves) {
        board.removeMarble(move.sourceRow(), move.sourceCol());
        board.removeMarble(move.removedRow(), move.removedCol());
        board.placeMarble(move.destRow(), move.destCol());
        if (canBeSolved(board)) return true;
        board.placeMarble(move.sourceRow(), move.sourceCol());
        board.placeMarble(move.removedRow(), move.removedCol());
        board.removeMarble(move.destRow(), move.destCol());
    }
    return false;
}`,
});

addQuestionOverride("cs314-2018-fall-final", 6, {
  answer: `public List<String> getWords(String prefix) {
    List<String> result = new ArrayList<>();
    TNode start = getNodeForPrefix(prefix);
    if (start != null) getWords(start, result, prefix);
    return result;
}

private void getWords(TNode node, List<String> result, String word) {
    if (node.word) result.add(word);
    if (node.children != null)
        for (TNode child : node.children) getWords(child, result, word + child.ch);
}`,
});

addQuestionOverride("cs314-2018-spring-final", 4, {
  answer: `public boolean putIfAbsent(K key, V value) {
    if ((double) size / con.length >= LOAD_LIMIT) resize();
    int index = Math.abs(key.hashCode() % con.length);
    int addIndex = -1;
    while (con[index] != null) {
        if (con[index] == EMPTY) {
            if (addIndex == -1) addIndex = index;
        } else if (key.equals(con[index].key)) return false;
        index = (index + 1) % con.length;
    }
    if (addIndex == -1) addIndex = index;
    con[addIndex] = new Pair<>(key, value);
    size++;
    return true;
}`,
});

addQuestionOverride("cs314-2019-spring-final", 5, {
  answer: `public void decode(BitInputStream input, BitOutputStream output) {
    int numBits = 0;
    int encodedValue = 0;
    boolean reading = true;
    while (reading) {
        encodedValue = encodedValue * 2 + input.readBits(1);
        numBits++;
        for (HuffCode code : codes) {
            if (numBits == code.numBits && encodedValue == code.encodeVal) {
                numBits = 0;
                encodedValue = 0;
                if (code.decodeVal == PEOF) reading = false;
                else output.writeBits(BPW, code.decodeVal);
                break;
            }
        }
    }
}`,
});

const hashIteratorStub = `private class HashIterator implements Iterator<E> {
    private boolean removeOK;
    // add the remaining state and complete this iterator
}`;
const hashIteratorAnswer = `private class HashIterator implements Iterator<E> {
    private boolean removeOK;
    private int index;
    private int numReturned;
    private final int maxReturn;

    private HashIterator() {
        maxReturn = size;
        index = -1;
    }

    public boolean hasNext() { return numReturned < maxReturn; }

    public E next() {
        if (!hasNext()) throw new NoSuchElementException();
        index++;
        while (con[index] == null || con[index] == EMPTY) index++;
        removeOK = true;
        numReturned++;
        return con[index];
    }

    public void remove() {
        if (!removeOK) throw new IllegalStateException();
        removeOK = false;
        size--;
        con[index] = (E) EMPTY;
    }
}`;
addQuestionOverride("cs314-2011-fall-final", 4, { stub: hashIteratorStub, answer: hashIteratorAnswer });
addQuestionOverride("cs314-2012-fall-final", 4, { stub: hashIteratorStub, answer: hashIteratorAnswer });

addQuestionOverride("cs314-2016-fall-final", 5, {
  stub: `private double help(Vertex current, String goal) {

}`,
});

addQuestionOverride("cs314-2011-fall-exam-2", 5, {
  answer: `public ArrayList<Die> solvePuzzle(Die[] dice) {
    ArrayList<Die> result = new ArrayList<>();
    solve(dice, 0, '?', result);
    return result;
}

private boolean solve(Die[] dice, int position, char previousRight, ArrayList<Die> result) {
    if (position == dice.length) return true;
    Die die = dice[position];
    result.add(die);
    for (int side = 0; side < 6; side++) {
        die.positionLeftFace(side);
        if (position == 0 || previousRight == die.getColor(side)) {
            if (solve(dice, position + 1, die.getColorOppositeSide(side), result)) return true;
        }
    }
    result.remove(result.size() - 1);
    return false;
}`,
});

addQuestionOverride("cs314-2016-spring-exam-1", 4, {
  stub: `public void add(Object value) {

}`,
});

addQuestionOverride("cs314-2017-fall-exam-1", 5, {
  stub: `public Map<String, int[]> getStats(String[] schools, boolean[] results) {

}`,
  answer: `public Map<String, int[]> getStats(String[] schools, boolean[] results) {
    HashMap<String, int[]> result = new HashMap<>();
    for (int i = 0; i < schools.length; i++) {
        int[] stats = result.get(schools[i]);
        if (stats == null) {
            stats = new int[2];
            result.put(schools[i], stats);
        }
        stats[1]++;
        if (results[i]) stats[0]++;
    }
    return result;
}`,
});

addQuestionOverride("cs314-2017-spring-exam-1", 6, {
  stub: `public void setNonZeroValue(int row, int col, int val) {

}`,
});

addQuestionOverride("cs314-2019-fall-exam-1", 5, {
  stub: `public void removeFirstN(int n) {

}`,
});

addQuestionOverride("cs314-2023-fall-exam-1", 4, {
  stub: `public void remove(int pos) {

}`,
  answer: `public void remove(int pos) {
    int index = 0;
    int elementCount = con[0].runLength;
    while (pos > elementCount - 1) {
        index++;
        elementCount += con[index].runLength;
    }
    con[index].runLength--;
    size--;
    if (con[index].runLength == 0) {
        numRuns--;
        for (int i = index; i < numRuns; i++) con[i] = con[i + 1];
        con[numRuns] = null;
    }
}`,
});

addQuestionOverride("cs314-2024-spring-exam-1", 4, {
  stub: `public boolean isSubset(MultiSet<E> other) {

}`,
  answer: `public boolean isSubset(MultiSet<E> other) {
    for (int i = 0; i < other.numDistinct; i++) {
        E element = other.con[i].element;
        int index = find(element);
        if (index == -1 || con[index].frequency < other.con[i].frequency) return false;
    }
    return true;
}

private int find(E target) {
    for (int i = 0; i < numDistinct; i++)
        if (con[i].element.equals(target)) return i;
    return -1;
}`,
});
