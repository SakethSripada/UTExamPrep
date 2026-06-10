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
