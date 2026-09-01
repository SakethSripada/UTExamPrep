import java.util.*;

public class TestRunner {
    private static int passed;
    private static int total;

    private static void check(boolean condition, String name) {
        total++;
        if (condition) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            System.out.println("FAIL " + name);
        }
    }

    private static boolean throwsType(Runnable action, Class<? extends Throwable> type) {
        try { action.run(); return false; }
        catch (Throwable error) { return type.isInstance(error); }
    }

    public static void main(String[] args) {
        Bag<String> bag = Bag.of("A", "B", "A");
        Iterator<String> iterator = bag.iterator();
        check(iterator.hasNext(), "initial hasNext");
        check("A".equals(iterator.next()), "first value through gap-aware iterator");
        iterator.remove();
        check(bag.examSize() == 2, "remove decrements bag size");
        check(throwsType(iterator::remove, IllegalStateException.class), "double remove rejected");
        check("B".equals(iterator.next()), "second value");
        check("A".equals(iterator.next()), "third value");
        check(!iterator.hasNext(), "exhausted iterator");
        check(throwsType(iterator::next, NoSuchElementException.class), "next past end rejected");
        Bag<Integer> empty = Bag.of();
        check(!empty.iterator().hasNext(), "empty bag");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
