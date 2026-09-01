import java.util.*;

class LL314<E> {
    private Node<E> first;

    private static class Node<E> {
        private E data;
        private Node<E> next;
        public Node(E val) { data = val; }
    }

// __STUDENT_CODE__

    @SafeVarargs
    static <T> LL314<T> of(T... vals) {
        LL314<T> list = new LL314<>();
        Node<T> last = null;
        for (T val : vals) {
            Node<T> node = new Node<>(val);
            if (list.first == null) {
                list.first = node;
            } else {
                last.next = node;
            }
            last = node;
        }
        return list;
    }

    public String toString() {
        ArrayList<String> vals = new ArrayList<>();
        Node<E> temp = first;
        while (temp != null) {
            vals.add(String.valueOf(temp.data));
            temp = temp.next;
        }
        return vals.toString();
    }
}
