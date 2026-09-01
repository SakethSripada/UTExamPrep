#!/usr/bin/env node

// Generates executable, answer-key-oracle harnesses for archived CS 314
// programming questions. Each harness runs the student method and the official
// solution against identical fixtures and compares return values plus mutated
// receiver/argument state. A harness is emitted only after the official answer
// compiles and passes it; mutation gates live in runner tests.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cs314Overrides } from "./curation/cs314-overrides.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archivePath = path.join(repoRoot, "app", "data", "generated-cs-archive.ts");
const questionsRoot = path.join(repoRoot, "runner", "questions");
const marker = "// __STUDENT_CODE__";

const source = await readFile(archivePath, "utf8");
const archive = JSON.parse(source.replace(/^.*?= /s, "").replace(/;\s*$/, ""));
const questions = Object.values(archive)
  .filter((exam) => exam.course === "CS 314")
  .flatMap((exam) =>
    exam.questions.map((question, index) => ({
      ...question,
      ...(cs314Overrides[exam.id]?.questions?.[index + 1]?.set ?? {}),
    })),
  )
  .filter((question) => question.type === "code");

const requestedQuestion = process.argv.find((argument) => argument.startsWith("--question="))?.split("=")[1];
if (requestedQuestion) {
  const question = questions.find((item) => item.id === requestedQuestion);
  if (!question) throw new Error(`Unknown question ${requestedQuestion}.`);
  console.log(JSON.stringify(question, null, 2));
  process.exit(0);
}

function signatureOf(question) {
  let match = question.stub.match(
    /\b(public|private|protected)\s+(static\s+)?([\w<>\[\], ?]+?)\s+(\w+)\s*\(([^)]*)\)/s,
  );
  let constructor = false;
  if (!match) {
    const constructorMatch = question.stub.match(/\b(public|private|protected)\s+([A-Z]\w*)\s*\(([^)]*)\)/s);
    if (!constructorMatch) return null;
    constructor = true;
    match = [constructorMatch[0], constructorMatch[1], "", "", constructorMatch[2], constructorMatch[3]];
  }
  const rawParams = [];
  let currentParam = "";
  let genericDepth = 0;
  for (const character of match[5]) {
    if (character === "<") genericDepth++;
    if (character === ">") genericDepth--;
    if (character === "," && genericDepth === 0) {
      rawParams.push(currentParam);
      currentParam = "";
    } else currentParam += character;
  }
  if (currentParam.trim()) rawParams.push(currentParam);
  const params = match[5].trim()
    ? rawParams.map((raw) => {
        const cleaned = raw.trim().replace(/\s+/g, " ");
        const pieces = cleaned.split(" ");
        return { type: pieces.slice(0, -1).join(" "), name: pieces.at(-1) };
      })
    : [];
  return { visibility: match[1], static: Boolean(match[2]), returns: match[3].trim(), name: match[4], params, constructor };
}

function javaString(value) {
  return JSON.stringify(value);
}

function replaceType(sourceText, from, to) {
  return sourceText.replace(new RegExp(`\\b${from}\\b`, "g"), to);
}

const commonRunner = `import java.util.*;
import java.lang.reflect.Array;

interface ExamSnapshot { String examSnapshot(); }

public class TestRunner {
    private static int passed;
    private static int total;

    private interface CheckedCall { Object run() throws Throwable; }

    private static final class Outcome {
        private final Object value;
        private final String error;
        private Outcome(Object value, String error) { this.value = value; this.error = error; }
        static Outcome capture(CheckedCall call) {
            try { return new Outcome(normalize(call.run()), null); }
            catch (Throwable error) { return new Outcome(null, error.getClass().getName()); }
        }
        public boolean equals(Object other) {
            if (!(other instanceof Outcome)) return false;
            Outcome rhs = (Outcome) other;
            return Objects.equals(value, rhs.value) && Objects.equals(error, rhs.error);
        }
        public String toString() { return error == null ? String.valueOf(value) : "throws " + error; }
    }

    private static Object normalize(Object value) {
        if (value == null) return null;
        if (value instanceof ExamSnapshot) return ((ExamSnapshot) value).examSnapshot();
        if (value instanceof Iterable<?>) {
            ArrayList<Object> result = new ArrayList<>();
            for (Object item : (Iterable<?>) value) result.add(normalize(item));
            return result;
        }
        if (value instanceof Map<?, ?>) {
            TreeMap<String, Object> result = new TreeMap<>();
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) value).entrySet())
                result.put(String.valueOf(entry.getKey()), normalize(entry.getValue()));
            return result;
        }
        Class<?> type = value.getClass();
        if (!type.isArray()) return value;
        int length = Array.getLength(value);
        ArrayList<Object> result = new ArrayList<>();
        for (int i = 0; i < length; i++) result.add(normalize(Array.get(value, i)));
        return result;
    }

    private static void checkEqual(Object actual, Object expected, String name) {
        total++;
        if (Objects.equals(actual, expected)) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            System.out.println("FAIL " + name + " expected=" + expected + " actual=" + actual);
        }
    }

__CASES__

    public static void main(String[] args) {
        runCases();
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`;

function activeArrayField(question, candidates) {
  return candidates.find((name) => new RegExp(`\\b${name}\\b`).test(question.answer)) ?? candidates[0];
}

function genericListSupport(question, className, answer, isOracle) {
  const active = activeArrayField(question, ["con", "values", "container", "data"]);
  const method = isOracle ? replaceType(answer, className, `Oracle${className}`) : marker;
  const actualName = isOracle ? `Oracle${className}` : className;
  const generic = /class\s+GenericList\s*<\s*E\s+extends\s+Comparable/.test(question.reference)
    ? "<E extends Comparable<E>>"
    : "<E>";
  const factoryGeneric = generic.includes("Comparable") ? "<T extends Comparable<T>>" : "<T>";
  return `import java.util.*;
import java.io.*;

class ${actualName}${generic} implements ExamSnapshot {
    private E[] con;
    private E[] values;
    private E[] container;
    private E[] data;
    private int size;

    public ${actualName}() { this(10); }
    @SuppressWarnings("unchecked")
    public ${actualName}(int capacity) {
        con = (E[]) new ${generic.includes("Comparable") ? "Comparable" : "Object"}[Math.max(0, capacity)];
        values = con;
        container = con;
        data = con;
    }
    @SuppressWarnings("unchecked")
    private E[] getArray(int capacity) { return (E[]) new Object[capacity]; }
    public int size() { return size; }
    public E get(int index) { return ${active}[index]; }

${method}

    @SafeVarargs
    static ${factoryGeneric} ${actualName}<T> of(T... items) {
        ${actualName}<T> list = new ${actualName}<>(items.length + 5);
        for (T item : items) list.${active}[list.size++] = item;
        return list;
    }
    public String examSnapshot() {
        return size + ":" + Arrays.toString(Arrays.copyOf(${active}, Math.max(0, Math.min(size, ${active}.length))));
    }
}
`;
}

function matrixSupport(question, className, answer, isOracle) {
  const active = activeArrayField(question, ["cells", "coefficients", "coeffs", "myCells", "elements", "data", "matrix"]);
  const method = isOracle ? replaceType(answer, className, `Oracle${className}`) : marker;
  const actualName = isOracle ? `Oracle${className}` : className;
  return `import java.util.*;
import java.io.*;

class ${actualName} implements ExamSnapshot {
    private int[][] cells;
    private int[][] coefficients;
    private int[][] coeffs;
    private int[][] myCells;
    private int[][] elements;
    private int[][] data;
    private int[][] matrix;

    public ${actualName}(int rows, int columns) { set(new int[rows][columns]); }
    private void set(int[][] source) {
        cells = copy(source); coefficients = cells; coeffs = cells; myCells = cells; elements = cells; data = cells; matrix = cells;
    }
    private static int[][] copy(int[][] source) {
        int[][] result = new int[source.length][];
        for (int i = 0; i < source.length; i++) result[i] = Arrays.copyOf(source[i], source[i].length);
        return result;
    }
    static ${actualName} of(int[][] source) {
        ${actualName} result = new ${actualName}(source.length, source[0].length);
        result.set(source);
        return result;
    }
    public int numRows() { return ${active}.length; }
    public int numCols() { return ${active}[0].length; }
    public int getValue(int row, int col) { return ${active}[row][col]; }
    public int get(int row, int col) { return ${active}[row][col]; }

${method}

    public String examSnapshot() { return Arrays.deepToString(${active}); }
}
`;
}

function linkedListSupport(question, className, answer, isOracle) {
  const firstField = activeArrayField(question, ["first", "head", "front"]);
  const dataField = activeArrayField(question, ["data", "value", "element"]);
  const nodeType = /\bDoubleListNode\b/.test(question.answer)
    ? "DoubleListNode"
    : /\bListNode\b/.test(question.answer)
      ? "ListNode"
      : "Node";
  const method = isOracle ? replaceType(answer, className, `Oracle${className}`) : marker;
  const actualName = isOracle ? `Oracle${className}` : className;
  return `import java.util.*;

class ${actualName}<E extends Comparable<E>> implements ExamSnapshot {
    private ${nodeType}<E> first;
    private ${nodeType}<E> head;
    private ${nodeType}<E> front;
    private ${nodeType}<E> last;
    private int size;

    private static class ${nodeType}<E> {
        private E data;
        private E value;
        private E element;
        private ${nodeType}<E> next;
        private ${nodeType}<E> prev;
        private ${nodeType}() { }
        private ${nodeType}(E value) { this.data = value; this.value = value; this.element = value; }
        private ${nodeType}(E value, ${nodeType}<E> next) { this(value); this.next = next; }
        private E getData() { return ${dataField}; }
        private E getValue() { return ${dataField}; }
        private ${nodeType}<E> getNext() { return next; }
        private ${nodeType}<E> getPrev() { return prev; }
        private void setNext(${nodeType}<E> value) { next = value; }
        private void setPrev(${nodeType}<E> value) { prev = value; }
    }

${method}

    @SafeVarargs
    static <T extends Comparable<T>> ${actualName}<T> of(T... items) {
        ${actualName}<T> list = new ${actualName}<>();
        ${nodeType}<T> previous = null;
        for (T item : items) {
            ${nodeType}<T> node = new ${nodeType}<>(item);
            if (list.${firstField} == null) list.${firstField} = node;
            else previous.next = node;
            node.prev = previous;
            previous = node;
            list.size++;
        }
        list.first = list.${firstField}; list.head = list.${firstField}; list.front = list.${firstField}; list.last = previous;
        return list;
    }
    public int size() { return size; }
    public void examConvergeWith(${actualName}<E> other) {
        if (${firstField} != null && ${firstField}.next != null && other.${firstField} != null) other.${firstField}.next = ${firstField}.next;
    }
    public E get(int index) {
        ${nodeType}<E> current = ${firstField};
        while (index-- > 0) current = current.next;
        return current.${dataField};
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        ${nodeType}<E> current = ${firstField};
        int guard = 0;
        while (current != null && guard++ < 200) {
            values.add(String.valueOf(current.${dataField}));
            current = current.next;
        }
        return size + ":" + values + (current == null ? "" : ":cycle");
    }
}
`;
}

function plainSupport(question, className, answer, isOracle) {
  const method = isOracle ? answer : marker;
  const actualName = isOracle ? `Oracle${className}` : className;
  const signature = signatureOf(question);
  const privateAdapter = signature?.visibility === "private"
    ? `public Object examCall(${signature.params.map((param) => `${param.type} ${param.name}`).join(", ")}) {
        ${/\bvoid\b/.test(signature.returns) ? `${signature.name}(${signature.params.map((param) => param.name).join(", ")}); return null;` : `return ${signature.name}(${signature.params.map((param) => param.name).join(", ")});`}
    }`
    : "";
  return `import java.util.*;
import java.io.*;

class ${actualName} implements ExamSnapshot {
    private static final int[][] rc_deltas = {{-1, 1, 0, 0}, {0, 0, -1, 1}};
    private static final int[][] KNIGHT_DIRECTIONS = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
    private static final int MINE = -1;
    private static final int PSEUDO_EOF = 256, BITS_PER_WORD = 8;
    private static int[][] numMines = {{0,0,1},{0,1,1},{0,0,0}};
    private static boolean[][] revealed = new boolean[3][3];
    private char[][] theBoard = {{'C','A','T'},{'A','R','E'},{'T','E','N'}};
    private char[][] board = theBoard;
    private static boolean gameOver;
    private boolean inbounds(int row, int col) { return 0 <= row && row < theBoard.length && 0 <= col && col < theBoard[0].length; }
    private static boolean allMatch(int row, int col, Rectangle rectangle, boolean value, boolean[][] matrix) {
        for (int r = row; r < row + rectangle.height; r++)
            for (int c = col; c < col + rectangle.width; c++) if (matrix[r][c] != value) return false;
        return true;
    }
    private static void setVals(int row, int col, Rectangle rectangle, boolean value, boolean[][] matrix) {
        for (int r = row; r < row + rectangle.height; r++)
            for (int c = col; c < col + rectangle.width; c++) matrix[r][c] = value;
    }
    private static boolean colorsOkay(Map<String, List<String>> borders, Map<String, Color> colors) {
        for (String area : colors.keySet())
            for (String neighbor : borders.getOrDefault(area, Collections.emptyList()))
                if (colors.containsKey(neighbor) && colors.get(area) == colors.get(neighbor)) return false;
        return true;
    }
${method}
    ${privateAdapter}
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
`;
}

