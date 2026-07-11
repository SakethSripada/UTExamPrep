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

public OracleGenericList<E> scale (int factor, E tgt) {
    // Determine how much space we need. Avoid resizing
    int newSize = scaleHelp(factor, tgt);
    OracleGenericList<E> result = new OracleGenericList<E>();
    // we know how big to make the con, add a bit of extra capacity
    result.con = (E[]) new Object[newSize + 10];
    for (int i = 0; i < size; i++) {
        if (!con[i].equals(tgt))
            // add factor copies of element to result
            for (int j = 0; j < factor; j++) {
                result.con[result.size] = con[i];
                result.size++;
            }
    }
    return result;
}

private int scaleHelp(int factor, E tgt) {
    int newSize = 0;
    for (int i = 0; i < size; i++)
        if (!con[i].equals(tgt))
            newSize += factor;
    return newSize;
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
