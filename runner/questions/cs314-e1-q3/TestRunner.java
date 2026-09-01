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
