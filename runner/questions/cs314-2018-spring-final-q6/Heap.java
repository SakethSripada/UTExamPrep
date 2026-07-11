import java.util.*;

class Heap<E extends Comparable<E>> implements ExamSnapshot {
    private E[] con; private E[] heap; private E[] elements; private int size;
    private Heap() { set((E[]) new Comparable[20]); }
    private void set(E[] values) { con = values; heap = values; elements = values; }
    private void resize() { set(Arrays.copyOf(con, con.length * 2)); }
// __STUDENT_CODE__
    static Heap<Integer> fixture() {
        Heap result = new Heap();
        int[] values = {0, 9, 7, 8, 3, 2, 6}; result.size = 6;
        for (int index = 1; index <= result.size; index++) result.con[index] = values[index];
        return result;
    }
    public Object examCall(int caseIndex) { add((E) Integer.valueOf(9)); return null; }
    public String examSnapshot() { return size + ":" + Arrays.toString(con); }
}