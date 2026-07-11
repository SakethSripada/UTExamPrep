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

public OracleGenericList<E> maxFrequency(OracleGenericList<E> other, E tgt,
           int start) {
      int countThis = count(start, tgt);
      int countOther = other.count(start, tgt);
      if (countThis > countOther) {
           return this;
      } else if (countThis < countOther) {
           return other;
      } else {
           // tie
           if (countThis == 0) {
               return null;
           } else if (size < other.size) {
               return this;
           } else {
               return other;
           }
      }
}
private int count(int st, E tgt) {
      int result = 0;
      for (int i = st; i < size; i++) {
           if (con[i].equals(tgt)) {
                 result++;
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
