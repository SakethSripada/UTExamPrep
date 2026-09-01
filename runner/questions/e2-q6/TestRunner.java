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
