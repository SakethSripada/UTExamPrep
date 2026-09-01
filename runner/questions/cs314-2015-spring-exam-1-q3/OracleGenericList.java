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
    public E get(int index) { return container[index]; }

public OracleGenericList<E> inOtherListOnly(OracleGenericList<E> other) {
     OracleGenericList<E> result = new OracleGenericList<E>();
     result.container = getArray(other.size);
     for(int i = 0; i < other.size; i++) {
            E current = other.container[i];
            int indexThis = 0;
            boolean distinct = true;
            while(distinct && indexThis < this.size) {
                   distinct = !current.equals(this.container[indexThis]);
                   indexThis++;
            }
            if(distinct) {
                   result.container[result.size] = current;
                   result.size++;
            }
     }
     return result;
}

    @SafeVarargs
    static <T> OracleGenericList<T> of(T... items) {
        OracleGenericList<T> list = new OracleGenericList<>(items.length + 5);
        for (T item : items) list.container[list.size++] = item;
        return list;
    }
    public String examSnapshot() {
        return size + ":" + Arrays.toString(Arrays.copyOf(container, Math.max(0, Math.min(size, container.length))));
    }
}
