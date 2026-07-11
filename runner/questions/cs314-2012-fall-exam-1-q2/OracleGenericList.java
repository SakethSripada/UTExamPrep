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

public void interleave(OracleGenericList<E> other) {
        int newCap = (this.size + other.size + 1) * 2;
        E[] temp = (E[]) new Object[newCap];
        int minSize = Math.min(this.size, other.size);

            // copy elements from each
            for(int i = 0; i < minSize; i++) {
                temp[i * 2] = this.values[i];
                temp[i * 2 + 1] = other.values[i];
            }

            // One of the two lists may have left over values.
            // Copy the values onto end of the result.
            int indexResult = minSize * 2;
            for(int i = minSize; i < this.size; i++) {
                temp[indexResult] = this.values[i];
                indexResult++;
            }
            for(int i = minSize; i < other.size; i++) {
                temp[indexResult] = other.values[i];
                indexResult++;
            }
            size += other.size;
            this.values = temp;
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
