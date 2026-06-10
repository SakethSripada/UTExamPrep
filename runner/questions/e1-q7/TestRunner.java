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
        ArrayList<String> list = new ArrayList<>(Arrays.asList("Gold", "Silver", "King", "TAs", "Silver", "Fatima", "Carla"));
        int removed = StudentSolution.removeStrings(new Scanner("493 King 1 Silver Carla silver King"), list);
        checkEquals(removed, 3, "removed count");
        checkEquals(list.toString(), "[Gold, TAs, Silver, Fatima]", "list after removals");
        ArrayList<String> list2 = new ArrayList<>(Arrays.asList("A", "A", "B"));
        checkEquals(StudentSolution.removeStrings(new Scanner("A"), list2), 1, "only first duplicate removed");
        checkEquals(list2.toString(), "[A, B]", "duplicate list result");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
