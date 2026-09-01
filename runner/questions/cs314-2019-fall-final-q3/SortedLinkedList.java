import java.util.*;

class SortedLinkedList<E extends Comparable<E>> implements ExamSnapshot {
    private Node<E> first; private Node<E> head; private Node<E> last; private Node<E> header;
    private int size;
    private static class Node<T> {
        private T data; private T value; private T element; private T val;
        private Node<T> next; private Node<T> prev;
        Node() { }
        Node(T value) { data = value; this.value = value; element = value; val = value; }
        Node(T value, Node<T> next) { this(value); this.next = next; }
        T getData() { return data; } T getValue() { return data; }
        Node<T> getNext() { return next; } Node<T> getPrev() { return prev; }
        void setNext(Node<T> node) { next = node; } void setPrev(Node<T> node) { prev = node; }
    }

// __STUDENT_CODE__

    private SortedLinkedList() { }
    static SortedLinkedList<Integer> fixture() {
        SortedLinkedList<Integer> list = new SortedLinkedList<>();
        int[] values = new int[]{1, 2, 2, 3, 4};
        Node<Integer> previous = null;
        for (int value : values) {
            Node<Integer> node = new Node<>(value);
            if (list.first == null) list.first = node; else previous.next = node;
            node.prev = previous; previous = node; list.size++;
        }
        list.head = list.first; list.last = previous;
        list.header = new Node<>();
        list.header.next = list.first; if (list.first != null) list.first.prev = list.header;
        
        return list;
    }
    public Object examCall(int caseIndex) {
        SortedLinkedList other = SortedLinkedList.fixture();
        
        Object result = null; add((E) Integer.valueOf(2));
        return Arrays.asList(result, other.examSnapshot());
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        Node<E> current = first != null ? first : (header == null ? null : header.next);
        int guard = 0;
        while (current != null && current != header && guard++ < 100) { values.add(String.valueOf(current.data)); current = current.next; }
        return size + ":" + values + (guard >= 100 ? ":cycle" : "");
    }
}