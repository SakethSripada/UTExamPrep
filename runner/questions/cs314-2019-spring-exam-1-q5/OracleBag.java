import java.util.*;

class OracleBag<E extends Comparable<E>> implements ExamSnapshot {
    private E[] con; private E[] elements; private E[] data;
    private int size; private int numberOfElements;
    private OracleBag() { setCapacity(10); }
    private void setCapacity(int capacity) {
        E[] array = (E[]) new Comparable[capacity];
        con = array; elements = array; data = array;
    }
    
public boolean addIfFewerThan(E val, int max) {
    int indexNull = -1;
    int numFound = 0;
    for (int i = 0; i < con.length; i++) {
        if (con[i] == null) {
             indexNull = i; // spot to place if we add
        } else if (con[i].equals(val)) {
             numFound++;
             if (numFound == max) {
                 return false;// too many
             }
        }
    }
    // there weren't too many instances of val
    if (con.length == size) {
        resize();
          indexNull = size; // there were no nulls
    }
    con[indexNull] = val;
    size++;
    return true;
}

private void resize() {
    E[] temp = (E[]) new Object[con.length * 2];
    for (int i = 0; i < con.length; i++) {
        temp[i] = con[i]; // okay if null
    }
    con = temp;
}
    static OracleBag<Integer> fixture() {
        OracleBag result = new OracleBag();
        Object[] values = {1, 2, 2, 3, 4};
        for (Object value : values) result.con[result.size++] = (Integer) value;
        result.numberOfElements = result.size;
        return result;
    }
    public Object examCall(int caseIndex) {
        OracleBag other = OracleBag.fixture();
        Object result = addIfFewerThan((E) Integer.valueOf(2), 3);
        numberOfElements = size = Math.min(Math.max(size, numberOfElements), con.length);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() { return size + ":" + numberOfElements + ":" + Arrays.toString(con); }
}