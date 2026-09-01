import java.util.*;

class OracleHeap<E extends Comparable<E>> implements ExamSnapshot {
    private E[] con; private E[] heap; private E[] elements; private int size;
    private OracleHeap() { set((E[]) new Comparable[20]); }
    private void set(E[] values) { con = values; heap = values; elements = values; }
    private void resize() { set(Arrays.copyOf(con, con.length * 2)); }
public void add(E value) {
    size++;
    if (size == con.length) resize();
    int child = size;
    int parent = (child + 1) / 3;
    while (child > 1 && value.compareTo(con[parent]) > 0) {
        con[child] = con[parent];
        child = parent;
        parent = (child + 1) / 3;
    }
    con[child] = value;
}
    static OracleHeap<Integer> fixture() {
        OracleHeap result = new OracleHeap();
        int[] values = {0, 9, 7, 8, 3, 2, 6}; result.size = 6;
        for (int index = 1; index <= result.size; index++) result.con[index] = values[index];
        return result;
    }
    public Object examCall(int caseIndex) { add((E) Integer.valueOf(9)); return null; }
    public String examSnapshot() { return size + ":" + Arrays.toString(con); }
}