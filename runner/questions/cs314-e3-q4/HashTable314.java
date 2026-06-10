import java.util.*;

class HashTable314<E> implements Iterable<E> {
    private List<E>[] con;
    private int size;

    public HashTable314(int cap) {
        con = new List[cap];
    }

    public Iterator<E> iterator() { return new HIterator(); }

// __STUDENT_CODE__

    void addToBucket(int bucket, E val) {
        if (con[bucket] == null) {
            con[bucket] = new LinkedList<>();
        }
        con[bucket].add(val);
        size++;
    }

    int sizeForTest() { return size; }
    boolean bucketIsNullForTest(int bucket) { return con[bucket] == null; }
}
