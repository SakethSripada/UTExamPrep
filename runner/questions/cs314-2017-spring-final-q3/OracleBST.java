import java.util.*;

class OracleBST<E extends Comparable<E>> implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private RBNode<E> root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class RBNode<T> {
        private T data; private T value; private T element; private T val;
        private RBNode<T> left; private RBNode<T> right;
        private ArrayList<RBNode<T>> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        RBNode() { }
        RBNode(T value) { data = value; this.value = value; element = value; val = value; }
        T getData() { return data; } T getValue() { return data; }
        RBNode<T> getLeft() { return left; } RBNode<T> getRight() { return right; }
        void setLeft(RBNode<T> node) { left = node; } void setRight(RBNode<T> node) { right = node; }
        ArrayList<RBNode<T>> getChildren() { return children; }
    }

private boolean redRuleMet() {
        return redHelp(root);
}

private boolean redHelp(RBNode<E> n) {
     // base case if n stores null, empty tree, no problem
     if (n == null) {
           return true;
     } else {
           if (!n.isBlack) {
                // This is a red node. If children exist, they must be black.
                if (n.left != null && !n.left.isBlack) {
                      return false; // left child is red
                }
                if (n.right != null && !n.right.isBlack) {
                      return false; // right child is red
                }
           }
           // If we get here either this is a black node or a red node with
           // black children. Check subtrees.
           return redHelp(n.left) && redHelp(n.right);
     }}

    private OracleBST() { }
    static OracleBST<Integer> fixture() {
        OracleBST<Integer> tree = new OracleBST<>();
        RBNode<Integer> n4 = new RBNode<>(4);
        RBNode<Integer> n2 = new RBNode<>(2);
        RBNode<Integer> n7 = new RBNode<>(7);
        RBNode<Integer> n1 = new RBNode<>(1);
        RBNode<Integer> n3 = new RBNode<>(3);
        RBNode<Integer> n6 = new RBNode<>(6);
        RBNode<Integer> n8 = new RBNode<>(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        OracleBST other = OracleBST.fixture();
        
        E target = (E) Integer.valueOf(caseIndex % 2 == 0 ? 2 : 9);
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        E[] resultArray = (E[]) new Comparable[1];
        Object result = redRuleMet();
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(RBNode<E> node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}