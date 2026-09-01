import java.util.*;

class OracleLinkedList314<E extends Comparable<E>> implements ExamSnapshot {
    private Node<E> first;
    private Node<E> head;
    private Node<E> front;
    private Node<E> last;
    private int size;

    private static class Node<E> {
        private E data;
        private E value;
        private E element;
        private Node<E> next;
        private Node<E> prev;
        private Node() { }
        private Node(E value) { this.data = value; this.value = value; this.element = value; }
        private Node(E value, Node<E> next) { this(value); this.next = next; }
        private E getData() { return data; }
        private E getValue() { return data; }
        private Node<E> getNext() { return next; }
        private Node<E> getPrev() { return prev; }
        private void setNext(Node<E> value) { next = value; }
        private void setPrev(Node<E> value) { prev = value; }
    }

public int removeEveryNth(int n) {
    int numRemoved = 0;
    if (first != null) {
        final int MOVES = n - 1;
        Node<E> temp = first;
        while (temp != null) {
            // move temp down n - 1 times if possible
            int count = 0;
            while (count < MOVES && temp != null) {
                temp = temp.next;
                count++;
            }
            if (temp != null) { // if temp IS null, not enough nodes
                if (temp.next != null) {
                     temp.next = temp.next.next;
                     numRemoved++;
                }
                else
                     // on last node, move temp to stop
                     temp = null;
            }
        }
        // now move first and remove first node
        first = first.next;
        numRemoved++;
    }
    return numRemoved;
}

    @SafeVarargs
    static <T extends Comparable<T>> OracleLinkedList314<T> of(T... items) {
        OracleLinkedList314<T> list = new OracleLinkedList314<>();
        Node<T> previous = null;
        for (T item : items) {
            Node<T> node = new Node<>(item);
            if (list.first == null) list.first = node;
            else previous.next = node;
            node.prev = previous;
            previous = node;
            list.size++;
        }
        list.first = list.first; list.head = list.first; list.front = list.first; list.last = previous;
        return list;
    }
    public int size() { return size; }
    public void examConvergeWith(OracleLinkedList314<E> other) {
        if (first != null && first.next != null && other.first != null) other.first.next = first.next;
    }
    public E get(int index) {
        Node<E> current = first;
        while (index-- > 0) current = current.next;
        return current.data;
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>();
        Node<E> current = first;
        int guard = 0;
        while (current != null && guard++ < 200) {
            values.add(String.valueOf(current.data));
            current = current.next;
        }
        return size + ":" + values + (current == null ? "" : ":cycle");
    }
}
