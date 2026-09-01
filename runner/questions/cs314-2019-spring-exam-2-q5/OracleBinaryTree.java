import java.util.*;

class OracleBinaryTree implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private BNode root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class BNode {
        private int data; private int value; private int element; private int val;
        private BNode left; private BNode right;
        private ArrayList<BNode> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        BNode() { }
        BNode(int value) { data = value; this.value = value; element = value; val = value; }
        int getData() { return data; } int getValue() { return data; }
        BNode getLeft() { return left; } BNode getRight() { return right; }
        void setLeft(BNode node) { left = node; } void setRight(BNode node) { right = node; }
        ArrayList<BNode> getChildren() { return children; }
    }

public int makeFull() {
    if (root == null) {
        return 0;
    } else {
        return help(root);
    }
}

private int help(BNode n) {
    // With check in public method, we should
    // never reach a case where n == null.
    // are we a leaf node?
    if (n.left == null && n.right == null) {
        return 0;
    } else if (n.left == null) {
        // not a leaf node, at least one child
        // no child to left, must add it
        n.left = new BNode(n.data);
        // but we know we have a right child
        return 1 + help(n.right);
    } else if (n.right == null) {
        // no child to right, must add it
        n.right = new BNode(n.data);
        // but we know we have a left child
        return 1 + help(n.left);
    } else {
        // 2 children, don't add any nodes here
        // but what do my children do?
        return help(n.left) + help(n.right);
    }
}

    private OracleBinaryTree() { }
    static OracleBinaryTree fixture() {
        OracleBinaryTree tree = new OracleBinaryTree();
        BNode n4 = new BNode(4);
        BNode n2 = new BNode(2);
        BNode n7 = new BNode(7);
        BNode n1 = new BNode(1);
        BNode n3 = new BNode(3);
        BNode n6 = new BNode(6);
        BNode n8 = new BNode(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        n2.right = null; n7.left = null; tree.size = 5;
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        OracleBinaryTree other = OracleBinaryTree.fixture();
        
        int target = caseIndex % 2 == 0 ? 2 : 9;
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        Integer[] resultArray = new Integer[1];
        Object result = makeFull();
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(BNode node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}