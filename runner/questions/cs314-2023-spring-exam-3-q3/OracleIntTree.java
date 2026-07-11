import java.util.*;

class OracleIntTree implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private IntNode root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class IntNode {
        private int data; private int value; private int element; private int val;
        private IntNode left; private IntNode right;
        private ArrayList<IntNode> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        IntNode() { }
        IntNode(int value) { data = value; this.value = value; element = value; val = value; }
        int getData() { return value; } int getValue() { return value; }
        IntNode getLeft() { return left; } IntNode getRight() { return right; }
        void setLeft(IntNode node) { left = node; } void setRight(IntNode node) { right = node; }
        ArrayList<IntNode> getChildren() { return children; }
    }

public int inRangeSum(int[] valueRange, int[] depthRange) {
    return helper(root, 0, valueRange, depthRange);
}

private int helper(IntNode n, int currentDepth,
                           int[] valueRange, int[] depthRange) {
    if (n == null || currentDepth > depthRange[1]) {
        return 0;
    }
    // We won't go below the max depth, so only need to worry
    // if current value is in range.
    int result = 0;
    if (currentDepth >= depthRange[0] && valueRange[0] <= n.val
            && n.val <= valueRange[1]) {
        result += n.val;
    }
    result += helper(n.left, currentDepth + 1, valueRange, depthRange)
          + helper(n.right, currentDepth + 1, valueRange, depthRange);
    return result;
}

    private OracleIntTree() { }
    static OracleIntTree fixture() {
        OracleIntTree tree = new OracleIntTree();
        IntNode n4 = new IntNode(4);
        IntNode n2 = new IntNode(2);
        IntNode n7 = new IntNode(7);
        IntNode n1 = new IntNode(1);
        IntNode n3 = new IntNode(3);
        IntNode n6 = new IntNode(6);
        IntNode n8 = new IntNode(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        OracleIntTree other = OracleIntTree.fixture();
        
        int target = caseIndex % 2 == 0 ? 2 : 9;
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        Integer[] resultArray = new Integer[1];
        Object result = inRangeSum(valueRange, depthRange);
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(IntNode node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.value) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}