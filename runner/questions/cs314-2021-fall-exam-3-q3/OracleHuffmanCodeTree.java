import java.util.*;

class OracleHuffmanCodeTree implements ExamSnapshot {
    private static class TreeNode {
        private int value = -1; private int data = -1; private char letter = '?';
        private TreeNode left, right, leftChild, rightChild;
        TreeNode() { }
        TreeNode(int value, int ignored) { this.value = value; data = value; letter = (char) value; }
        TreeNode getLeft() { return left; } TreeNode getRight() { return right; }
    }
    private TreeNode root;
    private int numLeaves;
    private OracleHuffmanCodeTree() { root = fixtureRoot(); }
    private static TreeNode fixtureRoot() {
        TreeNode root = new TreeNode();
        root.left = new TreeNode(65, 0); root.right = new TreeNode();
        root.right.left = new TreeNode(66, 0); root.right.right = new TreeNode(256, 0);
        root.leftChild = root.left; root.rightChild = root.right;
        return root;
    }
private boolean verifyTree(BitInputStream bis) {
    int numCodes = bis.readBits(8);
    for (int code = 0; code < numCodes; code++) {
        int value = bis.readBits(9);
        int length = bis.readBits(8);
        int bitNum = 0;
        TreeNode n = root;
        while (n != null && bitNum < length) {
            int bit = bis.readBits(1);
            n = (bit == 0) ? n.left : n.right;
            bitNum++;
        }
        if (n == null) {
            return false; // fell off of tree
        }
        if (n.value != value) {
            return false; // wrong value in leaf
        }
        if (n.left != null || n.right != null) {
        // OR (!(n.left == null && n.right == null)
            return false; // not a leaf node
        }
    }
    return true; // no problems
}
    static OracleHuffmanCodeTree fixture() { return new OracleHuffmanCodeTree(); }
    public Object examCall(int caseIndex) { BitInputStream bits = new BitInputStream(0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1);
        return verifyTree(bits); }
    private void snapshot(TreeNode node, List<String> values) {
        if (node == null) { values.add("#"); return; }
        values.add(node.value + ":" + node.letter); snapshot(node.left, values); snapshot(node.right, values);
    }
    public String examSnapshot() { ArrayList<String> values = new ArrayList<>(); snapshot(root, values); return numLeaves + ":" + values; }
}