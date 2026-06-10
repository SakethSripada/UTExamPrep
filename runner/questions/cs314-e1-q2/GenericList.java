import java.util.*;

class GenericList<E> {
    private E[] con;
    private int size;

    public GenericList() { }

// __STUDENT_CODE__

    @SafeVarargs
    static <T> GenericList<T> of(T... vals) {
        GenericList<T> list = new GenericList<>();
        list.con = (T[]) new Object[vals.length + 5];
        for (T val : vals) {
            list.con[list.size++] = val;
        }
        return list;
    }

    int sizeForTest() { return size; }
    int capacityForTest() { return con == null ? 0 : con.length; }
    public String toString() {
        return Arrays.toString(Arrays.copyOf(con, size));
    }
}
