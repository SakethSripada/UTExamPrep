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
        GenericList<String> list = GenericList.of("A", "B", "C", "A", "B", "B", "X");
        GenericList<String> noA = list.copyWithoutTarget("A");
        checkEquals(noA.toString(), "[B, C, B, B, X]", "removes all A values");
        checkEquals(list.toString(), "[A, B, C, A, B, B, X]", "calling list unchanged");
        GenericList<String> noB = list.copyWithoutTarget("B");
        checkEquals(noB.toString(), "[A, C, A, X]", "removes all B values");
        GenericList<String> none = GenericList.of("C", "C", "C").copyWithoutTarget("C");
        checkEquals(none.toString(), "[]", "all removed");
        GenericList<String> noMatch = list.copyWithoutTarget("Z");
        checkEquals(noMatch.toString(), "[A, B, C, A, B, B, X]", "no match copy");
        check(noMatch.capacityForTest() > noMatch.sizeForTest(), "result has extra capacity");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
