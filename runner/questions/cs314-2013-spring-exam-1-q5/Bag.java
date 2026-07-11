import java.util.*;

class Bag implements ExamSnapshot {
    private Object[] con; private Object[] elements; private Object[] data;
    private int size; private int numberOfElements;
    private Bag() { setCapacity(10); }
    private void setCapacity(int capacity) {
        Object[] array = (Object[]) new Object[capacity];
        con = array; elements = array; data = array;
    }
    
    private void resize() {
        Object[] old = con; setCapacity(Math.max(1, old.length * 2));
        System.arraycopy(old, 0, con, 0, old.length);
    }
// __STUDENT_CODE__
    static Bag fixture() {
        Bag result = new Bag();
        Object[] values = {1, 2, 2, 3, 4};
        for (Object value : values) result.con[result.size++] = value;
        result.numberOfElements = result.size;
        return result;
    }
    public Object examCall(int caseIndex) {
        Bag other = Bag.fixture();
        Object result = removeSingleOccurrence(Integer.valueOf(2));
        numberOfElements = size = Math.min(Math.max(size, numberOfElements), con.length);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() { return size + ":" + numberOfElements + ":" + Arrays.toString(con); }
}