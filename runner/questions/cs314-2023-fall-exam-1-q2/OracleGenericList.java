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

public OracleGenericList getMatchingElements(OracleGenericList other) {
    int minSize = size < other.size ? size : other.size;
    OracleGenericList result = new OracleGenericList(minSize + 10);
    int rs = 0; // result size
    for (int i = 0; i < minSize; i++) {
        if (con[i] == null && other.con[i] == null) {
            result.con[rs] = con[i];
            rs++;
        } else if(con[i] != null && con[i].equals(other.con[i])) {
            result.con[rs] = con[i];
            rs++;
        }
    }
    result.size = rs;
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