const collectionSupportSource = `import java.util.*;
import java.io.*;

class Stack<E> extends java.util.Stack<E> { E top() { return peek(); } }
class Queue<E> extends LinkedList<E> {
    void enqueue(E value) { add(value); }
    E dequeue() { return remove(); }
    E front() { return element(); }
}
class Stack314<E> extends Stack<E> { }
class Queue314<E> extends Queue<E> { }
class Point {
    final double x, y; Point(double x, double y) { this.x = x; this.y = y; }
    double distance(Point other) { return Math.hypot(x - other.x, y - other.y); }
    double distanceTo(Point other) { return distance(other); }
    int getX() { return (int) x; } int getY() { return (int) y; }
    public String toString() { return x + ":" + y; }
}
class Position {
    final int row, col; Position(int row, int col) { this.row = row; this.col = col; }
    int getRow() { return row; } int getCol() { return col; }
    public boolean equals(Object other) { return other instanceof Position && row == ((Position) other).row && col == ((Position) other).col; }
    public int hashCode() { return Objects.hash(row, col); }
}
class Rectangle {
    final int height = 1, width = 1;
    boolean intersects(Rectangle other) { return this != other; }
}
class Airline {
    final String name; final Set<Airline> destinations = new LinkedHashSet<>();
    Airline(String name) { this.name = name; }
    Set<Airline> getDestinations() { return destinations; }
    Airline[] getPartners() { return destinations.toArray(new Airline[0]); }
    public boolean equals(Object other) { return other instanceof Airline && name.equals(((Airline) other).name); }
    public int hashCode() { return name.hashCode(); }
}
enum Color { RED, GREEN, BLUE }
class Move { final int source, removed, dest; Move(int s,int r,int d){source=s;removed=r;dest=d;} int sourceRow(){return 0;} int sourceCol(){return source;} int removedRow(){return 0;} int removedCol(){return removed;} int destRow(){return 0;} int destCol(){return dest;} }
class Board {
    final boolean[] marbles; Board(boolean... values){marbles=values;}
    static Board fixture(int c){return c%3==0?new Board(true,true,false):c%3==1?new Board(false,true,true):new Board(true,false,true);}
    int numMarblesOnBoard(){int n=0;for(boolean b:marbles)if(b)n++;return n;}
    Move[] getMoves(){ArrayList<Move>m=new ArrayList<>();for(int i=0;i+2<marbles.length;i++){if(marbles[i]&&marbles[i+1]&&!marbles[i+2])m.add(new Move(i,i+1,i+2));if(!marbles[i]&&marbles[i+1]&&marbles[i+2])m.add(new Move(i+2,i+1,i));}return m.toArray(new Move[0]);}
    void removeMarble(int r,int c){marbles[c]=false;} void placeMarble(int r,int c){marbles[c]=true;}
}
class ConnectFourBoard {
    static final int NUM_COL=4; final char[] cells=new char[NUM_COL];
    static ConnectFourBoard fixture(int c){ConnectFourBoard b=new ConnectFourBoard();if(c%2==0){b.cells[0]='r';b.cells[1]='r';b.cells[2]='r';}return b;}
    boolean gameOver(){return winner()!=' ';} char winner(){char x=cells[0];if(x!=0)for(char y:cells)if(y!=x)return ' ';return x==0?' ':x;}
    boolean columnisOpen(int c){return cells[c]==0;} void dropPiece(int c,char x){cells[c]=x;} void pickUpTopChecker(int c){cells[c]=0;}
}
class BuildingMap {
    final Map<String,String[]> links=new LinkedHashMap<>(); final Set<String> visited=new HashSet<>();
    static BuildingMap fixture(int c){BuildingMap m=new BuildingMap();m.links.put("A",new String[]{"B","C"});m.links.put("B",new String[]{"D"});m.links.put("C",c%2==0?new String[]{"D"}:new String[0]);m.links.put("D",new String[0]);return m;}
    void setVisited(String s,boolean v){if(v)visited.add(s);else visited.remove(s);} boolean visitedStatus(String s){return visited.contains(s);} String[] connected(String s){return links.getOrDefault(s,new String[0]);}
}
class BitInputStream {
    private final int[] bits; private int index;
    BitInputStream(int... bits) { this.bits = bits; }
    int readBits(int count) {
        if (index + count > bits.length) return -1;
        int result = 0;
        for (int i = 0; i < count; i++) result = (result << 1) | bits[index++];
        return result;
    }
    void close() { }
    public String toString() { return index + "/" + bits.length; }
}
class BitInputReader extends BitInputStream { BitInputReader(int... bits) { super(bits); } }
class BitOutputStream {
    private final ArrayList<Integer> bits = new ArrayList<>();
    void writeBits(int count, int value) { for (int shift = count - 1; shift >= 0; shift--) bits.add((value >> shift) & 1); }
    void close() { }
    public boolean equals(Object other) { return other instanceof BitOutputStream && bits.equals(((BitOutputStream) other).bits); }
    public int hashCode() { return bits.hashCode(); }
    public String toString() { return bits.toString(); }
}`;

const nameRecordSource = `import java.util.*;

class NameRecord implements Comparable<NameRecord> {
    static final int UNRANKED = 0;
    private final String name;
    private final ArrayList<Integer> ranks;
    NameRecord(String name, int... values) {
        this.name = name;
        this.ranks = new ArrayList<>();
        for (int value : values) ranks.add(value);
    }
    NameRecord(String line) {
        String[] pieces = line.trim().split("\\s+");
        name = pieces[0];
        ranks = new ArrayList<>();
        for (int i = 1; i < pieces.length; i++) ranks.add(Integer.parseInt(pieces[i]));
    }
    String getName() { return name; }
    int getRank(int decade) { return ranks.get(decade); }
    int numDecades() { return ranks.size(); }
    int numDecadesRanked() { return ranks.size(); }
    int get(int decade) { return getRank(decade); }
    void addRank(int rank) { ranks.add(rank); }
    boolean alwaysPresent() {
        for (int rank : ranks) if (rank == UNRANKED) return false;
        return true;
    }
    boolean anyRanksGreater(int cutoff) {
        for (int rank : ranks) if (rank > cutoff) return true;
        return false;
    }
    int getBestRank() {
        int best = Integer.MAX_VALUE;
        for (int rank : ranks) if (rank != UNRANKED && rank < best) best = rank;
        return best == Integer.MAX_VALUE ? UNRANKED : best;
    }
    public int compareTo(NameRecord other) { return name.compareTo(other.name); }
    public boolean equals(Object other) {
        if (!(other instanceof NameRecord)) return false;
        NameRecord rhs = (NameRecord) other;
        return name.equals(rhs.name) && ranks.equals(rhs.ranks);
    }
    public int hashCode() { return Objects.hash(name, ranks); }
    public String toString() { return name + ranks; }
}

class NameCollection extends ArrayList<NameRecord> {
    NameCollection(Collection<NameRecord> source) { super(source); }
    NameRecord get(String name) {
        for (NameRecord record : this) if (record.getName().equals(name)) return record;
        return null;
    }
}`;

function namesSupport(question, className, answer, isOracle) {
  const actualName = isOracle ? `Oracle${className}` : className;
  const method = isOracle ? answer : marker;
  return `import java.util.*;

class ${actualName} implements ExamSnapshot {
    static final int NUM_DECADES = 6;
    static final int MAX_RANK = 1000;
    private ArrayList<NameRecord> records;
    private NameCollection myRecs;
    private NameCollection nameRecords;
    private NameCollection names;
    private NameCollection namesList;
    private NameCollection nameRecordList;
    private Map<String, NameRecord> data;
    private int numDecades = NUM_DECADES;
    private int numDecade = NUM_DECADES;

    private ${actualName}(List<NameRecord> source) {
        records = new ArrayList<>(source);
        myRecs = new NameCollection(source);
        nameRecords = myRecs;
        names = myRecs;
        namesList = myRecs;
        nameRecordList = myRecs;
        data = new LinkedHashMap<>();
        for (NameRecord record : records) data.put(record.getName(), record);
    }
    private NameRecord getRecord(String name) { return data.get(name); }
    static ${actualName} fixture() {
        return new ${actualName}(Arrays.asList(
            new NameRecord("Ada", 0, 0, 8, 12, 0, 0),
            new NameRecord("Bea", 50, 40, 30, 20, 10, 5),
            new NameRecord("Cy", 0, 0, 0, 0, 0, 0),
            new NameRecord("Dee", 9, 0, 0, 11, 0, 13),
            new NameRecord("Eli", 100, 80, 60, 40, 20, 0)
        ));
    }

${method}

    public String examSnapshot() { return records + "|" + data; }
}`;
}

function nameRecordSupport(question, className, answer, isOracle) {
  const actualName = isOracle ? `Oracle${className}` : className;
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  return `import java.util.*;

class ${actualName} implements ExamSnapshot {
    static final int UNRANKED = 0;
    private String name;
    private ArrayList<Integer> ranks;
    private ${actualName}(String name, int... values) {
        this.name = name;
        ranks = new ArrayList<>();
        for (int value : values) ranks.add(value);
    }
    static ${actualName} fixture(int caseIndex) {
        if (caseIndex % 3 == 0) return new ${actualName}("Ada", 0, 0, 12, 0, 0, 0);
        if (caseIndex % 3 == 1) return new ${actualName}("Bea", 50, 40, 30, 20, 10, 5);
        return new ${actualName}("Cy", 0, 0, 0, 0, 0, 0);
    }
    public int getRank(int decade) { return ranks.get(decade); }
    public String getName() { return name; }

${method}

    public String examSnapshot() { return name + ranks; }
}`;
}

function buildNamesCases(signature, className, family) {
  const oracleName = `Oracle${className}`;
  const args = (oracle) => signature.params.map((param, index) => {
    if (/NameRecord/.test(param.type)) return "recordArg";
    if (/(?:ArrayList|List)\s*<\s*String\s*>/.test(param.type)) return "namesArg";
    if (/Map\s*</.test(param.type)) return "newRanks";
    if (/String/.test(param.type)) return index % 2 ? '"a"' : '"A"';
    if (/boolean/.test(param.type)) return "true";
    if (/int/.test(param.type)) return "amount";
    return "null";
  }).join(", ");
  const voidResult = /\bvoid\b/.test(signature.returns);
  const studentCall = `${signature.static ? className : "student"}.${signature.name}(${args(false)})`;
  const oracleCall = `${signature.static ? oracleName : "oracle"}.${signature.name}(${args(true)})`;
  const studentFactory = family === "name-record" ? `${className}.fixture(caseIndex)` : `${className}.fixture()`;
  const oracleFactory = family === "name-record" ? `${oracleName}.fixture(caseIndex)` : `${oracleName}.fixture()`;
  return `    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            ${className} student = ${studentFactory};
            ${oracleName} oracle = ${oracleFactory};
            ${family === "names" ? `NameRecord recordArg = new NameRecord("Arg", 0, 4, 0, 8, 0, 12);
            ArrayList<String> namesArg = new ArrayList<>(Arrays.asList("Ada", "Bea", "Missing"));
            Map<String, Integer> newRanks = new LinkedHashMap<>();
            newRanks.put("Ada", 7); newRanks.put("Fox", 22);` : ""}
            int amount = caseIndex + 1;
            Outcome studentOutcome = Outcome.capture(() -> ${voidResult ? `{ ${studentCall}; return null; }` : studentCall});
            Outcome oracleOutcome = Outcome.capture(() -> ${voidResult ? `{ ${oracleCall}; return null; }` : oracleCall});
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " receiver state");
        }
    }`;
}

function treeClassName(question) {
  const names = [...question.reference.matchAll(/\b(?:public\s+)?class\s+([A-Z]\w*)/g)].map((match) => match[1]);
  return names.find((name) => !/Node$/i.test(name)) ?? "BinaryTree";
}

