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
        int[] vals = {0, 1, 2, 3, 4, 5};
        checkArray(StudentSolution.copyWithoutRange(vals, 2, 4), new int[]{0, 1, 4, 5}, "middle range");
        checkArray(StudentSolution.copyWithoutRange(vals, 2, 2), new int[]{0, 1, 2, 3, 4, 5}, "empty range");
        checkArray(StudentSolution.copyWithoutRange(vals, 0, 6), new int[]{}, "whole range");
        checkArray(vals, new int[]{0, 1, 2, 3, 4, 5}, "original unchanged");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
