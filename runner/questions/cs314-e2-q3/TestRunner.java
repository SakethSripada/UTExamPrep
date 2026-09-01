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
