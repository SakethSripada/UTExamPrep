import java.util.*;

class MultiSet<E> {
    private ValueAndFrequency<E>[] con;
    private int numDistinct;
    private int size;

    public MultiSet(int initialCapacity) {
        con = new ValueAndFrequency[initialCapacity];
    }

    private static class ValueAndFrequency<E> {
        private E element;
        private int frequency;
        private ValueAndFrequency(E e, int f) {
            element = e;
            frequency = f;
        }
    }

// __STUDENT_CODE__

    static <T> MultiSet<T> of(Object... pairs) {
        MultiSet<T> set = new MultiSet<>(pairs.length / 2 + 5);
        for (int i = 0; i < pairs.length; i += 2) {
            T element = (T) pairs[i];
            int frequency = (Integer) pairs[i + 1];
            set.con[set.numDistinct++] = new ValueAndFrequency<>(element, frequency);
            set.size += frequency;
        }
        return set;
    }

    String abstractViewForTest() {
        ArrayList<String> vals = new ArrayList<>();
        for (int i = 0; i < numDistinct; i++) {
            for (int j = 0; j < con[i].frequency; j++) {
                vals.add(String.valueOf(con[i].element));
            }
        }
        Collections.sort(vals);
        return vals.toString();
    }

    int sizeForTest() { return size; }
    int distinctForTest() { return numDistinct; }
}
