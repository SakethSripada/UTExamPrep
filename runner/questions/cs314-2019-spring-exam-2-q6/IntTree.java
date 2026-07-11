import java.util.*;

class IntTree implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private TNode root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class TNode {
        private int data; private int value; private int element; private int val;
        private TNode left; private TNode right;
        private ArrayList<TNode> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        TNode() { }
        TNode(int value) { data = value; this.value = value; element = value; val = value; }
        int getData() { return data; } int getValue() { return data; }
        TNode getLeft() { return left; } TNode getRight() { return right; }
        void setLeft(TNode node) { left = node; } void setRight(TNode node) { right = node; }
        ArrayList<TNode> getChildren() { return children; }
    }

// __STUDENT_CODE__

    private IntTree() { }
    static IntTree fixture() {
        IntTree tree = new IntTree();
        TNode n4 = new TNode(4);
        TNode n2 = new TNode(2);
        TNode n7 = new TNode(7);
        TNode n1 = new TNode(1);
        TNode n3 = new TNode(3);
        TNode n6 = new TNode(6);
        TNode n8 = new TNode(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        IntTree other = IntTree.fixture();
        
        int target = caseIndex % 2 == 0 ? 2 : 9;
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        Integer[] resultArray = new Integer[1];
        Object result = help(3, 3, root, 3);
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(TNode node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}