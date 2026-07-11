import java.util.*;

class Tree<E extends Comparable<E>> implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private TNode<E> root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class TNode<T> {
        private T data; private T value; private T element; private T val;
        private TNode<T> left; private TNode<T> right;
        private ArrayList<TNode<T>> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        TNode() { }
        TNode(T value) { data = value; this.value = value; element = value; val = value; }
        T getData() { return data; } T getValue() { return data; }
        TNode<T> getLeft() { return left; } TNode<T> getRight() { return right; }
        void setLeft(TNode<T> node) { left = node; } void setRight(TNode<T> node) { right = node; }
        ArrayList<TNode<T>> getChildren() { return children; }
    }

// __STUDENT_CODE__

    private Tree() { }
    static Tree<Integer> fixture() {
        Tree<Integer> tree = new Tree<>();
        TNode<Integer> n4 = new TNode<>(4);
        TNode<Integer> n2 = new TNode<>(2);
        TNode<Integer> n7 = new TNode<>(7);
        TNode<Integer> n1 = new TNode<>(1);
        TNode<Integer> n3 = new TNode<>(3);
        TNode<Integer> n6 = new TNode<>(6);
        TNode<Integer> n8 = new TNode<>(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        Tree other = Tree.fixture();
        
        E target = (E) Integer.valueOf(caseIndex % 2 == 0 ? 2 : 9);
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        E[] resultArray = (E[]) new Comparable[1];
        Object result = helper(root, 3);
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(TNode<E> node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}