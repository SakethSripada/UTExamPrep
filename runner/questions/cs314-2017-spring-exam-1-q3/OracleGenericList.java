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
    public E get(int index) { return con[index]; }

public OracleGenericList<E> getMatchingElements(OracleGenericList<E> other) {

        int minSize = size < other.size ? this.size : other.size;

        // create result large enough to hold all pairs with a little extra capacity
        OracleGenericList<E> result = new OracleGenericList<E>(minSize + 10);

        for (int i = 0; i < minSize; i++) {
             E o1 = this.con[i];
             E o2 = other.con[i];
             if (o1.equals(o2)) {
                   // matching so add to result
                   result.con[result.size] = o1;
                   result.size++;
             }
        }
        return result;
}

    @SafeVarargs
    static <T> OracleGenericList<T> of(T... items) {
        OracleGenericList<T> list = new OracleGenericList<>(items.length + 5);
        for (T item : items) list.con[list.size++] = item;
        return list;
    }
    public String examSnapshot() {
        return size + ":" + Arrays.toString(Arrays.copyOf(con, Math.max(0, Math.min(size, con.length))));
    }
}
