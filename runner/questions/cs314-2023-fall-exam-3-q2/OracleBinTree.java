import java.util.*;

class OracleBinTree<E extends Comparable<E>> implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private BNode<E> root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class BNode<T> {
        private T data; private T value; private T element; private T val;
        private BNode<T> left; private BNode<T> right;
        private ArrayList<BNode<T>> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        BNode() { }
        BNode(T value) { data = value; this.value = value; element = value; val = value; }
        T getData() { return data; } T getValue() { return data; }
        BNode<T> getLeft() { return left; } BNode<T> getRight() { return right; }
        void setLeft(BNode<T> node) { left = node; } void setRight(BNode<T> node) { right = node; }
        ArrayList<BNode<T>> getChildren() { return children; }
    }

public int deepestDepth(E target) {
    return deepestDepth(root, 0, target);
}

private int deepestDepth(BNode<E> node, int depth, E target) {
    if (node == null) return -1;
    int here = target.equals(node.data) ? depth : -1;
    return Math.max(here, Math.max(
        deepestDepth(node.left, depth + 1, target),
        deepestDepth(node.right, depth + 1, target)));
}

    private OracleBinTree() { }
    static OracleBinTree<Integer> fixture() {
        OracleBinTree<Integer> tree = new OracleBinTree<>();
        BNode<Integer> n4 = new BNode<>(4);
        BNode<Integer> n2 = new BNode<>(2);
        BNode<Integer> n7 = new BNode<>(7);
        BNode<Integer> n1 = new BNode<>(1);
        BNode<Integer> n3 = new BNode<>(3);
        BNode<Integer> n6 = new BNode<>(6);
        BNode<Integer> n8 = new BNode<>(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        OracleBinTree other = OracleBinTree.fixture();
        
        E target = (E) Integer.valueOf(caseIndex % 2 == 0 ? 2 : 9);
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        E[] resultArray = (E[]) new Comparable[1];
        Object result = deepestDepth(target);
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(BNode<E> node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}