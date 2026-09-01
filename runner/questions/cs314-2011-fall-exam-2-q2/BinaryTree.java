import java.util.*;

class BinaryTree<E extends Comparable<E>> implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private BTNode<E> root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class BTNode<T> {
        private T data; private T value; private T element; private T val;
        private BTNode<T> left; private BTNode<T> right;
        private ArrayList<BTNode<T>> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        BTNode() { }
        BTNode(T value) { data = value; this.value = value; element = value; val = value; }
        T getData() { return data; } T getValue() { return data; }
        BTNode<T> getLeft() { return left; } BTNode<T> getRight() { return right; }
        void setLeft(BTNode<T> node) { left = node; } void setRight(BTNode<T> node) { right = node; }
        ArrayList<BTNode<T>> getChildren() { return children; }
    }

// __STUDENT_CODE__

    private BinaryTree() { }
    static BinaryTree<Integer> fixture() {
        BinaryTree<Integer> tree = new BinaryTree<>();
        BTNode<Integer> n4 = new BTNode<>(4);
        BTNode<Integer> n2 = new BTNode<>(2);
        BTNode<Integer> n7 = new BTNode<>(7);
        BTNode<Integer> n1 = new BTNode<>(1);
        BTNode<Integer> n3 = new BTNode<>(3);
        BTNode<Integer> n6 = new BTNode<>(6);
        BTNode<Integer> n8 = new BTNode<>(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        BinaryTree other = BinaryTree.fixture();
        
        E target = (E) Integer.valueOf(caseIndex % 2 == 0 ? 2 : 9);
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        E[] resultArray = (E[]) new Comparable[1];
        Object result = numNodesWithTwoChildren();
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(BTNode<E> node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}