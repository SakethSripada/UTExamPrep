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

public OracleGenericList(OracleGenericList<E> org, int[] counts) {
    // First, how much space do we need?
    int newSize = 0;
    for (int count : counts) {
        newSize += count;
    }
    // Add some extra capacity
    con = (E[]) new Object[newSize + 10];
    // Could add check if size > 0 to avoid extra
    // work, but not required.
    // Could use org.size instead of counts.length
    for (int i = 0; i < counts.length; i++) {
        for (int j = 0; j < counts[i]; j++) {
            con[size] = org.con[i];
            size++;
        }
    }
    // size should now equal newSize
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
