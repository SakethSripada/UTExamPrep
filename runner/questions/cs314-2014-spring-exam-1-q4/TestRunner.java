import java.util.*;

public class TestRunner {
    private static int passed;
    private static int total;

    private static void check(String actual, String expected, String name) {
        total++;
        if (Objects.equals(actual, expected)) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            System.out.println("FAIL " + name + " expected=" + expected + " actual=" + actual);
        }
    }

    public static void main(String[] args) {
        check(SparseMatrix.of(new int[][] {{7}}).toString(), "7_\n", "one value");
        check(SparseMatrix.of(new int[][] {{1, 2}, {0, 3}}).toString(), "1_2_\n0_3_\n", "mixed 2x2");
        check(SparseMatrix.of(new int[][] {{0, 4}, {3, 0}}).toString(), "0_4_\n3_0_\n", "zeros around values");
        check(SparseMatrix.of(new int[][] {{1, 2, 3}, {4, 5, 6}}).toString(), "1_2_3_\n4_5_6_\n", "dense matrix");
        check(SparseMatrix.of(new int[][] {{3, 0, 0}, {0, -2, 0}, {0, 0, 5}}).toString(), "3_0_0_\n0_-2_0_\n0_0_5_\n", "sparse negative value");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
