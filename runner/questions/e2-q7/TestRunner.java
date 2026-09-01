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
        ArrayList<String> list = new ArrayList<>(Arrays.asList("CK", "Omer", "Carla", "Fatima", "Anthony", "Aish", "Hailey", "Bri", "Dayanny", "Chris", "Olivia"));
        int removed = StudentSolution.removeValues(list, 'a', 3);
        checkEquals(removed, 4, "sample removed count");
        checkEquals(list.toString(), "[CK, Omer, Anthony, Aish, Bri, Chris, Olivia]", "sample list");
        ArrayList<String> list2 = new ArrayList<>(Arrays.asList("a", "bb", "cab"));
        checkEquals(StudentSolution.removeValues(list2, 'a', 1), 1, "respects n and short strings");
        checkEquals(list2.toString(), "[bb, cab]", "respects first n result");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
