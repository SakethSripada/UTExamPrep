import java.util.*;
import java.io.*;

class GenericList<E extends Comparable<E>> implements ExamSnapshot {
    private E[] con;
    private E[] values;
    private E[] container;
    private E[] data;
    private int size;

    public GenericList() { this(10); }
    @SuppressWarnings("unchecked")
    public GenericList(int capacity) {
        con = (E[]) new Comparable[Math.max(0, capacity)];
        values = con;
        container = con;
        data = con;
    }
    @SuppressWarnings("unchecked")
    private E[] getArray(int capacity) { return (E[]) new Object[capacity]; }
    public int size() { return size; }
    public E get(int index) { return con[index]; }

// __STUDENT_CODE__

    @SafeVarargs
    static <T extends Comparable<T>> GenericList<T> of(T... items) {
        GenericList<T> list = new GenericList<>(items.length + 5);
        for (T item : items) list.con[list.size++] = item;
        return list;
    }
    public String examSnapshot() {
        return size + ":" + Arrays.toString(Arrays.copyOf(con, Math.max(0, Math.min(size, con.length))));
    }
}
