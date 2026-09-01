import java.util.*;
import java.io.*;

class OracleGenericList<E> implements ExamSnapshot {
    private E[] con;
    private E[] values;
    private E[] container;
    private E[] data;
    private int size;

    public OracleGenericList() { this(10); }
    @SuppressWarnings("unchecked")
    public OracleGenericList(int capacity) {
        con = (E[]) new Object[Math.max(0, capacity)];
        values = con;
        container = con;
        data = con;
    }
    @SuppressWarnings("unchecked")
    private E[] getArray(int capacity) { return (E[]) new Object[capacity]; }
    public int size() { return size; }
    public E get(int index) { return container[index]; }

public OracleGenericList<E> getNonMatchingPairs(OracleGenericList<E> other) {

        // create result large enough to hold all pairs
        OracleGenericList<E> result = new OracleGenericList<E>();
        result.container = getArray(size + other.size);

        int minSize = size < other.size ? size : other.size;

        for (int i = 0; i < minSize; i++) {
             E o1 = container[i];
             E o2 = other.container[i];
             if (!o1.equals(o2)) {
                   // non matching so add to result
                   result.container[result.size] = o1;
                   result.container[result.size + 1] = o2;
                   result.size += 2;
             }
        }
        return result;
}

    @SafeVarargs
    static <T> OracleGenericList<T> of(T... items) {
        OracleGenericList<T> list = new OracleGenericList<>(items.length + 5);
        for (T item : items) list.container[list.size++] = item;
        return list;
    }
    public String examSnapshot() {
        return size + ":" + Arrays.toString(Arrays.copyOf(container, Math.max(0, Math.min(size, container.length))));
    }
}
