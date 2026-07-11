import java.util.*;

class ArraySet<E extends Comparable<E>> implements ExamSnapshot {
    private E[] con; private E[] elements; private E[] data;
    private int size; private int numberOfElements;
    private ArraySet() { setCapacity(10); }
    private void setCapacity(int capacity) {
        E[] array = (E[]) new Comparable[capacity];
        con = array; elements = array; data = array;
    }
    
    private void resize() {
        E[] old = con; setCapacity(Math.max(1, old.length * 2));
        System.arraycopy(old, 0, con, 0, old.length);
    }
// __STUDENT_CODE__
    static ArraySet<Integer> fixture() {
        ArraySet result = new ArraySet();
        Object[] values = {1, 2, 2, 3, 4};
        for (Object value : values) result.con[result.size++] = (Integer) value;
        result.numberOfElements = result.size;
        return result;
    }
    public Object examCall(int caseIndex) {
        ArraySet other = ArraySet.fixture();
        Object result = removeAll(other);
        numberOfElements = size = Math.min(Math.max(size, numberOfElements), con.length);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() { return size + ":" + numberOfElements + ":" + Arrays.toString(con); }
}