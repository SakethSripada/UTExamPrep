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
        HashTable314<String> table = new HashTable314<>(7);
        table.addToBucket(1, "A");
        table.addToBucket(1, "B");
        table.addToBucket(4, "C");
        table.addToBucket(6, "D");
        Iterator<String> it = table.iterator();
        check(it.hasNext(), "has next initially");
        check(it.hasNext(), "hasNext is repeatable");
        checkEquals(it.next(), "A", "first value");
        it.remove();
        checkEquals(table.sizeForTest(), 3, "remove updates size");
        check(!table.bucketIsNullForTest(1), "bucket with remaining value stays non-null");
        checkEquals(it.next(), "B", "second value same bucket");
        it.remove();
        check(table.bucketIsNullForTest(1), "empty bucket nulled");
        checkEquals(it.next(), "C", "moves to next non-empty bucket");
        checkEquals(it.next(), "D", "moves to final bucket");
        check(!it.hasNext(), "no values left");
        HashTable314<Integer> empty = new HashTable314<>(3);
        check(!empty.iterator().hasNext(), "empty iterator has no next");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
