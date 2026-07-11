import java.util.*;

class OracleLinkedHashSet<E> implements ExamSnapshot {
    private static final Object EMPTY = new Object();
    private Node<E>[] con;
    private int size;
    private double LOAD_LIMIT = 0.75;
    private Node<E> header;
    private static class Node<T> {
        private T data; private Node<T> prev, next, listNode;
        Node() { } Node(T data, Node<T> next) { this.data = data; this.next = next; }
    }
    private OracleLinkedHashSet() {
        con = (Node<E>[]) new Node[8];
        header = new Node<>();
    }
    
public boolean remove(E val) {
    // determine the correct bucket
    int index = val.hashCode() % con.length;
    if (index < 0)
        index *= -1;
    boolean changed = false;
    if (con[index] != null) {
        // bucket exists
        Node<E> temp = con[index].next; // first node with data
        while (temp != null && !val.equals(temp.data))
            temp = temp.next;
        if (temp != null) {
            // found val
            changed = true;
            size--;
            removeNode(temp); // remove from bucket
            removeNode(temp.listNode); // remove from iteration list
            // all the data nodes gone from this bucket?
            if (con[index].next == null)
                con[index] = null; // don't need header node
        }
    }
    return changed;
}

private void removeNode(Node<E> n) {
       // always a prev
       n.prev.next = n.next;
       // is there a next?
       if (n.next != null)
              n.next.prev = n.prev;
}
    static OracleLinkedHashSet<Integer> fixture() {
        OracleLinkedHashSet table = new OracleLinkedHashSet();
        Node iterationTail = table.header;
        for (int value : new int[]{1,2,3}) {
            int index = Math.abs(Integer.valueOf(value).hashCode()) % table.con.length;
            Node bucketHeader = new Node(); Node dataNode = new Node(value, null);
            bucketHeader.next = dataNode; dataNode.prev = bucketHeader; table.con[index] = bucketHeader;
            Node listNode = new Node(value, null); iterationTail.next = listNode; listNode.prev = iterationTail; iterationTail = listNode; dataNode.listNode = listNode;
            table.size++;
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