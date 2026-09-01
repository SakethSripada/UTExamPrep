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

public int lengthOfStartingMatch (OracleGenericList<E> other) {
    int index = 0;
    boolean match = true;
    while(match && index < this.size && index < other.size) {
        E thisVal = this.values[index];
        E otherVal = other.values[index];
        if(thisVal == null)
            match = otherVal == null;
        else
            match = thisVal.equals(otherVal);
        // increment index only if still matching
        if(match)
            index++;
    }
    return index;
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
