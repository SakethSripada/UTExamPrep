import java.util.*;

class OracleHashTable implements ExamSnapshot {
    private static final Object EMPTY = new Object();
    private Node[] con;
    private int size;
    private double LOAD_LIMIT = 0.75;
    private Node header;
    private static class Node<T> {
        private T data; private Node<T> prev, next, listNode;
        Node() { } Node(T data, Node<T> next) { this.data = data; this.next = next; }
    }
    private OracleHashTable() {
        con = (Node[]) new Node[8];
        header = new Node<>();
    }
    
    private void resize() { con = Arrays.copyOf(con, con.length * 2); }
public boolean add(Object o) {
       int oldSize = size;
       // Determine the bucket o should be at.
       int index = o.hashCode();
       index = Math.abs(index);
       index %= con.length;
       if (con[index] == null) {
              // Empty bucket!
              con[index] = new Node(o, null);
              size++;
       } else {
              // Not an empty bucket. I'll use a trailer reference.
              Node lead = con[index];
              Node trail = null;
              boolean found = false;
              while (lead != null && !found) {
                  if (lead.data.equals(o)) {
                         // The Object o is already here!!!
                         found = true;
                  } else {
                         // Go on to next node.
                         trail = lead;
                         lead = lead.next;
                  }
              }
              if (!found) {
              // Did not find an object equal to o in the chain.
              // Add to then end. trail is referring to the old last node.
                  trail.next = new Node(o, null);
                  size++;
              }
       }
       // Should we resize?
       if (1.0 * size / con.length >= LOAD_LIMIT) {
              resize();
         }
       return size != oldSize;
}
    static OracleHashTable fixture() {
        OracleHashTable table = new OracleHashTable();
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