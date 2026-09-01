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
public OracleHuffmanCodeTree(String[][] codes) {
    root = new TreeNode(-1, -1);
    numLeaves = codes.length;
    for (String[] row : codes) {
        int value = Integer.parseInt(row[0]);
        TreeNode current = root;
        for (int index = 0; index < row[1].length(); index++) {
            if (row[1].charAt(index) == '0') {
                if (current.left == null) current.left = new TreeNode(-1, -1);
                current = current.left;
            } else {
                if (current.right == null) current.right = new TreeNode(-1, -1);
                current = current.right;
            }
        }
        current.value = value;
    }
}
    static OracleHuffmanCodeTree fixture() { return new OracleHuffmanCodeTree(); }
    public Object examCall(int caseIndex) { String[][] codes = {{"65", "0"}, {"66", "10"}, {"256", "11"}};
        return new OracleHuffmanCodeTree(codes).examSnapshot(); }
    private void snapshot(TreeNode node, List<String> values) {
        if (node == null) { values.add("#"); return; }
        values.add(node.value + ":" + node.letter); snapshot(node.left, values); snapshot(node.right, values);
    }
    public String examSnapshot() { ArrayList<String> values = new ArrayList<>(); snapshot(root, values); return numLeaves + ":" + values; }
}