import java.util.*;

class OracleBinarySearchTree<E extends Comparable<E>> implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private BSTNode<E> root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class BSTNode<T> {
        private T data; private T value; private T element; private T val;
        private BSTNode<T> left; private BSTNode<T> right;
        private ArrayList<BSTNode<T>> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        BSTNode() { }
        BSTNode(T value) { data = value; this.value = value; element = value; val = value; }
        T getData() { return data; } T getValue() { return data; }
        BSTNode<T> getLeft() { return left; } BSTNode<T> getRight() { return right; }
        void setLeft(BSTNode<T> node) { left = node; } void setRight(BSTNode<T> node) { right = node; }
        ArrayList<BSTNode<T>> getChildren() { return children; }
    }

private void medianHelper(BSTNode<E> node, int[] count, E[] result) {
    if (node != null) {
        medianHelper(node.getLeft(), count, result);
        count[0]++;
        if (size % 2 == 1 && count[0] == size / 2 + 1)
            result[0] = node.getData();
        else if (size % 2 == 0 && count[0] == size / 2) {
            result[0] = node.getData();
            medianHelper(node.getRight(), count, result);
        } else if (size % 2 == 0 && count[0] == size / 2 + 1)
            result[1] = node.getData();
        else if (count[0] < size / 2)
            medianHelper(node.getRight(), count, result);
    }
}

    private OracleBinarySearchTree() { }
    static OracleBinarySearchTree<Integer> fixture() {
        OracleBinarySearchTree<Integer> tree = new OracleBinarySearchTree<>();
        BSTNode<Integer> n4 = new BSTNode<>(4);
        BSTNode<Integer> n2 = new BSTNode<>(2);
        BSTNode<Integer> n7 = new BSTNode<>(7);
        BSTNode<Integer> n1 = new BSTNode<>(1);
        BSTNode<Integer> n3 = new BSTNode<>(3);
        BSTNode<Integer> n6 = new BSTNode<>(6);
        BSTNode<Integer> n8 = new BSTNode<>(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        OracleBinarySearchTree other = OracleBinarySearchTree.fixture();
        
        E target = (E) Integer.valueOf(caseIndex % 2 == 0 ? 2 : 9);
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        E[] resultArray = (E[]) new Comparable[1];
        Object result = null; medianHelper(root, countArray, resultArray);
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(BSTNode<E> node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}