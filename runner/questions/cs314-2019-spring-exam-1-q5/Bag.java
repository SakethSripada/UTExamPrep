import java.util.*;

class Bag<E extends Comparable<E>> implements ExamSnapshot {
    private E[] con; private E[] elements; private E[] data;
    private int size; private int numberOfElements;
    private Bag() { setCapacity(10); }
    private void setCapacity(int capacity) {
        E[] array = (E[]) new Comparable[capacity];
        con = array; elements = array; data = array;
    }
    
// __STUDENT_CODE__
    static Bag<Integer> fixture() {
        Bag result = new Bag();
        Object[] values = {1, 2, 2, 3, 4};
        for (Object value : values) result.con[result.size++] = (Integer) value;
        result.numberOfElements = result.size;
        return result;
    }
    public Object examCall(int caseIndex) {
        Bag other = Bag.fixture();
        Object result = addIfFewerThan((E) Integer.valueOf(2), 3);
        numberOfElements = size = Math.min(Math.max(size, numberOfElements), con.length);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() { return size + ":" + numberOfElements + ":" + Arrays.toString(con); }
}