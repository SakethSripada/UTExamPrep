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

    private static String capture(String input) {
        PrintStream old = System.out;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        System.setOut(new PrintStream(baos));
        StudentSolution.printMoney(new Scanner(input));
        System.setOut(old);
        return baos.toString().replace("\r\n", "\n").trim();
    }
    public static void main(String[] args) {
        String input = "Mike Scott 493 K 1 G 12 * 2465 K\nIsabelle 20 G 13 S 11 K 103 K 15 S\nHailey Mothershead 85 k 12 s\nCarla R. 8 S 261 K 12 # 10 g";
        String output = capture(input);
        check(output.contains("Mike Scott 7.0 Galleons"), "Mike Scott total");
        check(output.contains("Isabelle 21.878296146044626 Galleons"), "Isabelle total");
        check(output.contains("Hailey Mothershead 0.0 Galleons"), "invalid lowercase ignored");
        check(output.contains("Carla R. 1.0 Galleon"), "singular Galleon");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
