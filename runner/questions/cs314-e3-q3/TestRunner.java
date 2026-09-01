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
        IntBST tree = IntBST.sample();
        checkEquals(tree.numInRange(3, 6), 2, "range 3 to 6");
        checkEquals(tree.numInRange(20, 30), 0, "no values in high range");
        checkEquals(tree.numInRange(3, 3), 1, "single value range");
        checkEquals(tree.numInRange(-5, 20), 7, "all values");
        checkEquals(tree.numInRange(3, 10), 4, "middle range with pruning");
        IntBST empty = new IntBST();
        checkEquals(empty.numInRange(0, 10), 0, "empty tree");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
