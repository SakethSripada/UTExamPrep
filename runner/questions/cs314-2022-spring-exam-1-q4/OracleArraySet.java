import java.util.*;

class OracleArraySet<E extends Comparable<E>> implements ExamSnapshot {
    private E[] con; private E[] elements; private E[] data;
    private int size; private int numberOfElements;
    private OracleArraySet() { setCapacity(10); }
    private void setCapacity(int capacity) {
        E[] array = (E[]) new Comparable[capacity];
        con = array; elements = array; data = array;
    }
    
    private void resize() {
        E[] old = con; setCapacity(Math.max(1, old.length * 2));
        System.arraycopy(old, 0, con, 0, old.length);
    }
public int removeAll(OracleArraySet<E> other) {
    int originalSize = size;
    for (int otherIndex = 0; otherIndex < other.size; otherIndex++) {
        E target = other.con[otherIndex];
        int index = 0;
        while (index < size) {
            if (con[index].equals(target)) {
                size--;
                con[index] = con[size];
                con[size] = null;
                break;
            }
            index++;
        }
    }
    return originalSize - size;
}
    static OracleArraySet<Integer> fixture() {
        OracleArraySet result = new OracleArraySet();
        Object[] values = {1, 2, 2, 3, 4};
        for (Object value : values) result.con[result.size++] = (Integer) value;
        result.numberOfElements = result.size;
        return result;
    }
    public Object examCall(int caseIndex) {
        OracleArraySet other = OracleArraySet.fixture();
        Object result = removeAll(other);
        numberOfElements = size = Math.min(Math.max(size, numberOfElements), con.length);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() { return size + ":" + numberOfElements + ":" + Arrays.toString(con); }
}