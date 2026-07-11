import java.util.*;

class OracleHuffmanTree implements ExamSnapshot {
    private static class TreeNode {
        private int value = -1; private int data = -1; private char letter = '?';
        private TreeNode left, right, leftChild, rightChild;
        TreeNode() { }
        TreeNode(int value, int ignored) { this.value = value; data = value; letter = (char) value; }
        TreeNode getLeft() { return left; } TreeNode getRight() { return right; }
    }
    private TreeNode root;
    private int numLeaves;
    private OracleHuffmanTree() { root = fixtureRoot(); }
    private static TreeNode fixtureRoot() {
        TreeNode root = new TreeNode();
        root.left = new TreeNode(65, 0); root.right = new TreeNode();
        root.right.left = new TreeNode(66, 0); root.right.right = new TreeNode(256, 0);
        root.leftChild = root.left; root.rightChild = root.right;
        return root;
    }
public OracleHuffmanTree(Map<Integer, String> codes) {
    root = new TreeNode();
    for (int leafValue : codes.keySet()) {
        String code = codes.get(leafValue);
        TreeNode current = root;
        for (int index = 0; index < code.length(); index++) {
            if (code.charAt(index) == '0') {
                if (current.left == null) current.left = new TreeNode();
                current = current.left;
            } else {
                if (current.right == null) current.right = new TreeNode();
                current = current.right;
            }
        }
        current.value = leafValue;
    }
}
    static OracleHuffmanTree fixture() { return new OracleHuffmanTree(); }
    public Object examCall(int caseIndex) { Map<Integer, String> codes = new LinkedHashMap<>(); codes.put(65, "0"); codes.put(66, "10"); codes.put(256, "11");
        return new OracleHuffmanTree(codes).examSnapshot(); }
    private void snapshot(TreeNode node, List<String> values) {
        if (node == null) { values.add("#"); return; }
        values.add(node.value + ":" + node.letter); snapshot(node.left, values); snapshot(node.right, values);
    }
    public String examSnapshot() { ArrayList<String> values = new ArrayList<>(); snapshot(root, values); return numLeaves + ":" + values; }
}