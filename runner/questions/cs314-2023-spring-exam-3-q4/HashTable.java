import java.util.*;

class HashTable implements ExamSnapshot {
    private static final Object EMPTY = new Object();
    private Node[] con;
    private int size;
    private double LOAD_LIMIT = 0.75;
    private Node header;
    private static class Node<T> {
        private T data; private Node<T> prev, next, listNode;
        Node() { } Node(T data, Node<T> next) { this.data = data; this.next = next; }
    }
    private HashTable() {
        con = (Node[]) new Node[8];
        header = new Node<>();
    }
    
    private void resize() { con = Arrays.copyOf(con, con.length * 2); }
// __STUDENT_CODE__
    static HashTable fixture() {
        HashTable table = new HashTable();
        for (int value : new int[]{1,2,3}) {
            int index = Math.abs(Integer.valueOf(value).hashCode()) % table.con.length;
            Node bucketNode = new Node(value, table.con[index]); table.con[index] = bucketNode; table.size++;
        }
        return table;
    }
    public Object examCall(int caseIndex) {
        Object result = add(caseIndex % 2 == 0 ? Integer.valueOf(9) : Integer.valueOf(2));
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