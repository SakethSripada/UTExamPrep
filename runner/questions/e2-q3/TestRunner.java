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
        JumpingBean bean = new JumpingBean();
        checkEquals(bean.getMove(), Critter.Direction.CENTER, "starts sitting still");
        checkEquals(bean.fight("x"), Critter.Attack.SCRATCH, "scratches while still");
        Critter.Direction first = bean.getMove();
        check(first == Critter.Direction.NORTH || first == Critter.Direction.WEST, "first moving direction");
        checkEquals(bean.fight("x"), Critter.Attack.FORFEIT, "forfeits while moving");
        checkEquals(bean.getMove(), first, "second step same direction");
        checkEquals(bean.getMove(), Critter.Direction.CENTER, "returns to center");
        checkEquals(bean.fight("x"), Critter.Attack.SCRATCH, "second win scratches");
        Critter.Direction second = bean.getMove();
        boolean fourMoves = second == bean.getMove() && second == bean.getMove() && second == bean.getMove();
        check(fourMoves, "second celebration has four moves");
        checkEquals(bean.getMove(), Critter.Direction.CENTER, "center after four moves");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
