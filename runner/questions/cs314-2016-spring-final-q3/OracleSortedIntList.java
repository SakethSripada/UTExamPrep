import java.util.*;

class OracleSortedIntList implements ExamSnapshot {
    private IntNode first; private IntNode head; private IntNode last; private IntNode header;
    private int size;
    private static class IntNode {
        private int data; private int value; private int element; private int val;
        private IntNode next; private IntNode prev;
        IntNode() { }
        IntNode(int value) { data = value; this.value = value; element = value; val = value; }
        IntNode(int value, IntNode next) { this(value); this.next = next; }
        int getData() { return value; } int getValue() { return value; }
        IntNode getNext() { return next; } IntNode getPrev() { return prev; }
        void setNext(IntNode node) { next = node; } void setPrev(IntNode node) { prev = node; }
    }

public int remove(int value) {
    int removed = 0;
    IntNode lead = first;
    IntNode trailer = null;
    while (lead != null && lead.value <= value) {
        if (lead.value == value) removed++;
        if (removed == 0) trailer = lead;
        lead = lead.next;
    }
    if (removed != 0) {
        if (trailer == null) first = lead;
        else trailer.next = lead;
        size -= removed;
    }
    return removed;
}

    private OracleSortedIntList() { }
    static OracleSortedIntList fixture() {
        OracleSortedIntList list = new OracleSortedIntList();
        int[] values = new int[]{1, 2, 2, 3, 4};
        IntNode previous = null;
        for (int value : values) {
            IntNode node = new IntNode(value);
            if (list.first == null) list.first = node; else previous.next = node;
            node.prev = previous; previous = node; list.size++;
        }
        list.head = list.first; list.last = previous;
        list.header = new IntNode();
        list.header.next = list.first; if (list.first != null) list.first.prev = list.header;
        
        return list;
    }
    public Object examCall(int caseIndex) {
        OracleSortedIntList other = OracleSortedIntList.fixture();
        
        Object result = remove(2);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        IntNode current = first != null ? first : (header == null ? null : header.next);
        int guard = 0;
        while (current != null && current != header && guard++ < 100) { values.add(String.valueOf(current.value)); current = current.next; }
        return size + ":" + values + (guard >= 100 ? ":cycle" : "");
    }
}