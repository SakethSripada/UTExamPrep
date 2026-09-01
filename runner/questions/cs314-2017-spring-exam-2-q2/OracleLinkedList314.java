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

public int getNumDifferences(OracleLinkedList314<E> other) {
    Node<E> left = first;
    Node<E> right = other.first;
    int result = 0;
    while (left != null && right != null) {
        if (left.data == null || right.data == null) {
            if (left.data != right.data) result++;
        } else if (!left.data.equals(right.data)) result++;
        left = left.next;
        right = right.next;
    }
    Node<E> remainder = left != null ? left : right;
    while (remainder != null) {
        result++;
        remainder = remainder.next;
    }
    return result;
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
