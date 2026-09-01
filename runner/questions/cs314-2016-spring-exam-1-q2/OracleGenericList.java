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

public OracleGenericList<E> getDualSublist(OracleGenericList<E> other,
                                                                int start, int stop) {
     final int NEW_SIZE = this.size + other.size();
     OracleGenericList<E> result = new OracleGenericList<E>(NEW_SIZE + 10);
     final int NUM_ELEMENTS = stop - start;
     for (int i = 0; i < NUM_ELEMENTS; i++) {
             result.container[i] = this.container[start + i];
     }
     for (int i = 0; i < NUM_ELEMENTS; i++) {
             result.container[i + NUM_ELEMENTS] = other.container[start + i];
     }
     result.size = NUM_ELEMENTS * 2;
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
