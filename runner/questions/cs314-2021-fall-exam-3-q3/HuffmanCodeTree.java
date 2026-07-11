import java.util.*;

class HuffmanCodeTree implements ExamSnapshot {
    private static class TreeNode {
        private int value = -1; private int data = -1; private char letter = '?';
        private TreeNode left, right, leftChild, rightChild;
        TreeNode() { }
        TreeNode(int value, int ignored) { this.value = value; data = value; letter = (char) value; }
        TreeNode getLeft() { return left; } TreeNode getRight() { return right; }
    }
    private TreeNode root;
    private int numLeaves;
    private HuffmanCodeTree() { root = fixtureRoot(); }
    private static TreeNode fixtureRoot() {
        TreeNode root = new TreeNode();
        root.left = new TreeNode(65, 0); root.right = new TreeNode();
        root.right.left = new TreeNode(66, 0); root.right.right = new TreeNode(256, 0);
        root.leftChild = root.left; root.rightChild = root.right;
        return root;
    }
// __STUDENT_CODE__
    static HuffmanCodeTree fixture() { return new HuffmanCodeTree(); }
    public Object examCall(int caseIndex) { BitInputStream bits = new BitInputStream(0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1);
        return verifyTree(bits); }
    private void snapshot(TreeNode node, List<String> values) {
        if (node == null) { values.add("#"); return; }
        values.add(node.value + ":" + node.letter); snapshot(node.left, values); snapshot(node.right, values);
    }
    public String examSnapshot() { ArrayList<String> values = new ArrayList<>(); snapshot(root, values); return numLeaves + ":" + values; }
}