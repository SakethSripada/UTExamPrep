import java.util.*;
import java.io.*;

class OracleGenericList<E extends Comparable<E>> implements ExamSnapshot {
    private E[] con;
    private E[] values;
    private E[] container;
    private E[] data;
    private int size;

    public OracleGenericList() { this(10); }
    @SuppressWarnings("unchecked")
    public OracleGenericList(int capacity) {
        con = (E[]) new Comparable[Math.max(0, capacity)];
        values = con;
        container = con;
        data = con;
    }
    @SuppressWarnings("unchecked")
    private E[] getArray(int capacity) { return (E[]) new Object[capacity]; }
    public int size() { return size; }
    public E get(int index) { return con[index]; }

public OracleGenericList<E> getMaxList(OracleGenericList<E> other) {
    int newSize = Math.max(size, other.size);
    E[] resultArray = (E[]) new Comparable[newSize + 10];
    int minSize = Math.min(size, other.size);
    for (int index = 0; index < minSize; index++) {
        resultArray[index] = con[index].compareTo(other.con[index]) > 0 ? con[index] : other.con[index];
    }
    E[] rest = size > other.size ? con : other.con;
    for (int index = minSize; index < newSize; index++) resultArray[index] = rest[index];
    OracleGenericList<E> result = new OracleGenericList<>();
    result.con = resultArray;
    result.size = newSize;
    return result;
}

    @SafeVarargs
    static <T extends Comparable<T>> OracleGenericList<T> of(T... items) {
        OracleGenericList<T> list = new OracleGenericList<>(items.length + 5);
        for (T item : items) list.con[list.size++] = item;
        return list;
    }
    public String examSnapshot() {
        return size + ":" + Arrays.toString(Arrays.copyOf(con, Math.max(0, Math.min(size, con.length))));
    }
}
