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
        int[] req1 = new int[26];
        req1['A' - 'A'] = 2;
        req1['Z' - 'A'] = 1;
        check(StudentSolution.capitalLettersPresent(new Scanner("A abc AZ Z"), req1), "has required capital letters");
        int[] req2 = new int[26];
        req2['T' - 'A'] = 7;
        check(!StudentSolution.capitalLettersPresent(new Scanner("There are Two T"), req2), "missing capital letters");
        int[] req3 = new int[26];
        check(StudentSolution.capitalLettersPresent(new Scanner("lowercase only"), req3), "zero requirements");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
