import java.util.*;

class OracleTree<E extends Comparable<E>> implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private Node<E> root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class Node<T> {
        private T data; private T value; private T element; private T val;
        private Node<T> left; private Node<T> right;
        private ArrayList<Node<T>> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        Node() { }
        Node(T value) { data = value; this.value = value; element = value; val = value; }
        T getData() { return data; } T getValue() { return data; }
        Node<T> getLeft() { return left; } Node<T> getRight() { return right; }
        void setLeft(Node<T> node) { left = node; } void setRight(Node<T> node) { right = node; }
        ArrayList<Node<T>> getChildren() { return children; }
    }

private int helper(E tgt, Node<E> n) {
    int result = 0;
    // n won't be null due to initial precon and our logic below
    if (n.children != null) {
        // current node isn't a leaf
        for (int i = n.children.size() - 1; i >= 0; i--) {
            Node<E> child = n.children.get(i);
            if (child.children == null) {
                // leaf node
                if (child.data.equals(tgt)) {
                     // child is a leaf to be removed, swap last
                     result++;
                     size--;
                     Node<E> last =
                       n.children.remove(n.children.size() - 1);
                     if (i != n.children.size())
                         n.children.set(i, last); // otherwise last
                }
            } else {
                result += helper(tgt, child);
            }
        }
        // Am I a leaf now?
        if (n.children.size() == 0) {
            n.children = null;
        }
    } // else current node is a leaf, but not to be removed
    return result;
}

    private OracleTree() { }
    static OracleTree<Integer> fixture() {
        OracleTree<Integer> tree = new OracleTree<>();
        Node<Integer> n4 = new Node<>(4);
        Node<Integer> n2 = new Node<>(2);
        Node<Integer> n7 = new Node<>(7);
        Node<Integer> n1 = new Node<>(1);
        Node<Integer> n3 = new Node<>(3);
        Node<Integer> n6 = new Node<>(6);
        Node<Integer> n8 = new Node<>(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        OracleTree other = OracleTree.fixture();
        
        E target = (E) Integer.valueOf(caseIndex % 2 == 0 ? 2 : 9);
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        E[] resultArray = (E[]) new Comparable[1];
        Object result = helper(target, root);
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(Node<E> node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}