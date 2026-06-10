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
