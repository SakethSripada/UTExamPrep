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
