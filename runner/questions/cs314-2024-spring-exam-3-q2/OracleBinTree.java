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

public int count(E target, int minDepth) {
    return count(root, target, 0, minDepth);
}

private int count(BNode<E> node, E target, int depth, int minDepth) {
    if (node == null) return 0;
    int result = depth >= minDepth && node.left != null && node.right != null
        && node.data.equals(target) ? 1 : 0;
    return result + count(node.left, target, depth + 1, minDepth)
        + count(node.right, target, depth + 1, minDepth);
}

    private OracleBinTree() { }

    private static BNode<Integer> node(int value) {
        return new BNode<>(value);
    }

    static OracleBinTree<Integer> fixture() {
        return fixtureForCase(0);
    }

    private static OracleBinTree<Integer> fixtureForCase(int caseIndex) {
        OracleBinTree<Integer> tree = new OracleBinTree<>();
        if (caseIndex == 0) { // Empty tree.
            return tree;
        }

        BNode<Integer> root = node(4);
        BNode<Integer> left = node(caseIndex == 4 ? 2 : 4);
        BNode<Integer> right = node(3);
        root.left = left;
        root.right = right;
        root.children.add(left);
        root.children.add(right);

        if (caseIndex == 1) { // Matching root with exactly two children.
            tree.root = root;
            tree.size = 3;
            return tree;
        }

        BNode<Integer> leftLeft = node(1);
        BNode<Integer> leftRight = node(caseIndex == 5 ? 8 : 2);
        left.left = leftLeft;
        left.right = leftRight;
        left.children.add(leftLeft);
        left.children.add(leftRight);
        tree.root = root;
        tree.size = 5;
        return tree;
    }

    public Object examCall(int caseIndex) {
        OracleBinTree<Integer> tree = fixtureForCase(caseIndex);
        int[] targets = {1, 4, 4, 4, 2, 99};
        int[] minimumDepths = {0, 0, 1, 2, 1, 0};
        String before = tree.examSnapshot();
        Object result = tree.count(targets[caseIndex], minimumDepths[caseIndex]);
        return Arrays.asList(result, before, tree.examSnapshot());
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
