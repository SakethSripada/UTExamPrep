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

public OracleGenericList<E> getEqualFronts(OracleGenericList<E> other) {
     // first pass to determine needed space
     final int MIN_SIZE = (size < other.size) ? size : other.size;
     int i = 0;
     while (i < MIN_SIZE && con[i].equals(other.con[i])) {
         i++;
     }
     OracleGenericList<E> result = new OracleGenericList<>();
     // i is number of matches
     result.con = (E[]) (new Object[i * 2 + 10]);

        // we know the first i elements match.
        for (int j = 0; j < i; j++) {
             result.con[result.size] = con[j];
             result.con[result.size + 1] = other.con[j];
             result.size += 2;
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
