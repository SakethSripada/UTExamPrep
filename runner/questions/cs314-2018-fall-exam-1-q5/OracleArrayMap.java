import java.util.*;

class OracleArrayMap implements ExamSnapshot {
    private Object[][] kvPairs;
    private int size;
    private Entry[] con;
    private static class Entry<K, V> { private K key; private V value; Entry(K key, V value) { this.key = key; this.value = value; } }
    private OracleArrayMap() { }
    private void resizeArray(int capacity) {
        Object[][] resized = new Object[2][capacity];
        for (int row = 0; row < 2; row++) System.arraycopy(kvPairs[row], 0, resized[row], 0, size);
        kvPairs = resized;
    }
public Object put(Object key, Object value) {
     for (int i = 0; i < size; i++) {
          if (kvPairs[0][i].equals(key)) {
               // key already present, replace current value.
               Object old = kvPairs[1][i];
               kvPairs[1][i] = value;
               return old; // And we're done here.
          }
     }

        // Never found key, this is a new key-value pair.
        // Do we need more capacity?
        if (size == kvPairs[0].length) {
             resizeArray(size + 10);
        }
        kvPairs[0][size] = key;
        kvPairs[1][size] = value;
        size++;
        return null; // There wasn't an old value.
}
    static OracleArrayMap fixture() {
        OracleArrayMap map = new OracleArrayMap();
        map.kvPairs = new Object[2][10];
        map.kvPairs[0][0] = "A"; map.kvPairs[1][0] = 1;
        map.kvPairs[0][1] = "B"; map.kvPairs[1][1] = 2; map.size = 2;
        map.con = new Entry[12]; map.con[1] = new Entry("A", 1); map.con[5] = new Entry("B", 2);
        return map;
    }
    public Object examCall(int caseIndex) {
        Object[] keys = {"A", caseIndex % 2 == 0 ? "Z" : "B"};
        Object result = put("A", "value");
        return result;
    }
    public String examSnapshot() {
        ArrayList<String> entries = new ArrayList<>();
        if (con != null) for (Entry entry : con) if (entry != null) entries.add(entry.key + "=" + entry.value);
        return size + ":" + Arrays.deepToString(kvPairs) + ":" + entries;
    }
}