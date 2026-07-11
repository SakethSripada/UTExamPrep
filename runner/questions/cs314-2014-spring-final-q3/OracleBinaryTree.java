import java.util.*;

class OracleBinaryTree implements ExamSnapshot {
    private static final int RED = 1, BLACK = 0;
    private BinaryNode root;
    private int size;
    private int blackNodesInRootToMinPath = 2;
    private static class BinaryNode {
        private int data; private int value; private int element; private int val;
        private BinaryNode left; private BinaryNode right;
        private ArrayList<BinaryNode> children = new ArrayList<>();
        private boolean red; private boolean isBlack = true; private boolean isBlackNode = true; private boolean isBlackBode = true; private int color;
        BinaryNode() { }
        BinaryNode(int value) { data = value; this.value = value; element = value; val = value; }
        int getData() { return data; } int getValue() { return data; }
        BinaryNode getLeft() { return left; } BinaryNode getRight() { return right; }
        void setLeft(BinaryNode node) { left = node; } void setRight(BinaryNode node) { right = node; }
        ArrayList<BinaryNode> getChildren() { return children; }
    }

public boolean pathFromRootExists(int target) {
    return helper(root, target);
}

private boolean helper(BinaryNode n, int target) {
    if(n == null)
        return false;
    else {
        target -= n.getData();
        if(target == 0)
            return true;
        else
            return helper(n.getLeft(), target)
                  || helper(n.getRight(), target);
    }
 }

    private OracleBinaryTree() { }
    static OracleBinaryTree fixture() {
        OracleBinaryTree tree = new OracleBinaryTree();
        BinaryNode n4 = new BinaryNode(4);
        BinaryNode n2 = new BinaryNode(2);
        BinaryNode n7 = new BinaryNode(7);
        BinaryNode n1 = new BinaryNode(1);
        BinaryNode n3 = new BinaryNode(3);
        BinaryNode n6 = new BinaryNode(6);
        BinaryNode n8 = new BinaryNode(8);
        n4.left = n2; n4.right = n7; n2.left = n1; n2.right = n3; n7.left = n6; n7.right = n8;
        n4.children.add(n2); n4.children.add(n7); n2.children.add(n1); n2.children.add(n3); n7.children.add(n6); n7.children.add(n8);
        n1.children = null; n3.children = null; n6.children = null; n8.children = null;
        n2.red = true; n2.color = RED; n7.red = false; n7.color = BLACK;
        n2.isBlack = false; n2.isBlackNode = false; n2.isBlackBode = false;
        tree.root = n4; tree.size = 7;
        
        
        
        
        
        
        return tree;
    }
    public Object examCall(int caseIndex) {
        OracleBinaryTree other = OracleBinaryTree.fixture();
        
        int target = caseIndex % 2 == 0 ? 6 : 99;
        int[] countArray = {0};
        int[] valueRange = {2, 7};
        int[] depthRange = {1, 3};
        Integer[] resultArray = new Integer[1];
        Object result = pathFromRootExists(target);
        return Arrays.asList(result, Arrays.toString(countArray), Arrays.toString(resultArray), other.examSnapshot());
    }
    private void snapshot(BinaryNode node, List<String> values, int depth) {
        if (node == null || depth > 30) { values.add("#"); return; }
        values.add(String.valueOf(node.data) + (node.red || node.color == RED ? "R" : "B"));
        snapshot(node.left, values, depth + 1); snapshot(node.right, values, depth + 1);
    }
    public String examSnapshot() {
        ArrayList<String> values = new ArrayList<>(); snapshot(root, values, 0); return size + ":" + values;
    }
}