function treeSupport(question, className, answer, isOracle, signature) {
  const actualName = isOracle ? `Oracle${className}` : className;
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  const generic = new RegExp(`class\\s+${className}\\s*<`).test(question.reference);
  const nodeCandidates = [...`${question.stub}\n${question.answer}\n${question.reference}`.matchAll(/\b([A-Z]\w*Node|Node)\b/g)]
    .map((match) => match[1])
    .filter((name) => name !== className);
  const nodeName = nodeCandidates[0] ?? "BNode";
  const nodeGeneric = new RegExp(`\\b${nodeName}\\s*<`).test(`${question.reference}\n${question.answer}`);
  const valueType = generic ? "E" : "int";
  const nodeType = nodeGeneric ? `${nodeName}<${generic ? "E" : "Integer"}>` : nodeName;
  const staticNodeType = nodeGeneric ? `${nodeName}<Integer>` : nodeName;
  const dataField = activeArrayField(question, ["data", "value", "element"]);
  const nodeDefinition = nodeGeneric
    ? `private static class ${nodeName}<T> {
        private T data; private T value; private T element; private T val;
        private ${nodeName}<T> left; private ${nodeName}<T> right;
        private ArrayList<${nodeName}<T>> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        ${nodeName}() { }
        ${nodeName}(T value) { data = value; this.value = value; element = value; val = value; }
        T getData() { return ${dataField}; } T getValue() { return ${dataField}; }
        ${nodeName}<T> getLeft() { return left; } ${nodeName}<T> getRight() { return right; }
        void setLeft(${nodeName}<T> node) { left = node; } void setRight(${nodeName}<T> node) { right = node; }
        ArrayList<${nodeName}<T>> getChildren() { return children; }
    }`
    : `private static class ${nodeName} {
        private int data; private int value; private int element; private int val;
        private ${nodeName} left; private ${nodeName} right;
        private ArrayList<${nodeName}> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        ${nodeName}() { }
        ${nodeName}(int value) { data = value; this.value = value; element = value; val = value; }
        int getData() { return ${dataField}; } int getValue() { return ${dataField}; }
        ${nodeName} getLeft() { return left; } ${nodeName} getRight() { return right; }
        void setLeft(${nodeName} node) { left = node; } void setRight(${nodeName} node) { right = node; }
        ArrayList<${nodeName}> getChildren() { return children; }
    }`;
  const argument = (param) => {
    if (new RegExp(`\\b${nodeName}\\b`).test(param.type)) return "root";
    if (new RegExp(`\\b${className}\\b`).test(param.type)) return "other";
    if (/\bE\[\]/.test(param.type)) return "resultArray";
    if (/int\[\]/.test(param.type)) {
      if (/depth/i.test(param.name)) return "depthRange";
      if (/value|range/i.test(param.name)) return "valueRange";
      return "countArray";
    }
    if (/\b(?:E|T)\b/.test(param.type)) return "target";
    if (/String/.test(param.type)) return '".-"';
    if (/boolean/.test(param.type)) return "true";
    if (/int/.test(param.type)) {
      if (/^(?:target|tgt)$/i.test(param.name)) return "target";
      if (/depth/i.test(param.name)) return question.id === "cs314-2017-fall-final-q3" ? "3" : "2";
      if (/new.*val/i.test(param.name)) return "9";
      if (/req/i.test(param.name)) return "2";
      return "3";
    }
    return "null";
  };
  const args = signature.params.map(argument).join(", ");
  const call = `${signature.name}(${args})`;
  const voidResult = /\bvoid\b/.test(signature.returns);
  return `import java.util.*;

class ${actualName}${generic ? "<E extends Comparable<E>>" : ""} implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private ${nodeType} root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    ${nodeDefinition}

${method}

    private ${actualName}() { }
    static ${generic ? `${actualName}<Integer>` : actualName} fixture() {
        ${actualName}${generic ? "<Integer>" : ""} tree = new ${actualName}${generic ? "<>()" : "()"};
        ${staticNodeType} n4 = new ${nodeName}${nodeGeneric ? "<>" : ""}(4);
        ${staticNodeType} n2 = new ${nodeName}${nodeGeneric ? "<>" : ""}(2);
        ${staticNodeType} n7 = new ${nodeName}${nodeGeneric ? "<>" : ""}(7);
        ${staticNodeType} n1 = new ${nodeName}${nodeGeneric ? "<>" : ""}(1);
        ${staticNodeType} n3 = new ${nodeName}${nodeGeneric ? "<>" : ""}(3);
        ${staticNodeType} n6 = new ${nodeName}${nodeGeneric ? "<>" : ""}(6);
        ${staticNodeType} n8 = new ${nodeName}${nodeGeneric ? "<>" : ""}(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        ${["cs314-2017-spring-final-q4", "cs314-2019-spring-exam-2-q5"].includes(question.id) ? "n2.right = null; n7.left = null; tree.size = 5;" : ""}
        ${question.id === "cs314-2017-fall-final-q3" ? "n2.right = null; tree.size = 6;" : ""}
        ${question.id === "cs314-2016-fall-exam-2-q5" ? "n2.right = null; tree.size = 6;" : ""}
        ${question.id === "cs314-2024-spring-exam-3-q2" ? "n6.data = n6.value = n6.element = n6.val = 2;" : ""}
        ${question.id === "cs314-2013-spring-final-q5" ? "n7.isBlack = n7.isBlackNode = n7.isBlackBode = false;" : ""}
        ${question.id === "cs314-2019-fall-final-q4" ? "n2.left = null; n2.right = null; tree.size = 5;" : ""}
        return tree;
    }
    public Object examCall(int caseIndex) {
        ${actualName} other = ${actualName}.fixture();
        ${question.id === "cs314-2019-spring-final-q4" ? "other.root.left = null;" : ""}
        ${generic ? `E target = (E) Integer.valueOf(${question.id === "cs314-2014-spring-final-q3" ? "caseIndex % 2 == 0 ? 6 : 99" : "caseIndex % 2 == 0 ? 2 : 9"});` : `int target = ${question.id === "cs314-2014-spring-final-q3" ? "caseIndex % 2 == 0 ? 6 : 99" : "caseIndex % 2 == 0 ? 2 : 9"};`}
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        ${generic ? "E[] resultArray = (E[]) new Comparable[1];" : "Integer[] resultArray = new Integer[1];"}
        Object result = ${voidResult ? `null; ${call};` : call + ";"}
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(${nodeType} node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.${dataField}) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}`;
}

function buildTreeCases(className, generic) {
  const oracleName = `Oracle${className}`;
  return `    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            ${className}${generic ? "<Integer>" : ""} student = ${className}.fixture();
            ${oracleName}${generic ? "<Integer>" : ""} oracle = ${oracleName}.fixture();
            final int currentCase = caseIndex;
            Outcome studentOutcome = Outcome.capture(() -> student.examCall(currentCase));
            Outcome oracleOutcome = Outcome.capture(() -> oracle.examCall(currentCase));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " receiver state");
        }
    }`;
}

function graphSupport(question, className, answer, isOracle, signature) {
  const actualName = isOracle ? `Oracle${className}` : className;
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  const argument = (param, index) => {
    const name = param.name.toLowerCase();
    if (/Vertex/.test(param.type)) return name.includes("dest") ? "vertices.get(\"C\")" : "vertices.get(\"A\")";
    if (new RegExp(`\\b${className}\\b`).test(param.type)) return "other";
    if (/Set\s*<\s*String/.test(param.type)) return "required";
    if (/Set\s*<\s*Vertex/.test(param.type)) return "visited";
    if (/Map\s*</.test(param.type)) return "indegree";
    if (/(?:ArrayList|List)\s*<\s*String/.test(param.type)) return "namesPath";
    if (/List\s*</.test(param.type)) return "path";
    if (/int\[\]/.test(param.type)) return "visitedCount";
    if (/String/.test(param.type)) return name.includes("dest") || index ? '"C"' : '"A"';
    if (/boolean/.test(param.type)) return "true";
    if (/double/.test(param.type)) return name.includes("factor") ? "1.5" : "Double.POSITIVE_INFINITY";
    if (/int/.test(param.type)) return name.includes("dest") ? "2" : name.includes("cost") ? "0" : /required|hub|visited/.test(name) ? "1" : "0";
    return "null";
  };
  const args = signature.params.map(argument).join(", ");
  const call = `${signature.name}(${args})`;
  const voidResult = /\bvoid\b/.test(signature.returns);
  const indegreeHelper = question.id === "cs314-2016-spring-final-q5" ? "" : `
    private void updateIndegree() {
        for (Vertex vertex : vertices.values()) vertex.scratch = 0;
        for (Vertex vertex : vertices.values()) for (Edge edge : vertex.adjacent) edge.dest.scratch++;
    }`;
  return `import java.util.*;

class ${actualName} implements ExamSnapshot {
    private static class Edge {
        private Vertex dest; private Vertex destination; private int cost; private int weight;
        Edge(Vertex dest, int cost) { this.dest = dest; destination = dest; this.cost = cost; weight = cost; }
        public String toString() { return dest.name + ":" + cost; }
    }
    private static class Vertex {
        private String name; private String label;
        private ArrayList<Edge> adjacent = new ArrayList<>();
        private ArrayList<Edge> edges = adjacent;
        private int scratch; private int indegree; private boolean visited;
        private Vertex prev;
        Vertex(String name) { this.name = name; label = name; }
        public boolean equals(Object other) { return other instanceof Vertex && name.equals(((Vertex) other).name); }
        public int hashCode() { return name.hashCode(); }
        public String toString() { return name; }
    }
    private LinkedHashMap<String, Vertex> vertices = new LinkedHashMap<>();
    private Map<String, Vertex> verts = vertices;
    private Map<String, Vertex> graph = vertices;
    private boolean[][] adjMat;
    private static final double INFINITY = Double.POSITIVE_INFINITY;

    private ${actualName}() { }
    static ${actualName} fixture() {
        ${actualName} result = new ${actualName}();
        for (String name : new String[]{"A", "B", "C", "D", "E"}) result.vertices.put(name, new Vertex(name));
        result.addEdge("A", "B", 2); result.addEdge("A", "C", 5);
        result.addEdge("B", "C", 1); result.addEdge("C", "A", 4); result.addEdge("C", "D", 3);
        result.addEdge("D", "E", 2); result.addEdge("E", "A", 1);
        result.adjMat = new boolean[][]{
            {false,true,true,false,false}, {false,false,true,false,false},
            {true,false,false,true,false}, {false,false,false,false,false}, {false,false,false,false,false}
        };
        return result;
    }
    private void addEdge(String from, String to, int cost) {
        vertices.get(from).adjacent.add(new Edge(vertices.get(to), cost));
        vertices.get(to).indegree++;
    }
    private boolean containsVertex(String name) { return vertices.containsKey(name); }
    private Vertex getVertex(String name) { return vertices.get(name); }
    private void clearAll() { for (Vertex vertex : vertices.values()) { vertex.scratch = 0; vertex.visited = false; } }
    ${indegreeHelper}
    private void addConnectedVertices(Set<Vertex> found, Vertex current) {
        if (!found.add(current)) return;
        for (Edge edge : current.adjacent) addConnectedVertices(found, edge.dest);
        for (Vertex vertex : vertices.values())
            for (Edge edge : vertex.adjacent) if (edge.dest == current) addConnectedVertices(found, vertex);
    }

${method}

    public Object examCall(int caseIndex) {
        ${actualName} other = ${actualName}.fixture();
        Set<String> required = new LinkedHashSet<>(caseIndex % 2 == 0 ? Arrays.asList("A", "C") : Arrays.asList("A", "E"));
        Set<Vertex> visited = new LinkedHashSet<>();
        Map<String, Integer> indegree = new LinkedHashMap<>();
        for (String name : vertices.keySet()) indegree.put(name, 0);
        ArrayList<Vertex> path = new ArrayList<>();
        ArrayList<String> namesPath = new ArrayList<>();
        int[] visitedCount = {0};
        Object result = ${voidResult ? `null; ${call};` : call + ";"}
        return Arrays.asList(result, required, visited, indegree, path, namesPath, Arrays.toString(visitedCount), other.examSnapshot());
    }
    public String examSnapshot() {
        ArrayList<String> result = new ArrayList<>();
        for (Vertex vertex : vertices.values())
            result.add(vertex.name + "(" + vertex.scratch + "," + vertex.indegree + "," + vertex.visited + ")->" + vertex.adjacent);
        return result.toString();
    }
}`;
}

function buildGraphCases(className) {
  const oracleName = `Oracle${className}`;
  return `    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            ${className} student = ${className}.fixture();
            ${oracleName} oracle = ${oracleName}.fixture();
            final int currentCase = caseIndex;
            Outcome studentOutcome = Outcome.capture(() -> student.examCall(currentCase));
            Outcome oracleOutcome = Outcome.capture(() -> oracle.examCall(currentCase));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " receiver state");
        }
    }`;
}

function linkedSpecialSupport(question, className, answer, isOracle, signature) {
  const actualName = isOracle ? `Oracle${className}` : className;
  const generic = new RegExp(`class\\s+${className}\\s*<`).test(question.reference);
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  const nodeCandidates = [...`${question.stub}\n${question.answer}\n${question.reference}`.matchAll(/\b([A-Z]\w*Node|Node)\b/g)]
    .map((match) => match[1]);
  const nodeName = nodeCandidates.find((name) => !/Header/.test(name)) ?? "Node";
  const nodeGeneric = new RegExp(`\\b${nodeName}\\s*<`).test(`${question.reference}\n${question.answer}`);
  const nodeType = nodeGeneric ? `${nodeName}<${generic ? "E" : "Integer"}>` : nodeName;
  const factoryNodeType = nodeGeneric ? `${nodeName}<Integer>` : nodeName;
  const dataType = nodeGeneric ? "T" : "int";
  const dataField = activeArrayField(question, ["data", "value", "element"]);
  const nodeDefinition = nodeGeneric
    ? `private static class ${nodeName}<T> {
        private T data; private T value; private T element; private T val;
        private ${nodeName}<T> next; private ${nodeName}<T> prev;
        ${nodeName}() { }
        ${nodeName}(T value) { data = value; this.value = value; element = value; val = value; }
        ${nodeName}(T value, ${nodeName}<T> next) { this(value); this.next = next; }
        T getData() { return ${dataField}; } T getValue() { return ${dataField}; }
        ${nodeName}<T> getNext() { return next; } ${nodeName}<T> getPrev() { return prev; }
        void setNext(${nodeName}<T> node) { next = node; } void setPrev(${nodeName}<T> node) { prev = node; }
    }`
    : `private static class ${nodeName} {
        private int data; private int value; private int element; private int val;
        private ${nodeName} next; private ${nodeName} prev;
        ${nodeName}() { }
        ${nodeName}(int value) { data = value; this.value = value; element = value; val = value; }
        ${nodeName}(int value, ${nodeName} next) { this(value); this.next = next; }
        int getData() { return ${dataField}; } int getValue() { return ${dataField}; }
        ${nodeName} getNext() { return next; } ${nodeName} getPrev() { return prev; }
        void setNext(${nodeName} node) { next = node; } void setPrev(${nodeName} node) { prev = node; }
    }`;
  const argument = (param, index) => {
    const name = param.name.toLowerCase();
    if (new RegExp(`\\b${className}\\b`).test(param.type)) return "other";
    if (/\b(?:E|T|Object)\b/.test(param.type)) return generic ? `(E) Integer.valueOf(${question.id === "cs314-2011-fall-exam-2-q3" ? 9 : index ? 3 : 2})` : `${question.id === "cs314-2011-fall-exam-2-q3" ? 9 : index ? 3 : 2}`;
    if (/String/.test(param.type)) return '"123"';
    if (/boolean/.test(param.type)) return "true";
    if (/int/.test(param.type)) {
      if (/start/.test(name)) return "1";
      if (/stop/.test(name)) return "4";
      return index ? "3" : "2";
    }
    return "null";
  };
  const call = `${signature.name}(${signature.params.map(argument).join(", ")})`;
  const voidResult = /\bvoid\b/.test(signature.returns);
  return `import java.util.*;

class ${actualName}${generic ? "<E extends Comparable<E>>" : ""} implements ExamSnapshot {
    private ${nodeType} first; private ${nodeType} head; private ${nodeType} last; private ${nodeType} header;
    private int size;
    ${nodeDefinition}

${method}

    private ${actualName}() { }
    static ${generic ? `${actualName}<Integer>` : actualName} fixture() {
        ${actualName}${generic ? "<Integer>" : ""} list = new ${actualName}${generic ? "<>()" : "()"};
        int[] values = ${question.id === "cs314-2019-spring-exam-2-q2" ? "new int[]{1, 1, 1, 0, 4}" : "new int[]{1, 2, 2, 3, 4}"};
        ${factoryNodeType} previous = null;
        for (int value : values) {
            ${factoryNodeType} node = new ${nodeName}${nodeGeneric ? "<>" : ""}(value);
            if (list.first == null) list.first = node; else previous.next = node;
            node.prev = previous; previous = node; list.size++;
        }
        list.head = list.first; list.last = previous;
        list.header = new ${nodeName}${nodeGeneric ? "<>" : ""}();
        list.header.next = list.first; if (list.first != null) list.first.prev = list.header;
        ${/\.next\s*!=\s*header/.test(answer) ? "list.last.next = list.header; list.header.prev = list.last;" : ""}
        return list;
    }
    public Object examCall(int caseIndex) {
        ${actualName} other = ${actualName}.fixture();
        ${question.id === "cs314-2022-spring-exam-2-q3" ? "other.first.data = other.first.value = other.first.element = other.first.val = 9;" : ""}
        Object result = ${voidResult ? `null; ${call};` : call + ";"}
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        ${nodeType} current = first != null ? first : (header == null ? null : header.next);
        int guard = 0;
        while (current != null && current != header && guard++ < 100) { values.add(String.valueOf(current.${dataField})); current = current.next; }
        return size + ":" + values + (guard >= 100 ? ":cycle" : "");
    }
}`;
}

