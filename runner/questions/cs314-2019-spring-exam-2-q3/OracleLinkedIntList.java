import java.util.*;

class OracleLinkedIntList<E extends Comparable<E>> implements ExamSnapshot {
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

public OracleLinkedIntList combineIgnoreValue(OracleLinkedIntList other, int target) {
    OracleLinkedIntList result = new OracleLinkedIntList();
    IntNode left = first;
    IntNode right = other.first;
    IntNode resultTail = null;
    while (left != null && right != null) {
        if (left.data != target && right.data != target)
            resultTail = add(result, resultTail, left.data + right.data);
        left = left.next;
        right = right.next;
    }
    IntNode remainder = left != null ? left : right;
    while (remainder != null) {
        if (remainder.data != target) resultTail = add(result, resultTail, remainder.data);
        remainder = remainder.next;
    }
    return result;
}

private IntNode add(OracleLinkedIntList list, IntNode last, int value) {
    IntNode node = new IntNode(value);
    if (last == null) list.first = node;
    else last.next = node;
    list.size++;
    return node;
}

    private OracleLinkedIntList() { }
    static OracleLinkedIntList<Integer> fixture() {
        OracleLinkedIntList<Integer> list = new OracleLinkedIntList<>();
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
        OracleLinkedIntList other = OracleLinkedIntList.fixture();
        
        Object result = combineIgnoreValue(other, 3);
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