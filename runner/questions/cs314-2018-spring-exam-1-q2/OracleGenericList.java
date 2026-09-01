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

public E mode() {
    int maxFrequency = 0;
    E result = null;
    for (int first = 0; first < size; first++) {
        int frequency = 1;
        for (int second = first + 1; second < size; second++) {
            if (con[first].equals(con[second])) frequency++;
        }
        if (frequency > maxFrequency) {
            maxFrequency = frequency;
            result = con[first];
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
