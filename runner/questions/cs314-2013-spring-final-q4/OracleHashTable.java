import java.util.*;

class OracleHashTable<E> implements ExamSnapshot {
    private static final Object EMPTY = new Object();
    private E[] con;
    private int size;
    private double LOAD_LIMIT = 0.75;
    private Node<E> header;
    private static class Node<T> {
        private T data; private Node<T> prev, next, listNode;
        Node() { } Node(T data, Node<T> next) { this.data = data; this.next = next; }
    }
    private OracleHashTable() {
        con = (E[]) new Object[8];
        header = new Node<>();
    }
    
public boolean remove(E target) {
    int index = Math.abs(target.hashCode()) % con.length;
    int checked = 0;
    while (con[index] != null && checked < con.length) {
        if (target.equals(con[index])) {
            con[index] = (E) EMPTY;
            size--;
            return true;
        }
        index = (index + 1) % con.length;
        checked++;
    }
    return false;
}
    static OracleHashTable<Integer> fixture() {
        OracleHashTable table = new OracleHashTable();
        for (int value : new int[]{1,2,3}) {
            int index = Math.abs(Integer.valueOf(value).hashCode()) % table.con.length;
            while (table.con[index] != null) index = (index + 1) % table.con.length;
            table.con[index] = value; table.size++;
        }
        return table;
    }
    public Object examCall(int caseIndex) {
        Object result = remove((E) (Integer.valueOf(2)));
        return result;
    }
    private String nodeString(Node node) {
        ArrayList<Object> values = new ArrayList<>(); int guard = 0;
        while (node != null && guard++ < 50) { values.add(node.data); node = node.next; }
        return values.toString();
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        for (Object item : con) values.add(item == EMPTY ? "<EMPTY>" : item instanceof Node ? nodeString((Node) item) : String.valueOf(item));
        return size + ":" + values + ":" + nodeString(header);
    }
}