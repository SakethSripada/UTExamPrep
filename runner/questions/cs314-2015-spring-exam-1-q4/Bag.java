import java.util.*;

class Bag<E> implements Iterable<E> {
    private int size;
    private E[] container;

    @SuppressWarnings("unchecked")
    private Bag(E[] values) {
        container = (E[]) new Object[Math.max(3, values.length * 2 + 1)];
        for (int index = 0; index < values.length; index++) {
            container[index * 2] = values[index];
            size++;
        }
    }

    @SafeVarargs
    static <T> Bag<T> of(T... values) { return new Bag<T>(values); }
    int examSize() { return size; }
    public Iterator<E> iterator() { return new BagIterator(); }

// __STUDENT_CODE__
}
