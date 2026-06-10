import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

const MAX_CODE_LENGTH = 20_000;
const TIMEOUT_MS = 2500;
const MAX_BUFFER = 128 * 1024;

type JavaRunRequest = {
  questionId?: string;
  code?: string;
};

type Harness = {
  files: Record<string, string>;
};

type JavaTools =
  | {
      available: true;
      javac: string;
      java: string;
      javacVersion: string;
      javaVersion: string;
    }
  | {
      available: false;
      message: string;
      stderr?: string;
    };

function parseResult(stdout: string) {
  const match = stdout.match(/RESULT\s+(\d+)\/(\d+)/);
  if (!match) {
    return {};
  }
  return {
    passed: Number(match[1]),
    total: Number(match[2]),
  };
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function runCommand(command: string, args: string[], cwd: string) {
  try {
    const result = await execFileAsync(command, args, {
      cwd,
      timeout: TIMEOUT_MS,
      maxBuffer: MAX_BUFFER,
      env: {
        ...process.env,
        PATH: process.env.PATH ?? "",
        NODE_ENV: process.env.NODE_ENV,
      },
      windowsHide: true,
    });
    return { ok: true, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const err = error as {
      stdout?: string;
      stderr?: string;
      killed?: boolean;
      signal?: string;
      code?: number;
      message?: string;
    };
    return {
      ok: false,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? err.message ?? "",
      timedOut: err.killed || err.signal === "SIGTERM",
      code: err.code,
    };
  }
}

async function firstExecutableOnPath(command: string) {
  const lookupCommand = process.platform === "win32" ? "where.exe" : "which";
  const lookup = await runCommand(lookupCommand, [command], process.cwd());
  if (!lookup.ok) {
    return command;
  }

  return lookup.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? command;
}

function companionJavaForJavac(javac: string) {
  if (!path.isAbsolute(javac)) {
    return "java";
  }

  return path.join(path.dirname(javac), process.platform === "win32" ? "java.exe" : "java");
}

function versionText(stdout: string, stderr: string) {
  return (stderr || stdout).trim();
}

async function resolveJavaTools(): Promise<JavaTools> {
  const javac = await firstExecutableOnPath("javac");
  const javacCheck = await runCommand(javac, ["-version"], process.cwd());
  if (!javacCheck.ok) {
    return {
      available: false,
      message: "Local Java was not found. Install a JDK to enable Java test execution.",
      stderr: javacCheck.stderr,
    };
  }

  const java = companionJavaForJavac(javac);
  const javaCheck = await runCommand(java, ["-version"], process.cwd());
  if (!javaCheck.ok) {
    return {
      available: false,
      message: `Found ${versionText(javacCheck.stdout, javacCheck.stderr)}, but could not run Java from the same JDK.`,
      stderr: javaCheck.stderr,
    };
  }

  return {
    available: true,
    javac,
    java,
    javacVersion: versionText(javacCheck.stdout, javacCheck.stderr),
    javaVersion: versionText(javaCheck.stdout, javaCheck.stderr).split(/\r?\n/)[0] ?? "",
  };
}

function methodHarness(methodCode: string, testRunner: string): Harness {
  return {
    files: {
      "StudentSolution.java": `import java.util.*;
import java.io.*;

public class StudentSolution {
${methodCode}
}
`,
      "TestRunner.java": testRunner,
    },
  };
}

function classHarness(classCode: string, testRunner: string): Harness {
  return {
    files: {
      "Critter.java": `import java.awt.Color;

public abstract class Critter {
    public boolean eat() { return false; }
    public Attack fight(String opponent) { return Attack.FORFEIT; }
    public Color getColor() { return Color.BLACK; }
    public Direction getMove() { return Direction.CENTER; }
    public String toString() { return "?"; }
    public static enum Direction { NORTH, SOUTH, EAST, WEST, CENTER }
    public static enum Attack { ROAR, POUNCE, SCRATCH, FORFEIT }
}
`,
      "StudentSolution.java": classCode.replace(/public\s+class\s+(Yak|JumpingBean)\b/, "class $1"),
      "TestRunner.java": testRunner,
    },
  };
}

const helpers = `import java.util.*;
import java.io.*;

public class TestRunner {
    private static int passed = 0;
    private static int total = 0;

    private static void check(boolean condition, String name) {
        total++;
        if (condition) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            System.out.println("FAIL " + name);
        }
    }

    private static void checkEquals(Object actual, Object expected, String name) {
        check(Objects.equals(actual, expected), name + " expected=" + expected + " actual=" + actual);
    }

    private static void checkArray(int[] actual, int[] expected, String name) {
        check(Arrays.equals(actual, expected), name + " expected=" + Arrays.toString(expected) + " actual=" + Arrays.toString(actual));
    }
`;

function buildHarness(questionId: string, code: string): Harness | null {
  switch (questionId) {
    case "e1-q3":
      return classHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        Yak yak = new Yak();
        check(yak.eat(), "eat returns true");
        for (int i = 0; i < 24; i++) {
            Critter.Attack attack = yak.fight("test");
            Critter.Direction move = yak.getMove();
            boolean expectedRoar = move == Critter.Direction.NORTH || move == Critter.Direction.SOUTH;
            check((expectedRoar && attack == Critter.Attack.ROAR) || (!expectedRoar && attack == Critter.Attack.POUNCE), "fight matches next move " + i);
        }
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e1-q4":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        int[] req1 = new int[26];
        req1['A' - 'A'] = 2;
        req1['Z' - 'A'] = 1;
        check(StudentSolution.capitalLettersPresent(new Scanner("A abc AZ Z"), req1), "has required capital letters");
        int[] req2 = new int[26];
        req2['T' - 'A'] = 7;
        check(!StudentSolution.capitalLettersPresent(new Scanner("There are Two T"), req2), "missing capital letters");
        int[] req3 = new int[26];
        check(StudentSolution.capitalLettersPresent(new Scanner("lowercase only"), req3), "zero requirements");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e1-q5":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        int[] vals = {0, 1, 2, 3, 4, 5};
        checkArray(StudentSolution.copyWithoutRange(vals, 2, 4), new int[]{0, 1, 4, 5}, "middle range");
        checkArray(StudentSolution.copyWithoutRange(vals, 2, 2), new int[]{0, 1, 2, 3, 4, 5}, "empty range");
        checkArray(StudentSolution.copyWithoutRange(vals, 0, 6), new int[]{}, "whole range");
        checkArray(vals, new int[]{0, 1, 2, 3, 4, 5}, "original unchanged");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e1-q6":
      return methodHarness(
        code,
        `${helpers}
    static class Point {
        private int x;
        private int y;
        Point(int x, int y) { this.x = x; this.y = y; }
        int getX() { return x; }
        int getY() { return y; }
        double distance(Point p2) {
            int dx = x - p2.x;
            int dy = y - p2.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }
    public static void main(String[] args) {
        Point[] pts = {new Point(0, 2), new Point(-5, -3), new Point(1, 3), new Point(2, 4), new Point(0, 0)};
        check(Math.abs(StudentSolution.minDistance(pts) - Math.sqrt(2)) < 0.000001, "sample closest pair");
        Point[] pts2 = {new Point(4, 4), new Point(4, 4), new Point(10, 10)};
        check(Math.abs(StudentSolution.minDistance(pts2)) < 0.000001, "duplicate points");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e1-q7":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>(Arrays.asList("Gold", "Silver", "King", "TAs", "Silver", "Fatima", "Carla"));
        int removed = StudentSolution.removeStrings(new Scanner("493 King 1 Silver Carla silver King"), list);
        checkEquals(removed, 3, "removed count");
        checkEquals(list.toString(), "[Gold, TAs, Silver, Fatima]", "list after removals");
        ArrayList<String> list2 = new ArrayList<>(Arrays.asList("A", "A", "B"));
        checkEquals(StudentSolution.removeStrings(new Scanner("A"), list2), 1, "only first duplicate removed");
        checkEquals(list2.toString(), "[A, B]", "duplicate list result");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e1-q8":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        StudentSolution s = new StudentSolution();
        int[][] mat = {
            {6, 10, 4, 15, 3, 7, -6},
            {-1, 1, 2, 3, 2, 0, 23},
            {5, 17, 30, 15, 2, 37, 8},
            {2, 1, 10, 2, 10, 13, 2},
            {2, 2, 5, 8, 1, 12, 54}
        };
        s.clampValues(mat, 3, 6, 4, 2, 10);
        checkArray(mat[2], new int[]{5, 17, 30, 15, 10, 37, 10}, "sample row 2");
        checkArray(mat[3], new int[]{2, 1, 10, 10, 10, 13, 10}, "sample row 3");
        int[][] mat2 = {{1, 2, 3}, {4, 5, 6}};
        s.clampValues(mat2, 0, 1, 5, 5, 9);
        checkArray(mat2[0], new int[]{9, 9, 3}, "out of bounds ignored");
        checkArray(mat2[1], new int[]{4, 5, 6}, "rows outside unchanged");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e2-q3":
      return classHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        JumpingBean bean = new JumpingBean();
        checkEquals(bean.getMove(), Critter.Direction.CENTER, "starts sitting still");
        checkEquals(bean.fight("x"), Critter.Attack.SCRATCH, "scratches while still");
        Critter.Direction first = bean.getMove();
        check(first == Critter.Direction.NORTH || first == Critter.Direction.WEST, "first moving direction");
        checkEquals(bean.fight("x"), Critter.Attack.FORFEIT, "forfeits while moving");
        checkEquals(bean.getMove(), first, "second step same direction");
        checkEquals(bean.getMove(), Critter.Direction.CENTER, "returns to center");
        checkEquals(bean.fight("x"), Critter.Attack.SCRATCH, "second win scratches");
        Critter.Direction second = bean.getMove();
        boolean fourMoves = second == bean.getMove() && second == bean.getMove() && second == bean.getMove();
        check(fourMoves, "second celebration has four moves");
        checkEquals(bean.getMove(), Critter.Direction.CENTER, "center after four moves");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e2-q4":
      return methodHarness(
        code,
        `${helpers}
    private static String capture(String input) {
        PrintStream old = System.out;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        System.setOut(new PrintStream(baos));
        StudentSolution.printMoney(new Scanner(input));
        System.setOut(old);
        return baos.toString().replace("\\r\\n", "\\n").trim();
    }
    public static void main(String[] args) {
        String input = "Mike Scott 493 K 1 G 12 * 2465 K\\nIsabelle 20 G 13 S 11 K 103 K 15 S\\nHailey Mothershead 85 k 12 s\\nCarla R. 8 S 261 K 12 # 10 g";
        String output = capture(input);
        check(output.contains("Mike Scott 7.0 Galleons"), "Mike Scott total");
        check(output.contains("Isabelle 21.878296146044626 Galleons"), "Isabelle total");
        check(output.contains("Hailey Mothershead 0.0 Galleons"), "invalid lowercase ignored");
        check(output.contains("Carla R. 1.0 Galleon"), "singular Galleon");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e2-q5":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        int[] vals = {0, 1, 2, 3, 4, 5};
        checkArray(StudentSolution.getReversedSubList(vals, 2, 4), new int[]{3, 2}, "middle reverse");
        checkArray(StudentSolution.getReversedSubList(vals, 2, 2), new int[]{}, "empty reverse");
        checkArray(StudentSolution.getReversedSubList(vals, 0, 6), new int[]{5, 4, 3, 2, 1, 0}, "full reverse");
        checkArray(vals, new int[]{0, 1, 2, 3, 4, 5}, "original unchanged");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e2-q6":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        int[] one = {5, 12, 6, 3, 9, 0, -2};
        StudentSolution.insertElementsAtFront(one, new int[]{4, -3, 2});
        checkArray(one, new int[]{4, -3, 2, 5, 12, 6, 3}, "sample length three");
        int[] one2 = {5, 12, 6, 3, 9, 0, -2};
        StudentSolution.insertElementsAtFront(one2, new int[]{4});
        checkArray(one2, new int[]{4, 5, 12, 6, 3, 9, 0}, "single insert");
        int[] one3 = {2, 6, 1};
        StudentSolution.insertElementsAtFront(one3, new int[]{17, 19, 37, 41});
        checkArray(one3, new int[]{17, 19, 37}, "second larger");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e2-q7":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>(Arrays.asList("CK", "Omer", "Carla", "Fatima", "Anthony", "Aish", "Hailey", "Bri", "Dayanny", "Chris", "Olivia"));
        int removed = StudentSolution.removeValues(list, 'a', 3);
        checkEquals(removed, 4, "sample removed count");
        checkEquals(list.toString(), "[CK, Omer, Anthony, Aish, Bri, Chris, Olivia]", "sample list");
        ArrayList<String> list2 = new ArrayList<>(Arrays.asList("a", "bb", "cab"));
        checkEquals(StudentSolution.removeValues(list2, 'a', 1), 1, "respects n and short strings");
        checkEquals(list2.toString(), "[bb, cab]", "respects first n result");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "e2-q8":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        StudentSolution s = new StudentSolution();
        int[][] mat = {
            {6, 10, 4, 5, 3},
            {1, 1, 2, 3, 2},
            {5, 7, 30, 5, 2},
            {2, 1, 10, 2, 10},
            {2, 2, 5, 8, 1}
        };
        checkEquals(s.coinsCollected(mat, 0), 45, "sample top row");
        int[][] mat2 = {
            {6, 10, 4, 5, 3},
            {1, 1, 2, 3, 2},
            {5, 7, 30, 5, 2},
            {2, 1, 10, 2, 10},
            {2, 2, 5, 8, 1}
        };
        checkEquals(s.coinsCollected(mat2, 3), 79, "sample fourth row");
        int[][] mat3 = {{4, 2, 9}};
        checkEquals(s.coinsCollected(mat3, 0), 15, "single row");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "cs314-e1-q2":
      return {
        files: {
          "GenericList.java": `import java.util.*;

class GenericList<E> {
    private E[] con;
    private int size;

    public GenericList() { }

${code}

    @SafeVarargs
    static <T> GenericList<T> of(T... vals) {
        GenericList<T> list = new GenericList<>();
        list.con = (T[]) new Object[vals.length + 5];
        for (T val : vals) {
            list.con[list.size++] = val;
        }
        return list;
    }

    int sizeForTest() { return size; }
    int capacityForTest() { return con == null ? 0 : con.length; }
    public String toString() {
        return Arrays.toString(Arrays.copyOf(con, size));
    }
}
`,
          "TestRunner.java": `${helpers}
    public static void main(String[] args) {
        GenericList<String> list = GenericList.of("A", "B", "C", "A", "B", "B", "X");
        GenericList<String> noA = list.copyWithoutTarget("A");
        checkEquals(noA.toString(), "[B, C, B, B, X]", "removes all A values");
        checkEquals(list.toString(), "[A, B, C, A, B, B, X]", "calling list unchanged");
        GenericList<String> noB = list.copyWithoutTarget("B");
        checkEquals(noB.toString(), "[A, C, A, X]", "removes all B values");
        GenericList<String> none = GenericList.of("C", "C", "C").copyWithoutTarget("C");
        checkEquals(none.toString(), "[]", "all removed");
        GenericList<String> noMatch = list.copyWithoutTarget("Z");
        checkEquals(noMatch.toString(), "[A, B, C, A, B, B, X]", "no match copy");
        check(noMatch.capacityForTest() > noMatch.sizeForTest(), "result has extra capacity");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
        },
      };
    case "cs314-e1-q3":
      return {
        files: {
          "MathMatrix.java": `import java.util.*;

class MathMatrix {
    private int[][] cells;

    public MathMatrix(int rows, int columns) {
        cells = new int[rows][columns];
    }

${code}

    static MathMatrix of(int[][] data) {
        MathMatrix matrix = new MathMatrix(data.length, data[0].length);
        for (int r = 0; r < data.length; r++) {
            for (int c = 0; c < data[0].length; c++) {
                matrix.cells[r][c] = data[r][c];
            }
        }
        return matrix;
    }

    String rowsForTest() {
        return Arrays.deepToString(cells);
    }
}
`,
          "TestRunner.java": `${helpers}
    public static void main(String[] args) {
        MathMatrix left = MathMatrix.of(new int[][]{{1, 5, 3}, {2, 7, 6}});
        MathMatrix right = MathMatrix.of(new int[][]{{12, 10, -3, 0}, {9, -5, 4, 8}});
        checkEquals(left.concatenate(right).rowsForTest(), "[[1, 5, 3, 12, 10, -3, 0], [2, 7, 6, 9, -5, 4, 8]]", "sample horizontal concatenate");
        MathMatrix oneCol = MathMatrix.of(new int[][]{{4}, {5}, {6}});
        MathMatrix twoCol = MathMatrix.of(new int[][]{{7, 8}, {9, 10}, {11, 12}});
        checkEquals(oneCol.concatenate(twoCol).rowsForTest(), "[[4, 7, 8], [5, 9, 10], [6, 11, 12]]", "different column counts");
        checkEquals(left.rowsForTest(), "[[1, 5, 3], [2, 7, 6]]", "left unchanged");
        checkEquals(right.rowsForTest(), "[[12, 10, -3, 0], [9, -5, 4, 8]]", "right unchanged");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
        },
      };
    case "cs314-e1-q4":
      return {
        files: {
          "MultiSet.java": `import java.util.*;

class MultiSet<E> {
    private ValueAndFrequency<E>[] con;
    private int numDistinct;
    private int size;

    public MultiSet(int initialCapacity) {
        con = new ValueAndFrequency[initialCapacity];
    }

    private static class ValueAndFrequency<E> {
        private E element;
        private int frequency;
        private ValueAndFrequency(E e, int f) {
            element = e;
            frequency = f;
        }
    }

${code}

    static <T> MultiSet<T> of(Object... pairs) {
        MultiSet<T> set = new MultiSet<>(pairs.length / 2 + 5);
        for (int i = 0; i < pairs.length; i += 2) {
            T element = (T) pairs[i];
            int frequency = (Integer) pairs[i + 1];
            set.con[set.numDistinct++] = new ValueAndFrequency<>(element, frequency);
            set.size += frequency;
        }
        return set;
    }

    String abstractViewForTest() {
        ArrayList<String> vals = new ArrayList<>();
        for (int i = 0; i < numDistinct; i++) {
            for (int j = 0; j < con[i].frequency; j++) {
                vals.add(String.valueOf(con[i].element));
            }
        }
        Collections.sort(vals);
        return vals.toString();
    }

    int sizeForTest() { return size; }
    int distinctForTest() { return numDistinct; }
}
`,
          "TestRunner.java": `${helpers}
    public static void main(String[] args) {
        MultiSet<String> one = MultiSet.of("B", 3, "C", 4, "A", 1);
        MultiSet<String> two = MultiSet.of("A", 1, "C", 2);
        MultiSet<String> result = one.getIntersection(two);
        checkEquals(result.abstractViewForTest(), "[A, C, C]", "sample intersection");
        checkEquals(result.sizeForTest(), 3, "sample size");
        checkEquals(result.distinctForTest(), 2, "sample distinct");
        MultiSet<String> none = one.getIntersection(MultiSet.of("Y", 1, "Z", 2));
        checkEquals(none.abstractViewForTest(), "[]", "empty intersection");
        MultiSet<String> freq = MultiSet.<String>of("B", 2, "C", 1, "A", 2).getIntersection(MultiSet.<String>of("A", 3, "B", 2));
        checkEquals(freq.abstractViewForTest(), "[A, A, B, B]", "minimum frequencies");
        checkEquals(one.abstractViewForTest(), "[A, B, B, B, C, C, C, C]", "calling set unchanged");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
        },
      };
    case "cs314-e2-q2":
      return methodHarness(
        code,
        `${helpers}
    public static void main(String[] args) {
        Map<String, ArrayList<String>> teams = new LinkedHashMap<>();
        teams.put("Texas", new ArrayList<>(Arrays.asList("A&M", "Pitt", "SMU", "TCU", "Stanford", "Baylor")));
        teams.put("A&M", new ArrayList<>(Arrays.asList("Texas", "SMU", "Florida", "Alabama", "Arkansas")));
        teams.put("SMU", new ArrayList<>(Arrays.asList("Texas", "A&M", "TCU", "UNT", "Texas Tech", "Colorado")));
        teams.put("UNT", new ArrayList<>(Arrays.asList("A&M", "SMU", "Sam Houston", "TCU", "TxSt")));
        Set<String> ranked = new HashSet<>(Arrays.asList("Pitt", "Stanford", "Baylor", "Florida", "Texas", "Colorado"));
        checkEquals(StudentSolution.playedMostRanked(teams, ranked), "Texas", "unique best team");
        Map<String, ArrayList<String>> tied = new LinkedHashMap<>();
        tied.put("One", new ArrayList<>(Arrays.asList("R1", "X", "R2")));
        tied.put("Two", new ArrayList<>(Arrays.asList("R3", "R4")));
        Set<String> ranked2 = new HashSet<>(Arrays.asList("R1", "R2", "R3", "R4"));
        String answer = StudentSolution.playedMostRanked(tied, ranked2);
        check(answer.equals("One") || answer.equals("Two"), "tie may return either team");
        checkEquals(teams.get("Texas").toString(), "[A&M, Pitt, SMU, TCU, Stanford, Baylor]", "input map unaltered");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "cs314-e2-q3":
      return {
        files: {
          "LL314.java": `import java.util.*;

class LL314<E> {
    private Node<E> first;

    private static class Node<E> {
        private E data;
        private Node<E> next;
        public Node(E val) { data = val; }
    }

${code}

    @SafeVarargs
    static <T> LL314<T> of(T... vals) {
        LL314<T> list = new LL314<>();
        Node<T> last = null;
        for (T val : vals) {
            Node<T> node = new Node<>(val);
            if (list.first == null) {
                list.first = node;
            } else {
                last.next = node;
            }
            last = node;
        }
        return list;
    }

    public String toString() {
        ArrayList<String> vals = new ArrayList<>();
        Node<E> temp = first;
        while (temp != null) {
            vals.add(String.valueOf(temp.data));
            temp = temp.next;
        }
        return vals.toString();
    }
}
`,
          "TestRunner.java": `${helpers}
    public static void main(String[] args) {
        LL314<String> list = LL314.of("A", "B", "C", "A", "B", "B", "X");
        check(!list.addIfFrequencyLessThan("A", 2), "does not add when frequency equals limit");
        checkEquals(list.toString(), "[A, B, C, A, B, B, X]", "unchanged when not added");
        check(list.addIfFrequencyLessThan("A", 3), "adds when frequency less than limit");
        checkEquals(list.toString(), "[A, B, C, A, B, B, X, A]", "adds target to end");
        LL314<String> missing = LL314.of("A", "B");
        check(missing.addIfFrequencyLessThan("M", 1), "adds missing value");
        checkEquals(missing.toString(), "[A, B, M]", "missing value at end");
        LL314<String> empty = LL314.of();
        check(empty.addIfFrequencyLessThan("M", 1), "adds to empty list");
        checkEquals(empty.toString(), "[M]", "empty list result");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
        },
      };
    case "cs314-e2-q4":
      return methodHarness(
        code,
        `${helpers}
    private static boolean validLoop(ArrayList<String> loop, int goal) {
        if (loop.size() != goal) return false;
        HashSet<String> seen = new HashSet<>();
        for (int i = 0; i < loop.size(); i++) {
            String current = loop.get(i);
            String next = loop.get((i + 1) % loop.size());
            if (!seen.add(current)) return false;
            if (current.charAt(current.length() - 1) != next.charAt(0)) return false;
        }
        return true;
    }
    public static void main(String[] args) {
        ArrayList<String> dictionary = new ArrayList<>(Arrays.asList("blast", "tall", "lab", "bad", "dub", "pip", "pup"));
        ArrayList<String> loop = new ArrayList<>();
        check(StudentSolution.canForm(dictionary, loop, 5), "finds sample loop");
        check(validLoop(loop, 5), "sample loop is valid and exact length");
        checkEquals(dictionary.toString(), "[blast, tall, lab, bad, dub, pip, pup]", "dictionary unaltered");
        ArrayList<String> noLoop = new ArrayList<>();
        check(!StudentSolution.canForm(new ArrayList<>(Arrays.asList("ab", "cd", "ef")), noLoop, 3), "returns false when impossible");
        checkEquals(noLoop.toString(), "[]", "failed loop is empty");
        ArrayList<String> reuse = new ArrayList<>();
        check(!StudentSolution.canForm(new ArrayList<>(Arrays.asList("pup", "pip")), reuse, 5), "does not reuse words");
        checkEquals(reuse.toString(), "[]", "reuse failure is empty");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
      );
    case "cs314-e3-q2":
      return {
        files: {
          "Graph.java": `import java.util.*;

class Queue314<E> {
    private LinkedList<E> values = new LinkedList<>();
    public void enqueue(E e) { values.addLast(e); }
    public void add(E e) { enqueue(e); }
    public boolean isEmpty() { return values.isEmpty(); }
    public E front() { return values.getFirst(); }
    public E dequeue() { return values.removeFirst(); }
}

class Graph {
    private Map<String, Vertex> verts = new LinkedHashMap<>();
    private Map<String, Vertex> vertices = verts;

    private void clearAll() {
        for (Vertex v : verts.values()) {
            v.scratch = 0;
        }
    }

${code}

    private static class Vertex {
        private String name;
        private List<Edge> adjacent = new ArrayList<>();
        private int scratch;

        private Vertex(String name) { this.name = name; }

        public Edge removeEdge(Vertex dest) {
            Iterator<Edge> it = adjacent.iterator();
            while (it.hasNext()) {
                Edge edge = it.next();
                if (edge.dest == dest) {
                    it.remove();
                    return edge;
                }
            }
            return null;
        }
    }

    private static class Edge {
        private Vertex dest;
        private Edge(Vertex dest) { this.dest = dest; }
    }

    void addVertex(String name) {
        verts.put(name, new Vertex(name));
    }

    void addUndirectedEdge(String a, String b) {
        Vertex va = verts.get(a);
        Vertex vb = verts.get(b);
        va.adjacent.add(new Edge(vb));
        vb.adjacent.add(new Edge(va));
    }

    boolean hasEdge(String a, String b) {
        Vertex va = verts.get(a);
        Vertex vb = verts.get(b);
        for (Edge edge : va.adjacent) {
            if (edge.dest == vb) return true;
        }
        return false;
    }

    static Graph sample() {
        Graph graph = new Graph();
        for (String name : new String[]{"A", "B", "C", "D", "F", "G", "H"}) {
            graph.addVertex(name);
        }
        graph.addUndirectedEdge("A", "B");
        graph.addUndirectedEdge("A", "C");
        graph.addUndirectedEdge("B", "C");
        graph.addUndirectedEdge("B", "D");
        graph.addUndirectedEdge("C", "D");
        graph.addUndirectedEdge("D", "F");
        graph.addUndirectedEdge("F", "G");
        graph.addUndirectedEdge("F", "H");
        graph.addUndirectedEdge("H", "G");
        return graph;
    }
}
`,
          "TestRunner.java": `${helpers}
    public static void main(String[] args) {
        Graph graph = Graph.sample();
        check(graph.isBridge("D", "F"), "D-F is a bridge");
        check(graph.hasEdge("D", "F"), "D-F restored after true result");
        check(!graph.isBridge("C", "D"), "C-D is not a bridge");
        check(graph.hasEdge("C", "D"), "C-D restored after false result");
        check(!graph.isBridge("A", "B"), "A-B is not a bridge through C");
        check(graph.hasEdge("A", "B"), "A-B restored");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
        },
      };
    case "cs314-e3-q3":
      return {
        files: {
          "IntBST.java": `import java.util.*;

class IntBST {
    private IntNode root;

    private static class IntNode {
        private int val;
        private IntNode left;
        private IntNode right;
        private IntNode(int val) { this.val = val; }
    }

${code}

    void add(int val) {
        root = add(root, val);
    }

    private IntNode add(IntNode node, int val) {
        if (node == null) return new IntNode(val);
        if (val <= node.val) node.left = add(node.left, val);
        else node.right = add(node.right, val);
        return node;
    }

    static IntBST sample() {
        IntBST tree = new IntBST();
        for (int val : new int[]{5, 3, 12, 0, 9, 15, 7}) {
            tree.add(val);
        }
        return tree;
    }
}
`,
          "TestRunner.java": `${helpers}
    public static void main(String[] args) {
        IntBST tree = IntBST.sample();
        checkEquals(tree.numInRange(3, 6), 2, "range 3 to 6");
        checkEquals(tree.numInRange(20, 30), 0, "no values in high range");
        checkEquals(tree.numInRange(3, 3), 1, "single value range");
        checkEquals(tree.numInRange(-5, 20), 7, "all values");
        checkEquals(tree.numInRange(3, 10), 4, "middle range with pruning");
        IntBST empty = new IntBST();
        checkEquals(empty.numInRange(0, 10), 0, "empty tree");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
        },
      };
    case "cs314-e3-q4":
      return {
        files: {
          "HashTable314.java": `import java.util.*;

class HashTable314<E> implements Iterable<E> {
    private List<E>[] con;
    private int size;

    public HashTable314(int cap) {
        con = new List[cap];
    }

    public Iterator<E> iterator() { return new HIterator(); }

${code}

    void addToBucket(int bucket, E val) {
        if (con[bucket] == null) {
            con[bucket] = new LinkedList<>();
        }
        con[bucket].add(val);
        size++;
    }

    int sizeForTest() { return size; }
    boolean bucketIsNullForTest(int bucket) { return con[bucket] == null; }
}
`,
          "TestRunner.java": `${helpers}
    public static void main(String[] args) {
        HashTable314<String> table = new HashTable314<>(7);
        table.addToBucket(1, "A");
        table.addToBucket(1, "B");
        table.addToBucket(4, "C");
        table.addToBucket(6, "D");
        Iterator<String> it = table.iterator();
        check(it.hasNext(), "has next initially");
        check(it.hasNext(), "hasNext is repeatable");
        checkEquals(it.next(), "A", "first value");
        it.remove();
        checkEquals(table.sizeForTest(), 3, "remove updates size");
        check(!table.bucketIsNullForTest(1), "bucket with remaining value stays non-null");
        checkEquals(it.next(), "B", "second value same bucket");
        it.remove();
        check(table.bucketIsNullForTest(1), "empty bucket nulled");
        checkEquals(it.next(), "C", "moves to next non-empty bucket");
        checkEquals(it.next(), "D", "moves to final bucket");
        check(!it.hasNext(), "no values left");
        HashTable314<Integer> empty = new HashTable314<>(3);
        check(!empty.iterator().hasNext(), "empty iterator has no next");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
`,
        },
      };
    default:
      return null;
  }
}

export async function GET() {
  const tools = await resolveJavaTools();
  return json({
    available: tools.available,
    message: tools.available
      ? `Local Java detected: ${tools.javacVersion}; runtime: ${tools.javaVersion}`
      : tools.message,
  });
}

export async function POST(request: Request) {
  let body: JavaRunRequest;
  try {
    body = (await request.json()) as JavaRunRequest;
  } catch {
    return json({ ok: false, phase: "request", message: "Invalid JSON request." }, 400);
  }

  const questionId = body.questionId;
  const code = body.code ?? "";
  if (!questionId || !code.trim()) {
    return json({ ok: false, phase: "request", message: "Missing question id or Java code." }, 400);
  }
  if (code.length > MAX_CODE_LENGTH) {
    return json({ ok: false, phase: "request", message: "Code is too large to run locally." }, 413);
  }

  const harness = buildHarness(questionId, code);
  if (!harness) {
    return json({ ok: false, phase: "unsupported", message: "No local Java tests are available for this question." }, 404);
  }

  const tools = await resolveJavaTools();
  if (!tools.available) {
    return json({
      ok: false,
      phase: "java",
      message: tools.message,
      stderr: tools.stderr,
    });
  }

  const dir = await mkdtemp(path.join(tmpdir(), "digitalexams-java-"));
  try {
    await Promise.all(
      Object.entries(harness.files).map(([file, content]) => writeFile(path.join(dir, file), content, "utf8")),
    );

    const compile = await runCommand(tools.javac, Object.keys(harness.files), dir);
    if (!compile.ok) {
      return json({
        ok: false,
        phase: "compile",
        message: compile.timedOut ? "Compilation timed out." : "Compilation failed.",
        stdout: compile.stdout.slice(0, MAX_BUFFER),
        stderr: compile.stderr.slice(0, MAX_BUFFER),
      });
    }

    const run = await runCommand(tools.java, ["TestRunner"], dir);
    const parsed = parseResult(run.stdout);
    return json({
      ok: run.ok,
      phase: "test",
      message: run.timedOut ? "Execution timed out." : run.ok ? "All local tests passed." : "Some local tests failed.",
      stdout: run.stdout.slice(0, MAX_BUFFER),
      stderr: run.stderr.slice(0, MAX_BUFFER),
      ...parsed,
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
