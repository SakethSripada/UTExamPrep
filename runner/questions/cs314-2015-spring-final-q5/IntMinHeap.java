import java.util.*;

class IntMinHeap implements ExamSnapshot {
    private int[] con; private int[] heap; private int[] elements; private int size;
    private IntMinHeap() { set(new int[20]); }
    private void set(int[] values) { con = values; heap = values; elements = values; }
    private void resize() { set(Arrays.copyOf(con, con.length * 2)); }
// __STUDENT_CODE__
    static IntMinHeap fixture() {
        IntMinHeap result = new IntMinHeap();
        int[] values = {0, 9, 7, 8, 3, 2, 6}; result.size = 6;
        for (int index = 1; index <= result.size; index++) result.con[index] = values[index];
        return result;
    }
    public Object examCall(int caseIndex) { decreaseElement(7, 3); return null; }
    public String examSnapshot() { return size + ":" + Arrays.toString(con); }
}