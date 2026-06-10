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
        Point[] pts = {new Point(0, 2), new Point(-5, -3), new Point(1, 3), new Point(2, 4), new Point(0, 0)};
        check(Math.abs(StudentSolution.minDistance(pts) - Math.sqrt(2)) < 0.000001, "sample closest pair");
        Point[] pts2 = {new Point(4, 4), new Point(4, 4), new Point(10, 10)};
        check(Math.abs(StudentSolution.minDistance(pts2)) < 0.000001, "duplicate points");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
