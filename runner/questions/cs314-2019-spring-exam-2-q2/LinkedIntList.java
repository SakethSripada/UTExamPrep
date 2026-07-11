import java.util.*;

class LinkedIntList implements ExamSnapshot {
    private IntNode first; private IntNode head; private IntNode last; private IntNode header;
    private int size;
    private static class IntNode {
        private int data; private int value; private int element; private int val;
        private IntNode next; private IntNode prev;
        IntNode() { }
        IntNode(int value) { data = value; this.value = value; element = value; val = value; }
        IntNode(int value, IntNode next) { this(value); this.next = next; }
        int getData() { return data; } int getValue() { return data; }
        IntNode getNext() { return next; } IntNode getPrev() { return prev; }
        void setNext(IntNode node) { next = node; } void setPrev(IntNode node) { prev = node; }
    }

// __STUDENT_CODE__

    private LinkedIntList() { }
    static LinkedIntList fixture() {
        LinkedIntList list = new LinkedIntList();
        int[] values = new int[]{1, 1, 1, 0, 4};
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
        LinkedIntList other = LinkedIntList.fixture();
        
        Object result = rangeEqualsTarget(2, 1, 4);
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        IntNode current = first != null ? first : (header == null ? null : header.next);
        int guard = 0;
        while (current != null && current != header && guard++ < 100) { values.add(String.valueOf(current.data)); current = current.next; }
        return size + ":" + values + (guard >= 100 ? ":cycle" : "");
    }
}