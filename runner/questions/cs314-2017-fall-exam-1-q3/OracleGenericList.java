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

public OracleGenericList<E> inOtherList(OracleGenericList<E> other) {
    OracleGenericList<E> result = new OracleGenericList<>(size + 10);
    for (int indexThis = 0; indexThis < size; indexThis++) {
        boolean found = false;
        int indexOther = 0;
        while (!found && indexOther < other.size) {
            found =
this.con[indexThis].equals(other.con[indexOther]);
            indexOther++;
        }
        if (found) {
            result.con[result.size] = this.con[indexThis];
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
