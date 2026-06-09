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
    default:
      return null;
  }
}

export async function GET() {
  const check = await runCommand("javac", ["-version"], process.cwd());
  return json({
    available: check.ok,
    message: check.ok
      ? `Local Java detected: ${(check.stderr || check.stdout).trim()}`
      : "Local Java was not found. Install a JDK to enable Java test execution.",
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

  const javaCheck = await runCommand("javac", ["-version"], process.cwd());
  if (!javaCheck.ok) {
    return json({
      ok: false,
      phase: "java",
      message: "Local Java was not found. Install a JDK with javac and java available on PATH.",
      stderr: javaCheck.stderr,
    });
  }

  const dir = await mkdtemp(path.join(tmpdir(), "digitalexams-java-"));
  try {
    await Promise.all(
      Object.entries(harness.files).map(([file, content]) => writeFile(path.join(dir, file), content, "utf8")),
    );

    const compile = await runCommand("javac", Object.keys(harness.files), dir);
    if (!compile.ok) {
      return json({
        ok: false,
        phase: "compile",
        message: compile.timedOut ? "Compilation timed out." : "Compilation failed.",
        stdout: compile.stdout.slice(0, MAX_BUFFER),
        stderr: compile.stderr.slice(0, MAX_BUFFER),
      });
    }

    const run = await runCommand("java", ["TestRunner"], dir);
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