function buildLinkedSpecialCases(className, generic) {
  const oracleName = `Oracle${className}`;
  return `    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            ${className}${generic ? "<Integer>" : ""} student = ${className}.fixture();
            ${oracleName}${generic ? "<Integer>" : ""} oracle = ${oracleName}.fixture();
            final int currentCase = caseIndex;
            Outcome studentOutcome = Outcome.capture(() -> student.examCall(currentCase));
            Outcome oracleOutcome = Outcome.capture(() -> oracle.examCall(currentCase));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " receiver state");
        }
    }`;
}

function arrayMapSupport(question, className, answer, isOracle, signature) {
  const generic = /class\s+ArrayMap\s*</.test(question.reference);
  const actualName = isOracle ? "OracleArrayMap" : "ArrayMap";
  const method = isOracle ? replaceType(answer, "ArrayMap", actualName) : marker;
  const args = signature.params.map((param, index) => {
    if (/\[\]/.test(param.type)) return "keys";
    if (/\bK\b/.test(param.type)) return '(K) "A"';
    if (/Object/.test(param.type)) return index ? '"value"' : '"A"';
    if (/\bV\b/.test(param.type)) return "(V) Integer.valueOf(7)";
    return "null";
  }).join(", ");
  const voidResult = /\bvoid\b/.test(signature.returns);
  return `import java.util.*;

class ${actualName}${generic ? "<K, V>" : ""} implements ExamSnapshot {
    private Object[][] kvPairs;
    private int size;
    private Entry${generic ? "<K, V>" : ""}[] con;
    private static class Entry<K, V> { private K key; private V value; Entry(K key, V value) { this.key = key; this.value = value; } }
    private ${actualName}() { }
    private void resizeArray(int capacity) {
        Object[][] resized = new Object[2][capacity];
        for (int row = 0; row < 2; row++) System.arraycopy(kvPairs[row], 0, resized[row], 0, size);
        kvPairs = resized;
    }
${method}
    static ${generic ? `${actualName}<String, Integer>` : actualName} fixture() {
        ${actualName}${generic ? "<String, Integer>" : ""} map = new ${actualName}${generic ? "<>()" : "()"};
        map.kvPairs = new Object[2][10];
        map.kvPairs[0][0] = "A"; map.kvPairs[1][0] = 1;
        map.kvPairs[0][1] = "B"; map.kvPairs[1][1] = 2; map.size = 2;
        map.con = new Entry[12]; map.con[1] = new Entry("A", 1); map.con[5] = new Entry("B", 2);
        return map;
    }
    public Object examCall(int caseIndex) {
        Object[] keys = {"A", caseIndex % 2 == 0 ? "Z" : "B"};
        Object result = ${voidResult ? `null; ${signature.name}(${args});` : `${signature.name}(${args});`}
        return result;
    }
    public String examSnapshot() {
        ArrayList<String> entries = new ArrayList<>();
        if (con != null) for (Entry entry : con) if (entry != null) entries.add(entry.key + "=" + entry.value);
        return size + ":" + Arrays.deepToString(kvPairs) + ":" + entries;
    }
}`;
}

function buildArrayMapCases(generic) {
  return `    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            ArrayMap${generic ? "<String, Integer>" : ""} student = ArrayMap.fixture();
            OracleArrayMap${generic ? "<String, Integer>" : ""} oracle = OracleArrayMap.fixture();
            final int currentCase = caseIndex;
            Outcome studentOutcome = Outcome.capture(() -> student.examCall(currentCase));
            Outcome oracleOutcome = Outcome.capture(() -> oracle.examCall(currentCase));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " state");
        }
    }`;
}

