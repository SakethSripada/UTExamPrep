import java.util.*;

class OracleIntMinHeap implements ExamSnapshot {
    private int[] con; private int[] heap; private int[] elements; private int size;
    private OracleIntMinHeap() { set(new int[20]); }
    private void set(int[] values) { con = values; heap = values; elements = values; }
    private void resize() { set(Arrays.copyOf(con, con.length * 2)); }
public void decreaseElement(int element, int amount) {
    int index = 1;
    while (index <= size && con[index] != element) index++;
    if (index <= size) {
        con[index] -= amount;
        while (index > 1 && con[index] < con[index / 2]) {
            int temporary = con[index];
            con[index] = con[index / 2];
            con[index / 2] = temporary;
            index /= 2;
        }
    }
}
    static OracleIntMinHeap fixture() {
        OracleIntMinHeap result = new OracleIntMinHeap();
        int[] values = {0, 9, 7, 8, 3, 2, 6}; result.size = 6;
        for (int index = 1; index <= result.size; index++) result.con[index] = values[index];
        return result;
    }
    public Object examCall(int caseIndex) { decreaseElement(7, 3); return null; }
    public String examSnapshot() { return size + ":" + Arrays.toString(con); }
}