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
        Yak yak = new Yak();
        check(yak.eat(), "eat returns true");
        for (int i = 0; i < 24; i++) {
            Critter.Attack attack = yak.fight("test");
            Critter.Direction move = yak.getMove();
            boolean expectedRoar = move == Critter.Direction.NORTH || move == Critter.Direction.SOUTH;
            check((expectedRoar && attack == Critter.Attack.ROAR) || (!expectedRoar && attack == Critter.Attack.POUNCE), "fight matches next move " + i);
        }
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
