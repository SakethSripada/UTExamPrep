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
    public E get(int index) { return values[index]; }

public int trimEqualBacks(OracleGenericList<E> other) {
    int indexThis = size - 1;
    int indexOther = other.size - 1;
    int result = 0;
    while(indexThis >= 0 && indexOther >= 0 &&
               values[indexThis].equals(other.values[indexOther])){
        result++;
        values[indexThis] = null;
        indexThis--;
        other.values[indexOther] = null;
        indexOther--;
    }

       size -= result;
       other.size -= result;

     return result;
 }

    @SafeVarargs
    static <T> OracleGenericList<T> of(T... items) {
        OracleGenericList<T> list = new OracleGenericList<>(items.length + 5);
        for (T item : items) list.values[list.size++] = item;
        return list;
    }
    public String examSnapshot() {
        return size + ":" + Arrays.toString(Arrays.copyOf(values, Math.max(0, Math.min(size, values.length))));
    }
}