function arrayCollectionSupport(question, className, answer, isOracle, signature) {
  const generic = new RegExp(`class\\s+${className}\\s*<`).test(question.reference);
  const actualName = isOracle ? `Oracle${className}` : className;
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  const valueType = generic ? "E" : "Object";
  const args = signature.params.map((param, index) => {
    if (new RegExp(`\\b${className}\\b`).test(param.type)) return "other";
    if (/\b(?:E|Object)\b/.test(param.type)) return generic ? "(E) Integer.valueOf(2)" : "Integer.valueOf(2)";
    if (/int/.test(param.type)) return /max/i.test(param.name) ? "3" : "2";
    return "null";
  }).join(", ");
  const voidResult = /\bvoid\b/.test(signature.returns);
  const resizeHelper = /\bresize\s*\(/.test(answer) ? "" : `
    private void resize() {
        ${valueType}[] old = con; setCapacity(Math.max(1, old.length * 2));
        System.arraycopy(old, 0, con, 0, old.length);
    }`;
  return `import java.util.*;

class ${actualName}${generic ? "<E extends Comparable<E>>" : ""} implements ExamSnapshot {
    private ${valueType}[] con; private ${valueType}[] elements; private ${valueType}[] data;
    private int size; private int numberOfElements;
    private ${actualName}() { setCapacity(10); }
    private void setCapacity(int capacity) {
        ${valueType}[] array = (${valueType}[]) new ${generic ? "Comparable" : "Object"}[capacity];
        con = array; elements = array; data = array;
    }
    ${resizeHelper}
${method}
    static ${generic ? `${actualName}<Integer>` : actualName} fixture() {
        ${actualName} result = new ${actualName}${generic ? "()" : "()"};
        Object[] values = {1, 2, 2, 3, 4};
        for (Object value : values) result.con[result.size++] = ${generic ? "(Integer) value" : "value"};
        result.numberOfElements = result.size;
        return result;
    }
    public Object examCall(int caseIndex) {
        ${actualName} other = ${actualName}.fixture();
        Object result = ${voidResult ? `null; ${signature.name}(${args});` : `${signature.name}(${args});`}
        numberOfElements = size = Math.min(Math.max(size, numberOfElements), con.length);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() { return size + ":" + numberOfElements + ":" + Arrays.toString(con); }
}`;
}

function heapSupport(question, className, answer, isOracle, signature) {
  const generic = /class\s+Heap\s*</.test(question.reference);
  const actualName = isOracle ? `Oracle${className}` : className;
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  const type = generic ? "E" : "int";
  const args = signature.params.map((param, index) => /\bE\b/.test(param.type) ? "(E) Integer.valueOf(9)" : index ? "3" : "7").join(", ");
  return `import java.util.*;

class ${actualName}${generic ? "<E extends Comparable<E>>" : ""} implements ExamSnapshot {
    private ${type}[] con; private ${type}[] heap; private ${type}[] elements; private int size;
    private ${actualName}() { set(${generic ? "(E[]) new Comparable[20]" : "new int[20]"}); }
    private void set(${type}[] values) { con = values; heap = values; elements = values; }
    private void resize() { set(Arrays.copyOf(con, con.length * 2)); }
${method}
    static ${generic ? `${actualName}<Integer>` : actualName} fixture() {
        ${actualName} result = new ${actualName}();
        int[] values = {0, 9, 7, 8, 3, 2, 6}; result.size = 6;
        for (int index = 1; index <= result.size; index++) result.con[index] = ${generic ? "values[index]" : "values[index]"};
        return result;
    }
    public Object examCall(int caseIndex) { ${signature.name}(${args}); return null; }
    public String examSnapshot() { return size + ":" + Arrays.toString(con); }
}`;
}

function buildStructureCases(className, generic) {
  const oracleName = `Oracle${className}`;
  const typeArguments = className === "ExamHashMap" ? "<String, Integer>" : generic ? "<Integer>" : "";
  return `    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            ${className}${typeArguments} student = ${className}.fixture();
            ${oracleName}${typeArguments} oracle = ${oracleName}.fixture();
            final int currentCase = caseIndex;
            Outcome studentOutcome = Outcome.capture(() -> student.examCall(currentCase));
            Outcome oracleOutcome = Outcome.capture(() -> oracle.examCall(currentCase));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " state");
        }
    }`;
}

function arraySpecialSupport(question, className, answer, isOracle) {
  const actualName = isOracle ? `Oracle${className}` : className;
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  if (className === "DicePuzzle") return `import java.util.*;
class ${actualName} implements ExamSnapshot {
    static class Die {char[]colors;int left;Die(String s){colors=s.toCharArray();}char getColor(int side){return colors[side];}char getColorSide(int side){return colors[side];}char getColorOppositeSide(int side){return colors[(side+3)%6];}void positionLeftFace(int side){left=side;}int getLeftFacingSide(){return left;}public String toString(){return ""+colors[left]+colors[(left+3)%6];}}
${method}
    static ${actualName} fixture(){return new ${actualName}();}
    public Object examCall(int c){Die[]d=c%2==0?new Die[]{new Die("ABCDEF"),new Die("DEFXYZ"),new Die("XABYCD")}:new Die[]{new Die("AAAAAA"),new Die("BBBBBB")};ArrayList<Die>r=solvePuzzle(d);return r.toString();}
    public String examSnapshot(){return "stateless";}
}`;
  if (className === "ExamHashtable") return `import java.util.*;
class ${actualName}<E> implements ExamSnapshot, Iterable<E> {
    private int size; private static final Object EMPTY=new Object(); private E[] con;
${method}
    public Iterator<E> iterator(){return new HashIterator();}
    private ${actualName}(){con=(E[])new Object[12];Object[]v={1,null,2,EMPTY,3,null,4};for(int i=0;i<v.length;i++){con[i]=(E)v[i];if(v[i]!=null&&v[i]!=EMPTY)size++;}}
    static ${actualName}<Integer> fixture(){return new ${actualName}<>();}
    public Object examCall(int c){Iterator<E>it=iterator();ArrayList<E>seen=new ArrayList<>();if(c==0){try{it.remove();}catch(IllegalStateException e){return "illegal";}}while(it.hasNext()){E value=it.next();seen.add(value);if((c%3)==seen.size()%3)it.remove();}return seen;}
    public String examSnapshot(){ArrayList<String>v=new ArrayList<>();for(E x:con)v.add(x==EMPTY?"EMPTY":String.valueOf(x));return size+":"+v;}
}`;
  if (className === "Decoder") return `import java.util.*;
class ${actualName} implements ExamSnapshot {
    private static final int PEOF=256,BPW=8; private HuffCode[] codes={new HuffCode(1,0,65),new HuffCode(2,2,66),new HuffCode(2,3,PEOF)};
    private static class HuffCode{int numBits,encodeVal,decodeVal;HuffCode(int n,int e,int d){numBits=n;encodeVal=e;decodeVal=d;}}
    static class BitInputStream{int[]bits;int i;BitInputStream(int...b){bits=b;}int readBits(int n){return i<bits.length?bits[i++]:-1;}}
    static class BitOutputStream{ArrayList<Integer>values=new ArrayList<>();void writeBits(int n,int v){values.add(v);}public String toString(){return values.toString();}}
${method}
    static ${actualName} fixture(){return new ${actualName}();}
    public Object examCall(int c){int[][]all={{0,1,0,1,1},{1,0,0,1,1},{0,0,1,1},{1,0,1,0,1,1},{1,1},{0,1,1}};BitOutputStream out=new BitOutputStream();decode(new BitInputStream(all[c]),out);return out.toString();}
    public String examSnapshot(){ArrayList<String>v=new ArrayList<>();for(HuffCode c:codes)v.add(c.numBits+":"+c.encodeVal+":"+c.decodeVal);return v.toString();}
}`;
  if (className === "ExamHashMap") return `import java.util.*;
class ${actualName}<K,V> implements ExamSnapshot {
    private static final double LOAD_LIMIT=.65; private Pair<K,V>[] con; private int size; private final Pair<K,V> EMPTY=new Pair<>(null,null);
    private static class Pair<A,B>{A key;B value;Pair(A k,B v){key=k;value=v;}public String toString(){return key+"="+value;}}
    private ${actualName}(){con=(Pair<K,V>[])new Pair[11];}
    private void resize(){Pair<K,V>[]old=con;con=(Pair<K,V>[])new Pair[old.length*2+1];size=0;for(Pair<K,V>p:old)if(p!=null&&p.key!=null)putSeed(p.key,p.value);}
    private void putSeed(K k,V v){int i=Math.abs(k.hashCode()%con.length);while(con[i]!=null)i=(i+1)%con.length;con[i]=new Pair<>(k,v);size++;}
${method}
    static ${actualName}<String,Integer> fixture(){${actualName}<String,Integer>m=new ${actualName}<>();m.putSeed("Aa",1);m.putSeed("BB",2);m.putSeed("C",3);return m;}
    public Object examCall(int c){return putIfAbsent((K)(Object)new String[]{"Aa","BB","D","E","F","G"}[c],(V)(Object)Integer.valueOf(10+c));}
    public String examSnapshot(){return size+":"+Arrays.toString(con);}
}`;
  if (className === "Trie") return `import java.util.*;
class ${actualName} implements ExamSnapshot {
    private TNode root=new TNode();
    private static class TNode {boolean word;char ch;List<TNode> children;TNode(){}TNode(char c){ch=c;}public boolean equals(Object o){return o instanceof TNode&&ch==((TNode)o).ch;}}
    private TNode getNodeForPrefix(String p){TNode n=root;for(char c:p.toCharArray()){if(n.children==null)return null;TNode found=null;for(TNode x:n.children)if(x.ch==c)found=x;if(found==null)return null;n=found;}return n;}
    private void addWord(String w){TNode n=root;for(char c:w.toCharArray()){if(n.children==null)n.children=new ArrayList<>();TNode f=null;for(TNode x:n.children)if(x.ch==c)f=x;if(f==null){f=new TNode(c);n.children.add(f);}n=f;}n.word=true;}
${method}
    static ${actualName} fixture(){${actualName} t=new ${actualName}();for(String w:new String[]{"bat","bats","bad","be","bear","bed","bee","been","bees","do","dog"})t.addWord(w);return t;}
    public Object examCall(int c){List<String>r=getWords(new String[]{"bee","ba","do","z","b","dog"}[c]);Collections.sort(r);return r;}
    public String examSnapshot(){return String.valueOf(examCall(4));}
}`;
  if (className === "LinkedMatrix") return `import java.util.*;
class ${actualName}<E> implements ExamSnapshot {
    private RowHeader<E> firstRow;
    private static class RowHeader<T>{RowHeader<T> nextRow;DataNode<T> first;}
    private static class DataNode<T>{T data;DataNode<T> next;DataNode(T d){data=d;}}
${method}
    static ${actualName}<Integer> fixture(){return make(3,3,3);}
    static ${actualName}<Integer> make(int... lengths){${actualName}<Integer>m=new ${actualName}<>();RowHeader<Integer>prev=null;for(int len:lengths){RowHeader<Integer>r=new RowHeader<>();if(prev==null)m.firstRow=r;else prev.nextRow=r;prev=r;DataNode<Integer>p=null;for(int i=0;i<len;i++){DataNode<Integer>n=new DataNode<>(i);if(p==null)r.first=n;else p.next=n;p=n;}}return m;}
    public Object examCall(int c){${actualName}<Integer>m=switch(c){case 0->make();case 1->make(0);case 2->make(0,0,0);case 3->make(2,2);case 4->make(2,3);default->make(3,3,1);};firstRow=(RowHeader<E>)(Object)m.firstRow;return isRectangular();}
    public String examSnapshot(){ArrayList<Integer> lengths=new ArrayList<>();RowHeader<E>r=firstRow;while(r!=null){int n=0;DataNode<E>d=r.first;while(d!=null){n++;d=d.next;}lengths.add(n);r=r.nextRow;}return lengths.toString();}
}`;
  if (className === "LinkedBigInteger") return `import java.util.*;
class ${actualName} implements ExamSnapshot {
    private final Node FIRST; private static class Node {int digit;Node next;Node(int d){digit=d;}}
    public ${actualName}(){FIRST=new Node(0);}
${method}
    static ${actualName} fixture(){${actualName} n=new ${actualName}();n.FIRST.digit=7;n.FIRST.next=new Node(1);n.FIRST.next.next=new Node(5);return n;}
    public Object examCall(int c){add(new String[]{"1","9","83","3741","9999","500"}[c]);return null;}
    public String examSnapshot(){StringBuilder s=new StringBuilder();Node n=FIRST;int g=0;while(n!=null&&g++<100){s.append(n.digit);n=n.next;}return s.toString();}
}`;
  if (className === "FuzzySet") return `import java.util.*;
class ${actualName}<E> implements ExamSnapshot {
    static class SetPair<T>{T elem;double degree;SetPair(T e,double d){elem=e;degree=d;}T getElem(){return elem;}double getDegree(){return degree;}public String toString(){return elem+"="+degree;}}
    private ArrayList<SetPair<E>> pairs=new ArrayList<>();
    public ${actualName}(){}
    boolean add(SetPair<E> p){for(SetPair<E>x:pairs)if(x.elem.equals(p.elem)){boolean c=x.degree!=p.degree;x.degree=p.degree;return c;}pairs.add(p);return true;}
    Iterator<SetPair<E>> iterator(){return pairs.iterator();}
${method}
    static ${actualName}<Integer> fixture(){${actualName}<Integer>s=new ${actualName}<>();s.add(new SetPair<>(1,1));s.add(new SetPair<>(3,.1));s.add(new SetPair<>(4,.5));s.add(new SetPair<>(7,.7));return s;}
    public Object examCall(int c){${actualName}<E>o=new ${actualName}<>();o.add(new SetPair<>((E)Integer.valueOf(1),.5));o.add(new SetPair<>((E)Integer.valueOf(3),.7));o.add(new SetPair<>((E)Integer.valueOf(c%2==0?7:9),.02));return getFuzzyIntersection(o).examSnapshot();}
    public String examSnapshot(){return pairs.toString();}
}`;
  if (className === "Bag") return `import java.util.*;
class ${actualName} implements ExamSnapshot {
    private Pair[] container=new Pair[4]; private int sizeOfBag; private int distinctItemsInBag;
    private static class Pair {Object object;int frequency;Pair(Object o,int f){object=o;frequency=f;}Object getObject(){return object;}int getFrequency(){return frequency;}void setFrequency(int f){frequency=f;}public String toString(){return object+"="+frequency;}}
    private ${actualName}(){container[0]=new Pair("C",3);container[1]=new Pair("A",1);container[2]=new Pair("F",2);distinctItemsInBag=3;sizeOfBag=6;}
${method}
    static ${actualName} fixture(){return new ${actualName}();}
    public Object examCall(int c){add(new String[]{"C","D","A","E","F","D"}[c]);return null;}
    public String examSnapshot(){return sizeOfBag+":"+distinctItemsInBag+":"+Arrays.toString(container);}
}`;
  if (className === "UnsortedSet") return `import java.util.*;
class ${actualName}<E> implements ExamSnapshot {
    private ArrayList<E> con;
${method}
    static ${actualName}<Integer> fixture(){return new ${actualName}<>(new ArrayList<>(Arrays.asList(1,2,1,3,2,4,4)));}
    public Object examCall(int c){return con.contains(c);}
    public String examSnapshot(){return String.valueOf(con);}
}`;
  if (className === "MultiSet") return `import java.util.*;
class ${actualName}<E> implements ExamSnapshot {
    private ValueAndFrequency<E>[] con; private int numDistinct; private int size;
    private static class ValueAndFrequency<T> { T element; int frequency; ValueAndFrequency(T e,int f){element=e;frequency=f;} }
    private ${actualName}() { con = (ValueAndFrequency<E>[]) new ValueAndFrequency[10]; }
${method}
    static ${actualName}<Integer> fixture() { ${actualName}<Integer> m=new ${actualName}<>(); m.con[0]=new ValueAndFrequency<>(1,1); m.con[1]=new ValueAndFrequency<>(2,3); m.con[2]=new ValueAndFrequency<>(3,4); m.numDistinct=3; m.size=8; return m; }
    public Object examCall(int c) { ${actualName}<E> o=new ${actualName}<>(); o.con[0]=new ValueAndFrequency<>((E)Integer.valueOf(c%2==0?1:3),c%3+1); o.con[1]=new ValueAndFrequency<>((E)Integer.valueOf(c%3==0?9:2),1); o.numDistinct=2; o.size=o.con[0].frequency+1; return isSubset(o); }
    public String examSnapshot(){return size+":"+numDistinct+":"+Arrays.deepToString(Arrays.stream(con).map(x->x==null?null:x.element+"="+x.frequency).toArray());}
}`;
  if (className === "RunLengthList") return `import java.util.*;
class ${actualName} implements ExamSnapshot {
    private ElementRun[] con=new ElementRun[10]; private int size; private int numRuns; private int numPairs;
    private static class ElementRun { int element,runLength; ElementRun(int e,int r){element=e;runLength=r;} public String toString(){return element+"x"+runLength;} }
    private ${actualName}(){int[][] v={{5,4},{7,4},{3,8},{2,1},{3,6}}; for(int[] x:v)con[numRuns++]=new ElementRun(x[0],x[1]);numPairs=numRuns;size=23;}
${method}
    static ${actualName} fixture(){return new ${actualName}();}
    public Object examCall(int c){remove(new int[]{0,3,4,8,15,16}[c%6]);return null;}
    public String examSnapshot(){return size+":"+numRuns+":"+Arrays.toString(con);}
}`;
  if (className === "SparseMatrix") return `import java.util.*;
class ${actualName} implements ExamSnapshot {
    private int numRows=4,numCols=5,numNonZeros; private SMEntry[] nonZeros=new SMEntry[10];
    private static class SMEntry {int row,col,val;SMEntry(int r,int c,int v){row=r;col=c;val=v;}public String toString(){return row+","+col+"="+val;}}
    private ${actualName}(){int[][] v={{0,1,3},{1,0,4},{1,3,7},{2,2,8},{3,0,2},{3,4,9}};for(int[]x:v)nonZeros[numNonZeros++]=new SMEntry(x[0],x[1],x[2]);}
${method}
    static ${actualName} fixture(){return new ${actualName}();}
    public Object examCall(int c){SMEntry e=nonZeros[c%numNonZeros];setNonZeroValue(e.row,e.col,c%2==0?0:20+c);return null;}
    public String examSnapshot(){return numNonZeros+":"+Arrays.toString(nonZeros);}
}`;
  if (className === "SparseList") return `import java.util.*;
class ${actualName}<E> implements ExamSnapshot {
    private ListElem<E>[] values; private ListElem<E>[] con; private int elementsStored; private int sizeOfList; private E defaultValue;
    private static class ListElem<T>{int position;T data;ListElem(int p,T d){position=p;data=d;}T getData(){return data;}int getPosition(){return position;}void setPosition(int p){position=p;}void setPositon(int p){position=p;}public String toString(){return position+"="+data;}}
    private ${actualName}(){values=(ListElem<E>[])new ListElem[12];con=values;defaultValue=(E)Integer.valueOf(0);int[]p={1,10,12,15};int[]d={2,11,2,3};for(int i=0;i<p.length;i++)values[elementsStored++]=new ListElem<>(p[i],(E)Integer.valueOf(d[i]));sizeOfList=17;}
${method}
    static ${actualName}<Integer> fixture(){return new ${actualName}<>();}
    public Object examCall(int c){${question.id.includes("2012-fall") ? "return get(new int[]{0,1,5,10,12,16}[c%6]);" : question.id.includes("2016-fall") ? "return remove(new int[]{0,1,5,10,12,16}[c%6]);" : question.id.includes("2018-spring") ? "return getExplicitList();" : "removeFirstN(new int[]{0,1,5,10,12,16}[c%6]); return null;"}}
    public String examSnapshot(){return sizeOfList+":"+elementsStored+":"+Arrays.toString(values);}
}`;
  throw new Error(`No array-special support for ${question.id}`);
}

function huffmanSupport(question, className, answer, isOracle, signature) {
  const actualName = isOracle ? `Oracle${className}` : className;
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  const nodeName = /\bHuffNode\b/.test(`${question.reference}${answer}`) ? "HuffNode"
    : /\bMNode\b/.test(`${question.reference}${answer}`) ? "MNode" : "TreeNode";
  const argument = (param) => {
    if (new RegExp(`\\b${nodeName}\\b`).test(param.type)) return "root";
    if (/BitInput/.test(param.type)) return "bits";
    if (/String/.test(param.type) && !/\[\]/.test(param.type)) return '".*-*"';
    return "null";
  };
  const call = `${signature.name}(${signature.params.map(argument).join(", ")})`;
  const bitsFor = (value, width) => Array.from({ length: width }, (_, index) => (value >> (width - index - 1)) & 1);
  const verifyTreeBits = [...bitsFor(3, 8), ...bitsFor(65, 9), ...bitsFor(1, 8), 0,
    ...bitsFor(66, 9), ...bitsFor(2, 8), 1, 0, ...bitsFor(256, 9), ...bitsFor(2, 8), 1, 1];
  const constructorBody = signature.constructor
    ? signature.params.some((param) => /Map/.test(param.type))
      ? `Map<Integer, String> codes = new LinkedHashMap<>(); codes.put(65, "0"); codes.put(66, "10"); codes.put(256, "11");
        return new ${actualName}(codes).examSnapshot();`
      : `String[][] codes = {{"65", "0"}, {"66", "10"}, {"256", "11"}};
        return new ${actualName}(codes).examSnapshot();`
    : `BitInputStream bits = new BitInputStream(${question.id === "cs314-2021-fall-exam-3-q3" ? verifyTreeBits.join(",") : "0,0,0,0,0,0,1,0, 0,1,0,0,0,0,0,1, 0,0,0,0,0,0,0,1, 0"});
        ${/\bvoid\b/.test(signature.returns) ? `${call}; return null;` : `return ${call};`}`;
  return `import java.util.*;

class ${actualName} implements ExamSnapshot {
    private static class ${nodeName} {
        private int value = -1; private int data = -1; private char letter = '?';
        private ${nodeName} left, right, leftChild, rightChild;
        ${nodeName}() { }
        ${nodeName}(int value, int ignored) { this.value = value; data = value; letter = (char) value; }
        ${nodeName} getLeft() { return left; } ${nodeName} getRight() { return right; }
    }
    private ${nodeName} root;
    private int numLeaves;
    private ${actualName}() { root = fixtureRoot(); }
    private static ${nodeName} fixtureRoot() {
        ${nodeName} root = new ${nodeName}();
        root.left = new ${nodeName}(65, 0); root.right = new ${nodeName}();
        root.right.left = new ${nodeName}(66, 0); root.right.right = new ${nodeName}(256, 0);
        root.leftChild = root.left; root.rightChild = root.right;
        return root;
    }
${method}
    static ${actualName} fixture() { return new ${actualName}(); }
    public Object examCall(int caseIndex) { ${constructorBody} }
    private void snapshot(${nodeName} node, List<String> values) {
        if (node == null) { values.add("#"); return; }
        values.add(node.value + ":" + node.letter); snapshot(node.left, values); snapshot(node.right, values);
    }
    public String examSnapshot() { ArrayList<String> values = new ArrayList<>(); snapshot(root, values); return numLeaves + ":" + values; }
}`;
}

function buildHuffmanCases(className) {
  const oracleName = `Oracle${className}`;
  return `    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            ${className} student = ${className}.fixture(); ${oracleName} oracle = ${oracleName}.fixture();
            final int currentCase = caseIndex;
            Outcome studentOutcome = Outcome.capture(() -> student.examCall(currentCase));
            Outcome oracleOutcome = Outcome.capture(() -> oracle.examCall(currentCase));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " state");
        }
    }`;
}

function hashSupport(question, className, answer, isOracle, signature) {
  const actualName = isOracle ? `Oracle${className}` : className;
  const generic = new RegExp(`class\\s+${className}\\s*<`).test(question.reference);
  const chained = /\bNode(?:<E>)?\[\]\s+con/.test(question.reference) || className === "LinkedHashSet" || question.id === "cs314-2023-spring-exam-3-q4";
  const linkedSet = className === "LinkedHashSet";
  const method = isOracle ? replaceType(answer, className, actualName) : marker;
  const resizeHelper = signature.name === "resize" || !/\bresize\s*\(/.test(answer) ? "" : `
    private void resize() { con = Arrays.copyOf(con, con.length * 2); }`;
  const fieldType = chained ? `Node${generic ? "<E>" : ""}[]` : `${generic ? "E" : "Object"}[]`;
  const hashValueArg = signature.name === "add" ? "caseIndex % 2 == 0 ? Integer.valueOf(9) : Integer.valueOf(2)" : "Integer.valueOf(2)";
  const args = signature.params.map((param) => /\bE\b/.test(param.type) ? `(E) (${hashValueArg})` : /Object/.test(param.type) ? hashValueArg : "null").join(", ");
  const voidResult = /\bvoid\b/.test(signature.returns);
  return `import java.util.*;

class ${actualName}${generic ? "<E>" : ""} implements ExamSnapshot {
    private static final Object EMPTY = new Object();
    private ${fieldType} con;
    private int size;
    private double LOAD_LIMIT = 0.75;
    private Node${generic ? "<E>" : ""} header;
    private static class Node<T> {
        private T data; private Node<T> prev, next, listNode;
        Node() { } Node(T data, Node<T> next) { this.data = data; this.next = next; }
    }
    private ${actualName}() {
        con = (${fieldType}) new ${chained ? "Node" : "Object"}[8];
        header = new Node<>();
    }
    ${resizeHelper}
${method}
    static ${generic ? `${actualName}<Integer>` : actualName} fixture() {
        ${actualName} table = new ${actualName}();
        ${linkedSet
          ? `Node iterationTail = table.header;
        for (int value : new int[]{1,2,3}) {
            int index = Math.abs(Integer.valueOf(value).hashCode()) % table.con.length;
            Node bucketHeader = new Node(); Node dataNode = new Node(value, null);
            bucketHeader.next = dataNode; dataNode.prev = bucketHeader; table.con[index] = bucketHeader;
            Node listNode = new Node(value, null); iterationTail.next = listNode; listNode.prev = iterationTail; iterationTail = listNode; dataNode.listNode = listNode;
            table.size++;
        }`
          : chained
          ? `for (int value : new int[]{1,2,3}) {
            int index = Math.abs(Integer.valueOf(value).hashCode()) % table.con.length;
            Node bucketNode = new Node(value, table.con[index]); table.con[index] = bucketNode; table.size++;
        }`
          : `for (int value : new int[]{1,2,3}) {
            int index = Math.abs(Integer.valueOf(value).hashCode()) % table.con.length;
            while (table.con[index] != null) index = (index + 1) % table.con.length;
            table.con[index] = value; table.size++;
        }`}
        return table;
    }
    public Object examCall(int caseIndex) {
        Object result = ${voidResult ? `null; ${signature.name}(${args});` : `${signature.name}(${args});`}
        return result;
    }
    private String nodeString(Node node) {
        ArrayList<Object> values = new ArrayList<>(); int guard = 0;
        while (node != null && guard++ < 50) { values.add(node.data); node = node.next; }
        return values.toString();
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        for (Object item : con) values.add(item == EMPTY ? "<EMPTY>" : item instanceof Node ? nodeString((Node) item) : String.valueOf(item));
        return size + ":" + values + ":" + nodeString(header);
    }
}`;
}

function buildHashCases(className, generic) { return buildStructureCases(className, generic); }

function buildPlainCases(question, signature) {
  const argument = (param, index, oracle) => {
    const prefix = oracle ? "o" : "s";
    const type = param.type;
    const name = param.name.toLowerCase();
    if (/BitInput/.test(type)) return `${prefix}Bits`;
    if (/BitOutput/.test(type)) return `${prefix}Output`;
    if (/String\[\]\[\]/.test(type)) return `${prefix}Grid${index ? "2" : ""}`;
    if (/String\[\]/.test(type)) return `${prefix}Words`;
    if (/int\[\]\[\]/.test(type)) return `${prefix}Matrix`;
    if (/int\[\]/.test(type) && !/Map/.test(type)) return `${prefix}Array${index ? "2" : ""}`;
    if (/Map\s*</.test(type)) return `${prefix}Map${index ? "2" : ""}`;
    if (/Set\s*</.test(type)) return /Airline/.test(type) ? `${prefix}Airlines` : `${prefix}Set`;
    if (/Airline/.test(type)) return index % 2 ? "destinationAirline" : "startAirline";
    if (/boolean\[\]\[\]/.test(type)) return `${prefix}BoolMatrix`;
    if (/boolean\[\]/.test(type)) return `${prefix}Flags`;
    if (/ArrayList\s*<\s*Integer\s*>/.test(type)) return `${prefix}Ints${index % 2 ? "2" : ""}`;
    if (/(?:ArrayList|List)\s*<\s*String\s*>/.test(type)) return `${prefix}Strings${index % 2 ? "2" : ""}`;
    if (/Stack314|Stack\s*</.test(type)) return `${prefix}Stack`;
    if (/Queue314|Queue\s*</.test(type)) return `${prefix}Queue`;
    if (/Position/.test(type)) return index % 2 ? "targetPosition" : "startPosition";
    if (/Point/.test(type)) return "point";
    if (/Color\[\]/.test(type)) return "colors";
    if (/ConnectFourBoard/.test(type)) return `${prefix}ConnectFour`;
    if (/BuildingMap/.test(type)) return `${prefix}BuildingMap`;
    if (/Scanner/.test(type)) return `${prefix}Scanner`;
    if (/Board/.test(type)) return `${prefix}BoardFixture`;
    if (/Rectangle\[\]/.test(type)) return "rectangles";
    if (/Rectangle/.test(type)) return "goalRectangle";
    if (/String/.test(type)) return index % 2 ? '"B"' : "target";
    if (/Object/.test(type)) return "target";
    if (/boolean/.test(type)) return "true";
    if (/char/.test(type)) return /goal|cur/.test(name) ? "'r'" : (index % 2 ? "'b'" : "'r'");
    if (/double/.test(type)) return "1.5";
    if (/int/.test(type)) {
      if (/row|col/.test(name)) return "currentCase % 3";
      if (/start|low/.test(name)) return "start";
      if (/stop|end|high/.test(name)) return "stop";
      return "amount";
    }
    return "null";
  };
  const studentArgs = signature.params.map((param, index) => argument(param, index, false)).join(", ");
  const oracleArgs = signature.params.map((param, index) => argument(param, index, true)).join(", ");
  const studentReceiver = signature.static ? "StudentSolution" : "student";
  const oracleReceiver = signature.static ? "OracleStudentSolution" : "oracle";
  const invokedName = signature.visibility === "private" ? "examCall" : signature.name;
  const invokedStudentReceiver = signature.visibility === "private" ? "student" : studentReceiver;
  const invokedOracleReceiver = signature.visibility === "private" ? "oracle" : oracleReceiver;
  const studentCall = `${invokedStudentReceiver}.${invokedName}(${studentArgs})`;
  const oracleCall = `${invokedOracleReceiver}.${invokedName}(${oracleArgs})`;
  const voidResult = /\bvoid\b/.test(signature.returns);
  const targetFixture = question.id === "cs314-2012-fall-exam-2-q3"
    ? `(new String[]{"()", "(", "[", "([]", "([)]", "()[[]"})[caseIndex]`
    : question.id === "cs314-2012-fall-exam-2-q5"
      ? `(new String[]{"CAT", "CAR", "TEN", "ARE", "CART", "ZZ"})[caseIndex]`
    : question.id === "cs314-2021-fall-exam-2-q4"
      ? `(new String[]{"at", "ate", "late", "plate", "rate", "crate"})[caseIndex]`
      : `caseIndex % 2 == 0 ? "A" : "B"`;
  const setFixture = question.id === "cs314-2021-fall-exam-2-q4"
    ? `new LinkedHashSet<>(Arrays.asList("a", "at", "ate", "late", "plate", "rate"))`
      : `new LinkedHashSet<>(Arrays.asList("A", "C"))`;
  const mapFixture = question.id === "cs314-2012-fall-exam-2-q2" || question.id === "cs314-2016-spring-exam-2-q2"
    ? `put("A", new ArrayList<>(Arrays.asList("x", "y"))); put("B", new ArrayList<>(Arrays.asList("y")));`
    : question.id === "cs314-2017-fall-final-q4"
      ? `put(123, new int[]{1,457,755,900}); put(222, new int[]{1}); put(335, new int[]{2}); put(457, new int[]{1,335,900}); put(755, new int[]{3,222}); put(900, new int[]{4});`
    : question.id === "cs314-2014-spring-final-q4"
      ? `put("0", 65); put("10", 66); put("11", 256);`
    : question.id === "cs314-2014-spring-exam-2-q4"
      ? `put("A", new ArrayList<>(Arrays.asList("B"))); put("B", new ArrayList<>(Arrays.asList("A", "C"))); put("C", new ArrayList<>(Arrays.asList("B")));`
    : question.id === "cs314-2015-spring-exam-2-q4" || question.id === "cs314-2023-spring-exam-2-q3" || question.id === "cs314-2024-spring-exam-2-q3"
      ? `put("A", new LinkedHashSet<>(Arrays.asList("x", "y"))); put("B", new LinkedHashSet<>(Arrays.asList("y", "z"))); put("C", new LinkedHashSet<>(Arrays.asList("x")));`
      : question.id === "cs314-2017-spring-exam-2-q4"
        ? `put("A", new Point(0, 0)); put("B", new Point(1, 0)); put("C", new Point(10, 0));`
      : question.id === "cs314-2018-spring-exam-2-q4"
        ? `put("Ada", new LinkedHashMap<String, Double>() {{ put("CS", 4.0); put("Math", 3.5); }}); put("Bea", new LinkedHashMap<String, Double>() {{ put("CS", 3.0); }});`
        : question.id === "cs314-2021-fall-exam-2-q2"
          ? `put("Book1", new ArrayList<>(Arrays.asList("Ada"))); put("Book2", new ArrayList<>(Arrays.asList("Bea", "Ada")));`
          : `put("A", 2); put("B", 3); put("C", 1);`;
  const binaryBits = (value, count) => Array.from({ length: count }, (_, index) => (value >> (count - index - 1)) & 1);
  const bitValues = question.id === "cs314-2014-spring-final-q4"
    ? [0, 1, 0, 1, 1]
    : question.id === "cs314-2017-fall-final-q6"
      ? [1, 1, 1, 0, 0, 1]
      : question.id === "cs314-2018-fall-final-q5"
        ? [...binaryBits(0, 6), ...binaryBits(3, 32), 1, 1, 0, 1, 1, 0]
        : question.id === "cs314-2018-spring-final-q5"
          ? [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0]
          : question.id === "cs314-2023-fall-exam-3-q4"
            ? [...binaryBits(3, 5), ...binaryBits(10, 32), 0, ...binaryBits(2, 3), 1, ...binaryBits(1, 3)]
            : [1, 0, 1, 1, 0, 0, 1, 0];
  return `    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            final int currentCase = caseIndex;
            StudentSolution student = new StudentSolution();
            OracleStudentSolution oracle = new OracleStudentSolution();
            int[] base = caseIndex % 2 == 0 ? new int[]{1, 2, 1, 3, -1} : new int[]{5, 4, 3, 2, 1};
            int[] sArray = Arrays.copyOf(base, base.length);
            int[] oArray = Arrays.copyOf(base, base.length);
            int[] sArray2 = new int[]{1, 2, 3, 4, 5};
            int[] oArray2 = Arrays.copyOf(sArray2, sArray2.length);
            int[][] sMatrix = {{1, 2}, {3, 4}};
            int[][] oMatrix = {{1, 2}, {3, 4}};
            boolean[][] sBoolMatrix = new boolean[3][3];
            boolean[][] oBoolMatrix = new boolean[3][3];
            String[] sWords = {"A", "W", "B", "L", "A", "W"};
            String[] oWords = Arrays.copyOf(sWords, sWords.length);
            boolean[] sFlags = {true, false, true, true, false, true};
            boolean[] oFlags = Arrays.copyOf(sFlags, sFlags.length);
            String[][] sGrid = {{"Dayanny", "M10", "T9"}, {"Aish", "M1"}, {"Hailey", "T9"}, {"Ivan", "M1"}};
            String[][] oGrid = {{"Dayanny", "M10", "T9"}, {"Aish", "M1"}, {"Hailey", "T9"}, {"Ivan", "M1"}};
            String[][] sGrid2 = {{"M10", null}, {"M1", null}, {"M1", null}, {"T9", null}};
            String[][] oGrid2 = {{"M10", null}, {"M1", null}, {"M1", null}, {"T9", null}};
            ArrayList<Integer> sInts = new ArrayList<>(Arrays.asList(1, 2, 3, 2));
            ArrayList<Integer> oInts = new ArrayList<>(sInts);
            ArrayList<Integer> sInts2 = new ArrayList<>(Arrays.asList(2, 3, 4));
            ArrayList<Integer> oInts2 = new ArrayList<>(sInts2);
            ArrayList<String> sStrings = new ArrayList<>(Arrays.asList("A", "AB", "B", "BA"));
            ArrayList<String> oStrings = new ArrayList<>(sStrings);
            ArrayList<String> sStrings2 = new ArrayList<>(Arrays.asList("A", "B", "C"));
            ArrayList<String> oStrings2 = new ArrayList<>(sStrings2);
            Map sMap = new LinkedHashMap() {{ ${mapFixture} }};
            Map oMap = ${question.id === "cs314-2017-fall-final-q4" ? `new LinkedHashMap() {{ ${mapFixture} }}` : "new LinkedHashMap(sMap)"};
            Map sMap2 = new LinkedHashMap();
            Map oMap2 = new LinkedHashMap();
            ${question.id === "cs314-2018-fall-exam-2-q3" ? `sMap2.put("A", 4); sMap2.put("B", -2); sMap2.put("D", 9); oMap2.putAll(sMap2);` : ""}
            Set<String> sSet = ${setFixture};
            Set<String> oSet = new LinkedHashSet<>(sSet);
            Set<Airline> sAirlines = new LinkedHashSet<>();
            Set<Airline> oAirlines = new LinkedHashSet<>();
            Stack314 sStack = new Stack314(); sStack.addAll(caseIndex % 2 == 0 ? Arrays.asList(1, 4, 2, 3) : Arrays.asList(5, 4, 3, 2));
            Stack314 oStack = (Stack314) sStack.clone();
            Queue314 sQueue = new Queue314(); sQueue.addAll(${question.id === "cs314-2013-spring-exam-2-q4" ? "Arrays.asList(\"A\", \"B\", \"A\", \"C\", \"A\")" : "caseIndex % 2 == 0 ? Arrays.asList(4, 3, 2, 1) : Arrays.asList(3, 3, 2, 1)"});
            Queue314 oQueue = new Queue314(); oQueue.addAll(sQueue);
            Position startPosition = new Position(0, 0), targetPosition = new Position(1, 2);
            Point point = new Point(0, 0);
            Airline startAirline = new Airline("A"), destinationAirline = new Airline("B");
            startAirline.destinations.add(destinationAirline);
            Rectangle[] rectangles = {new Rectangle(), new Rectangle(), new Rectangle()};
            Rectangle goalRectangle = rectangles[2];
            BitInputStream sBits = new BitInputStream(${bitValues.join(", ")});
            BitInputStream oBits = new BitInputStream(${bitValues.join(", ")});
            BitOutputStream sOutput = new BitOutputStream();
            BitOutputStream oOutput = new BitOutputStream();
            Color[] colors = {Color.RED, Color.GREEN, Color.BLUE};
            Board sBoardFixture = Board.fixture(caseIndex), oBoardFixture = Board.fixture(caseIndex);
            ConnectFourBoard sConnectFour = ConnectFourBoard.fixture(caseIndex), oConnectFour = ConnectFourBoard.fixture(caseIndex);
            BuildingMap sBuildingMap = BuildingMap.fixture(caseIndex), oBuildingMap = BuildingMap.fixture(caseIndex);
            String scannerText = " should not be here \\n he should not be here \\n now now have no fear \\n";
            Scanner sScanner = new Scanner(scannerText);
            Scanner oScanner = new Scanner(scannerText);
            String target = ${targetFixture};
            int amount = ${question.id === "cs314-2017-fall-final-q4" ? "new int[]{755, 800, -335, -222, -123, -999}[caseIndex]" : "caseIndex + 1"};
            int start = caseIndex % 2;
            int stop = Math.max(start, Math.min(base.length, start + amount));
            Outcome studentOutcome = Outcome.capture(() -> ${voidResult ? `{ ${studentCall}; return null; }` : studentCall});
            Outcome oracleOutcome = Outcome.capture(() -> ${voidResult ? `{ ${oracleCall}; return null; }` : oracleCall});
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(normalize(sArray), normalize(oArray), "case " + caseIndex + " array state");
            checkEqual(normalize(sArray2), normalize(oArray2), "case " + caseIndex + " second array state");
            checkEqual(normalize(sBoolMatrix), normalize(oBoolMatrix), "case " + caseIndex + " boolean matrix state");
            checkEqual(normalize(sGrid), normalize(oGrid), "case " + caseIndex + " first string grid state");
            checkEqual(normalize(sGrid2), normalize(oGrid2), "case " + caseIndex + " second string grid state");
            checkEqual(sInts, oInts, "case " + caseIndex + " integer list state");
            checkEqual(sStrings, oStrings, "case " + caseIndex + " string list state");
            checkEqual(normalize(sMap), normalize(oMap), "case " + caseIndex + " map state");
            checkEqual(normalize(sMap2), normalize(oMap2), "case " + caseIndex + " second map state");
            checkEqual(sSet, oSet, "case " + caseIndex + " set state");
            checkEqual(sStack, oStack, "case " + caseIndex + " stack state");
            checkEqual(sQueue, oQueue, "case " + caseIndex + " queue state");
            checkEqual(sBits.toString(), oBits.toString(), "case " + caseIndex + " input state");
            checkEqual(sOutput, oOutput, "case " + caseIndex + " output state");
            checkEqual(Arrays.toString(sBoardFixture.marbles), Arrays.toString(oBoardFixture.marbles), "case " + caseIndex + " board state");
            checkEqual(Arrays.toString(sConnectFour.cells), Arrays.toString(oConnectFour.cells), "case " + caseIndex + " connect four state");
        }
    }`;
}

function classNameFor(question, fallback) {
  const names = [...question.reference.matchAll(/\b(?:public\s+)?class\s+([A-Z]\w*)/g)].map((match) => match[1]);
  return names.find((name) => !/^(Node|Vertex|Edge|NameRecord|TreeNode|HuffNode)$/.test(name)) ?? fallback;
}

function argumentPlan(signature, className, oracle = false) {
  const prefix = oracle ? "o" : "s";
  return signature.params.map((param, index) => {
    const type = param.type;
    const name = param.name.toLowerCase();
    if (new RegExp(`\\b${className}\\b`).test(type)) return `${prefix}Other`;
    if (new RegExp(`\\b${className}\\b`).test(type)) return `${prefix}Other`;
    if (/\bint\[\]\[\]/.test(type)) return "matrixArg";
    if (/\bint\[\]/.test(type)) return "intArrayArg";
    if (/\b(?:E|T|Object|String)\b/.test(type)) return index % 2 ? '"B"' : "target";
    if (/ArrayList\s*<\s*Integer\s*>/.test(type)) return "vectorArg";
    if (/\bboolean\b/.test(type)) return "true";
    if (/\bint\b/.test(type)) {
      if (/stop|end|high/.test(name)) return "stop";
      if (/start|low/.test(name)) return "start";
      if (/index|position|loc/.test(name)) return "index";
      if (/n|num|count|amount|freq|goal|capacity/.test(name)) return "amount";
      return "amount";
    }
    return "null";
  });
}

function buildCases(question, signature, className, family) {
  const oracleName = `Oracle${className}`;
  if (signature.constructor && family === "generic-list") {
    return `    private static void runCases() {
        String[][] fixtures = {{}, {"A"}, {"A", "B"}, {"A", "B", "C"}};
        int caseIndex = 0;
        for (String[] fixture : fixtures) {
            ${className}<String> source = ${className}.of(fixture);
            ${oracleName}<String> oracleSource = ${oracleName}.of(fixture);
            int[] counts = new int[fixture.length];
            for (int i = 0; i < counts.length; i++) counts[i] = (i + caseIndex) % 3;
            ${className}<String> student = new ${className}<>(source, counts);
            ${oracleName}<String> oracle = new ${oracleName}<>(oracleSource, counts);
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex);
            caseIndex++;
        }
    }`;
  }
  const receiverStudent = signature.static ? className : "student";
  const receiverOracle = signature.static ? oracleName : "oracle";
  const studentArgs = argumentPlan(signature, className, false).join(", ");
  const oracleArgs = argumentPlan(signature, className, true).join(", ");
  const voidResult = /\bvoid\b/.test(signature.returns);
  const callStudent = `${receiverStudent}.${signature.name}(${studentArgs})`;
  const callOracle = `${receiverOracle}.${signature.name}(${oracleArgs})`;
  const studentCall = voidResult ? `{ ${callStudent}; return null; }` : callStudent;
  const oracleCall = voidResult ? `{ ${callOracle}; return null; }` : callOracle;
  const studentFactory = family === "matrix" ? `${className}.of(fixture)` : `${className}.of(fixture)`;
  const oracleFactory = family === "matrix" ? `${oracleName}.of(fixture)` : `${oracleName}.of(fixture)`;
  const otherFixture = family === "matrix" ? "otherFixture" : "otherFixture";
  const genericFamily = family !== "matrix";
  const fixtures = family === "matrix"
    ? `int[][][] fixtures = {
            {{7}}, {{1, 2}, {0, 3}}, {{1, 0}, {0, 2}}, {{0, 4}, {3, 0}},
            {{1, 2, 3}, {4, 5, 6}}, {{3, 0, 0}, {0, -2, 0}, {0, 0, 5}}
        };`
    : `String[][] fixtures = {
            {}, {"A"}, {"A", "B"}, {"A", "B", "A", "C", "B"},
            {"B", "A", "A", "A", "C"}, {"A", "A", "A", "A"}, {"B", "C", "A", "A"}
        };`;
  const extraState = signature.params.some((param) => new RegExp(`\\b${className}\\b`).test(param.type))
    ? `checkEqual(studentOther.examSnapshot(), oracleOther.examSnapshot(), "case " + caseIndex + " argument state");`
    : "";
  return `    private static void runCases() {
        ${fixtures}
        int caseIndex = 0;
        for (${family === "matrix" ? "int[][]" : "String[]"} fixture : fixtures) {
            ${family === "matrix"
              ? "int[][] otherFixture = fixture;"
              : "String[] otherFixture = new String[fixture.length]; for (int oi = 0; oi < fixture.length; oi++) otherFixture[oi] = (oi + caseIndex) % 2 == 0 ? \"Z\" : fixture[oi];"}
            ${className}${genericFamily ? "<String>" : ""} student = ${studentFactory};
            ${oracleName}${genericFamily ? "<String>" : ""} oracle = ${oracleFactory};
            ${className}${genericFamily ? "<String>" : ""} studentOther = ${className}.of(${otherFixture});
            ${oracleName}${genericFamily ? "<String>" : ""} oracleOther = ${oracleName}.of(${otherFixture});
            ${className}${genericFamily ? "<String>" : ""} sOther = studentOther;
            ${oracleName}${genericFamily ? "<String>" : ""} oOther = oracleOther;
            ${question.id === "cs314-2019-fall-exam-2-q2" ? "student.examConvergeWith(studentOther); oracle.examConvergeWith(oracleOther);" : ""}
            int length = fixture.length;
            String target = ${question.id === "cs314-2014-spring-exam-2-q3" ? '"A"' : 'caseIndex % 2 == 0 ? "A" : "Z"'};
            int start = length == 0 ? 0 : Math.min(1, length - 1);
            int stop = Math.max(start, length);
            int index = length == 0 ? 0 : length - 1;
            int amount = length == 0 ? 1 : Math.max(1, Math.min(2, length));
            int[] intArrayArg = {1, 2, 1, 3, 2};
            int[][] matrixArg = {{1, 0}, {0, 2}};
            ArrayList<Integer> vectorArg = new ArrayList<>();
            for (int vectorIndex = 0; vectorIndex < (fixture.length == 0 ? 0 : fixture.length); vectorIndex++) {
                vectorArg.add(vectorIndex + 2);
            }
            Outcome studentOutcome = Outcome.capture(() -> ${studentCall});
            Outcome oracleOutcome = Outcome.capture(() -> ${oracleCall});
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " receiver state");
            ${extraState}
            caseIndex++;
        }
    }`;
}

function classify(question) {
  const title = question.title.toLowerCase();
  if (question.id === "cs314-2014-spring-final-q6") return "tree";
  if (new Set([
    "cs314-2016-fall-exam-1-q6", "cs314-2018-spring-exam-1-q6", "cs314-2019-fall-exam-1-q5",
    "cs314-2017-spring-exam-1-q6", "cs314-2023-fall-exam-1-q4", "cs314-2024-spring-exam-1-q4",
    "cs314-2013-spring-final-q2",
    "cs314-2012-fall-exam-1-q5",
    "cs314-2016-spring-exam-1-q4",
    "cs314-2011-fall-exam-2-q4",
    "cs314-2021-fall-exam-3-q5",
    "cs314-2024-spring-exam-2-q2",
    "cs314-2018-fall-final-q6",
    "cs314-2018-spring-final-q4",
    "cs314-2019-spring-final-q5",
    "cs314-2011-fall-final-q4",
    "cs314-2012-fall-final-q4",
    "cs314-2011-fall-exam-2-q5",
  ]).has(question.id)) return "array-special";
  if (/class\s+ArrayMap\b/.test(question.reference)) return "array-map";
  if (/class\s+(?:Bag|ArraySet)\b/.test(question.reference) && question.id !== "cs314-2016-spring-exam-1-q4") return "array-collection";
  if (/class\s+(?:Heap|IntMinHeap)\b/.test(question.reference)) return "heap";
  if (/Huffman(?:Code)?Tree|MorseCodeTree/.test(question.reference)) return "huffman-tree";
  if (
    /class\s+(?:HashTable|Hashtable|LinkedHashSet)\b/.test(question.reference) &&
    !/HashIterator/.test(question.reference)
  ) return "hash";
  if (title.includes("genericlist") || /class\s+GenericList\b/.test(question.reference)) return "generic-list";
  if (title.includes("mathmatrix") || title.includes("math matrix") || /class\s+MathMatrix\b/.test(question.reference)) return "matrix";
  if (
    /linked\s*lists?/i.test(question.title) ||
    /\b(?:public\s+)?class\s+(?:LinkedList314|LL314|DoublyLinkedList|LinkedList)\b/.test(question.reference)
  ) {
    const linkedClass = classNameFor(question, "LinkedList314");
    if (linkedClass === "LinkedHashSet") return null;
    if (
      /^(?:LinkedList314|LinkedList|LL314)$/.test(linkedClass) &&
      !/\bheader\b/.test(`${question.reference}\n${question.answer}`) &&
      question.id !== "cs314-2017-spring-final-q2"
    ) return "linked-list";
    if (!/SparseList|LinkedBigInteger|HashTable|LinkedMatrix/.test(linkedClass)) return "linked-special";
    return null;
  }
  if (/class\s+(?:SortedSet|SortedIntList|SortedLinkedList|LinkedIntList)\b/.test(question.reference))
    return "linked-special";
  if (
    /(?:binary|red black|\btrees?\b)/i.test(question.title) &&
    !/huffman|encoding|morse|trie/i.test(question.title) &&
    !question.stub.includes("public HuffmanTree(")
  ) return "tree";
  if (/class\s+\w*Tree\b/.test(question.reference) && /\bTNode\b/.test(question.reference)) return "tree";
  if (/\bgraphs?\b/i.test(question.title)) return "graph";
  if (/\branks\b/.test(question.answer) && /name\s*record/i.test(question.title)) return "name-record";
  if (/baby names|namesurfer|\bNames class\b|\bBaby Names\b/i.test(question.title) || /class\s+Names\b/.test(question.reference)) return "names";
  const plainQuestions = new Set([
    "cs314-2012-fall-exam-2-q3",
    "cs314-2016-fall-final-q6",
    "cs314-2016-spring-exam-2-q6",
    "cs314-2017-fall-exam-2-q5",
    "cs314-2019-fall-final-q6",
    "cs314-2021-fall-exam-2-q4",
    "cs314-2012-fall-exam-2-q2",
    "cs314-2014-spring-exam-2-q2",
    "cs314-2015-spring-exam-2-q2",
    "cs314-2015-spring-exam-2-q4",
    "cs314-2016-fall-exam-1-q5",
    "cs314-2016-spring-exam-2-q2",
    "cs314-2016-spring-exam-2-q4",
    "cs314-2016-spring-final-q2",
    "cs314-2017-spring-exam-2-q3",
    "cs314-2017-spring-exam-2-q4",
    "cs314-2018-fall-exam-2-q3",
    "cs314-2018-spring-exam-2-q3",
    "cs314-2018-spring-exam-2-q4",
    "cs314-2019-fall-exam-2-q3",
    "cs314-2019-spring-exam-2-q4",
    "cs314-2021-fall-exam-2-q2",
    "cs314-2022-spring-exam-2-q2",
    "cs314-2022-spring-exam-2-q5",
    "cs314-2023-fall-exam-2-q2",
    "cs314-2023-spring-exam-2-q3",
    "cs314-2023-spring-exam-2-q4",
    "cs314-2024-spring-exam-2-q3",
    "cs314-2012-fall-exam-2-q5",
    "cs314-2013-spring-exam-2-q5",
    "cs314-2014-spring-exam-2-q4",
    "cs314-2018-fall-exam-2-q6",
    "cs314-2018-spring-exam-2-q5",
    "cs314-2023-fall-exam-2-q4",
    "cs314-2024-spring-exam-2-q4",
    "cs314-2014-spring-final-q4",
    "cs314-2017-fall-final-q6",
    "cs314-2018-fall-final-q5",
    "cs314-2018-spring-final-q5",
    "cs314-2023-fall-exam-3-q4",
    "cs314-2017-fall-exam-1-q5",
    "cs314-2013-spring-exam-2-q4",
    "cs314-2017-fall-final-q4",
    "cs314-2019-spring-exam-1-q4",
    "cs314-2016-fall-exam-2-q6",
    "cs314-2017-spring-exam-2-q5",
    "cs314-2019-fall-exam-2-q5",
    "cs314-2016-fall-exam-2-q4",
  ]);
  if (plainQuestions.has(question.id)) return "plain";
  return null;
}

let generated = 0;
const skipped = [];

async function generateSparseMatrixToStringHarness(question) {
  const dir = path.join(questionsRoot, question.id);
  const student = `import java.util.*;

class SMEntry {
    private final int row, col, value;
    SMEntry(int row, int col, int value) { this.row = row; this.col = col; this.value = value; }
    public int getRow() { return row; }
    public int getCol() { return col; }
    public int getVal() { return value; }
}

class SparseMatrix {
    private final int numRows;
    private final int numCols;
    private final ArrayList<SMEntry> nonZeroValues = new ArrayList<>();

    private SparseMatrix(int[][] values) {
        numRows = values.length;
        numCols = values[0].length;
        for (int row = 0; row < numRows; row++)
            for (int col = 0; col < numCols; col++)
                if (values[row][col] != 0) nonZeroValues.add(new SMEntry(row, col, values[row][col]));
    }

    static SparseMatrix of(int[][] values) { return new SparseMatrix(values); }

${marker}
}
`;
  const runner = `import java.util.*;

public class TestRunner {
    private static int passed;
    private static int total;

    private static void check(String actual, String expected, String name) {
        total++;
        if (Objects.equals(actual, expected)) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            System.out.println("FAIL " + name + " expected=" + expected + " actual=" + actual);
        }
    }

    public static void main(String[] args) {
        check(SparseMatrix.of(new int[][] {{7}}).toString(), "7_\\n", "one value");
        check(SparseMatrix.of(new int[][] {{1, 2}, {0, 3}}).toString(), "1_2_\\n0_3_\\n", "mixed 2x2");
        check(SparseMatrix.of(new int[][] {{0, 4}, {3, 0}}).toString(), "0_4_\\n3_0_\\n", "zeros around values");
        check(SparseMatrix.of(new int[][] {{1, 2, 3}, {4, 5, 6}}).toString(), "1_2_3_\\n4_5_6_\\n", "dense matrix");
        check(SparseMatrix.of(new int[][] {{3, 0, 0}, {0, -2, 0}, {0, 0, 5}}).toString(), "3_0_0_\\n0_-2_0_\\n0_0_5_\\n", "sparse negative value");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "SparseMatrix.java"), student);
  await writeFile(path.join(dir, "TestRunner.java"), runner);
}

async function generateBagIteratorHarness(question) {
  const dir = path.join(questionsRoot, question.id);
  const student = `import java.util.*;

class Bag<E> implements Iterable<E> {
    private int size;
    private E[] container;

    @SuppressWarnings("unchecked")
    private Bag(E[] values) {
        container = (E[]) new Object[Math.max(3, values.length * 2 + 1)];
        for (int index = 0; index < values.length; index++) {
            container[index * 2] = values[index];
            size++;
        }
    }

    @SafeVarargs
    static <T> Bag<T> of(T... values) { return new Bag<T>(values); }
    int examSize() { return size; }
    public Iterator<E> iterator() { return new BagIterator(); }

${marker}
}
`;
  const runner = `import java.util.*;

public class TestRunner {
    private static int passed;
    private static int total;

    private static void check(boolean condition, String name) {
        total++;
        if (condition) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            System.out.println("FAIL " + name);
        }
    }

    private static boolean throwsType(Runnable action, Class<? extends Throwable> type) {
        try { action.run(); return false; }
        catch (Throwable error) { return type.isInstance(error); }
    }

    public static void main(String[] args) {
        Bag<String> bag = Bag.of("A", "B", "A");
        Iterator<String> iterator = bag.iterator();
        check(iterator.hasNext(), "initial hasNext");
        check("A".equals(iterator.next()), "first value through gap-aware iterator");
        iterator.remove();
        check(bag.examSize() == 2, "remove decrements bag size");
        check(throwsType(iterator::remove, IllegalStateException.class), "double remove rejected");
        check("B".equals(iterator.next()), "second value");
        check("A".equals(iterator.next()), "third value");
        check(!iterator.hasNext(), "exhausted iterator");
        check(throwsType(iterator::next, NoSuchElementException.class), "next past end rejected");
        Bag<Integer> empty = Bag.of();
        check(!empty.iterator().hasNext(), "empty bag");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "Bag.java"), student);
  await writeFile(path.join(dir, "TestRunner.java"), runner);
}

for (const question of questions) {
  await rm(path.join(questionsRoot, question.id), { recursive: true, force: true });
}
for (const question of questions) {
  if (question.id === "cs314-2014-spring-exam-1-q4") {
    await generateSparseMatrixToStringHarness(question);
    generated++;
    continue;
  }
  if (question.id === "cs314-2015-spring-exam-1-q4") {
    await generateBagIteratorHarness(question);
    generated++;
    continue;
  }
  const family = classify(question);
  if (!family) {
    skipped.push(question.id);
    continue;
  }
  const signature = signatureOf(question) ?? (family === "array-special"
    ? { visibility: "private", static: false, returns: "void", name: "examCall", params: [], constructor: false }
    : null);
  if (!signature) {
    skipped.push(question.id);
    continue;
  }
  if (process.argv.includes("--report")) console.log(question.id, signature);
  const className = family === "generic-list"
    ? "GenericList"
    : family === "matrix"
      ? classNameFor(question, "MathMatrix")
      : family === "linked-list"
        ? classNameFor(question, "LinkedList314")
        : family === "linked-special"
          ? classNameFor(question, "LinkedList314")
        : family === "names"
          ? "Names"
        : family === "name-record"
            ? "NameRecord314"
            : family === "tree"
              ? treeClassName(question)
              : family === "graph"
                ? classNameFor(question, "Graph")
                : family === "array-map"
                  ? "ArrayMap"
                  : family === "array-collection"
                    ? classNameFor(question, "Bag")
                    : family === "heap"
                      ? classNameFor(question, "Heap")
                      : family === "huffman-tree"
                        ? classNameFor(question, "HuffmanTree")
                        : family === "hash"
                          ? classNameFor(question, "HashTable")
        : family === "array-special"
          ? question.id === "cs314-2011-fall-exam-2-q5" ? "DicePuzzle"
            : /cs314-201[12]-fall-final-q4/.test(question.id) ? "ExamHashtable"
            : question.id === "cs314-2019-spring-final-q5" ? "Decoder"
            : question.id === "cs314-2018-spring-final-q4" ? "ExamHashMap"
            : question.id === "cs314-2018-fall-final-q6" ? "Trie"
            : question.id === "cs314-2024-spring-exam-2-q2" ? "LinkedMatrix"
            : question.id === "cs314-2021-fall-exam-3-q5" ? "LinkedBigInteger"
            : question.id === "cs314-2011-fall-exam-2-q4" ? "FuzzySet"
            : question.id === "cs314-2016-spring-exam-1-q4" ? "Bag"
            : question.id === "cs314-2013-spring-final-q2" ? "UnsortedSet"
            : question.id.includes("2017-spring") ? "SparseMatrix"
            : question.id.includes("2023-fall") ? "RunLengthList"
              : question.id.includes("2024-spring") ? "MultiSet"
                : "SparseList"
        : "StudentSolution";
  const support = family === "generic-list"
    ? genericListSupport
    : family === "matrix"
      ? matrixSupport
      : family === "linked-list"
        ? linkedListSupport
        : family === "linked-special"
          ? linkedSpecialSupport
        : family === "names"
          ? namesSupport
          : family === "name-record"
            ? nameRecordSupport
            : family === "tree"
              ? treeSupport
              : family === "graph"
                ? graphSupport
                : family === "array-map"
                  ? arrayMapSupport
                  : family === "array-collection"
                    ? arrayCollectionSupport
                    : family === "heap"
                      ? heapSupport
                      : family === "huffman-tree"
                        ? huffmanSupport
                        : family === "hash"
                          ? hashSupport
                          : family === "array-special"
                            ? arraySpecialSupport
        : plainSupport;
  const dir = path.join(questionsRoot, question.id);
  await mkdir(dir, { recursive: true });
  if (family === "names") await writeFile(path.join(dir, "NameRecord.java"), nameRecordSource);
  if (family === "plain") await writeFile(path.join(dir, "ExamCollections.java"), collectionSupportSource);
  if (family === "huffman-tree") await writeFile(path.join(dir, "ExamCollections.java"), collectionSupportSource);
  await writeFile(path.join(dir, `${className}.java`), support(question, className, question.answer, false, signature));
  await writeFile(path.join(dir, `Oracle${className}.java`), support(question, className, question.answer, true, signature));
  const cases = family === "plain"
    ? buildPlainCases(question, signature)
    : family === "names" || family === "name-record"
      ? buildNamesCases(signature, className, family)
      : family === "tree"
        ? buildTreeCases(className, new RegExp(`class\\s+${className}\\s*<`).test(question.reference))
        : family === "graph"
          ? buildGraphCases(className)
          : family === "array-map"
            ? buildArrayMapCases(/class\s+ArrayMap\s*</.test(question.reference))
            : family === "array-collection" || family === "heap"
              ? buildStructureCases(className, new RegExp(`class\\s+${className}\\s*<`).test(question.reference))
              : family === "huffman-tree"
                ? buildHuffmanCases(className)
                : family === "hash"
              ? buildHashCases(className, new RegExp(`class\\s+${className}\\s*<`).test(question.reference))
              : family === "array-special"
                ? buildStructureCases(className, /^(?:SparseList|MultiSet|UnsortedSet|FuzzySet|LinkedMatrix|ExamHashMap|ExamHashtable)$/.test(className))
          : family === "linked-special"
            ? buildLinkedSpecialCases(className, new RegExp(`class\\s+${className}\\s*<`).test(question.reference))
      : buildCases(question, signature, className, family);
  await writeFile(path.join(dir, "TestRunner.java"), commonRunner.replace("__CASES__", cases));
  generated++;
}

console.log(`Generated ${generated} answer-key oracle harnesses; ${skipped.length} questions remain.`);
if (process.argv.includes("--report")) {
  for (const id of skipped) {
    const question = questions.find((candidate) => candidate.id === id);
    console.log("SKIP", id, JSON.stringify({ title: question?.title, signature: question ? signatureOf(question) : null }));
  }
}
if (process.argv.includes("--report-skipped")) {
  for (const id of skipped) {
    const question = questions.find((candidate) => candidate.id === id);
    console.log(`${id}\t${question?.title ?? ""}\t${signatureOf(question ?? {})?.name ?? "NO_SIGNATURE"}`);
  }
}
