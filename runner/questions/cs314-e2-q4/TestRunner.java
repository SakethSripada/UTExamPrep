import java.util.*;
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
