import java.util.*;

class OracleLinkedList implements ExamSnapshot {
    private Node first; private Node head; private Node last; private Node header;
    private int size;
    private static class Node {
        private int data; private int value; private int element; private int val;
        private Node next; private Node prev;
        Node() { }
        Node(int value) { data = value; this.value = value; element = value; val = value; }
        Node(int value, Node next) { this(value); this.next = next; }
        int getData() { return data; } int getValue() { return data; }
        Node getNext() { return next; } Node getPrev() { return prev; }
        void setNext(Node node) { next = node; } void setPrev(Node node) { prev = node; }
    }

public void removePairs(int tgt) {
     // SCOUT AND TRAIL NODE SOLUTION
     Node trail = header.next;
     Node scout = header.next.next;

     while(scout != header) {
          if(trail.data + scout.data == tgt) {
               size -= 2;
               trail = trail.prev;
               scout = scout.next;
               trail.next = scout;
               scout.prev = trail;
               // special case if backed up to header
               if(trail == header) {
                    trail = trail.next;
                    scout = scout.next;
               }

          }
          else {
               trail = trail.next;
               scout = scout.next;
          }
     }
}

    private OracleLinkedList() { }
    static OracleLinkedList fixture() {
        OracleLinkedList list = new OracleLinkedList();
        int[] values = new int[]{1, 2, 2, 3, 4};
        Node previous = null;
        for (int value : values) {
            Node node = new Node(value);
            if (list.first == null) list.first = node; else previous.next = node;
            node.prev = previous; previous = node; list.size++;
        }
        list.head = list.first; list.last = previous;
        list.header = new Node();
        list.header.next = list.first; if (list.first != null) list.first.prev = list.header;
        
        return list;
    }
    public Object examCall(int caseIndex) {
        OracleLinkedList other = OracleLinkedList.fixture();
        
        Object result = null; removePairs(2);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        Node current = first != null ? first : (header == null ? null : header.next);
        int guard = 0;
        while (current != null && current != header && guard++ < 100) { values.add(String.valueOf(current.data)); current = current.next; }
        return size + ":" + values + (guard >= 100 ? ":cycle" : "");
    }
}