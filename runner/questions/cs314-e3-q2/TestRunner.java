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
        Graph graph = Graph.sample();
        check(graph.isBridge("D", "F"), "D-F is a bridge");
        check(graph.hasEdge("D", "F"), "D-F restored after true result");
        check(!graph.isBridge("C", "D"), "C-D is not a bridge");
        check(graph.hasEdge("C", "D"), "C-D restored after false result");
        check(!graph.isBridge("A", "B"), "A-B is not a bridge through C");
        check(graph.hasEdge("A", "B"), "A-B restored");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
