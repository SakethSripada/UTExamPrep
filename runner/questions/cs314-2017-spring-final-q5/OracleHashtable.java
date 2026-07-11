import java.util.*;

class OracleHashtable<E> implements ExamSnapshot {
    private static final Object EMPTY = new Object();
    private Node<E>[] con;
    private int size;
    private double LOAD_LIMIT = 0.75;
    private Node<E> header;
    private static class Node<T> {
        private T data; private Node<T> prev, next, listNode;
        Node() { } Node(T data, Node<T> next) { this.data = data; this.next = next; }
    }
    private OracleHashtable() {
        con = (Node<E>[]) new Node[8];
        header = new Node<>();
    }
    
public boolean remove(E value) {
    int oldSize = size;
    int index = Math.abs(value.hashCode() % con.length);
    if (con[index] != null) {
        if (con[index].data.equals(value)) {
            size--;
            con[index] = con[index].next;
        } else {
            Node<E> current = con[index];
            while (current.next != null && size == oldSize) {
                if (value.equals(current.next.data)) {
                    size--;
                    current.next = current.next.next;
                } else current = current.next;
            }
        }
    }
    return oldSize != size;
}
    static OracleHashtable<Integer> fixture() {
        OracleHashtable table = new OracleHashtable();
        for (int value : new int[]{1,2,3}) {
            int index = Math.abs(Integer.valueOf(value).hashCode()) % table.con.length;
            Node bucketNode = new Node(value, table.con[index]); table.con[index] = bucketNode; table.size++;
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