import java.util.*;

class OracleHuffmanTree implements ExamSnapshot {
    private static class HuffNode {
        private int value = -1; private int data = -1; private char letter = '?';
        private HuffNode left, right, leftChild, rightChild;
        HuffNode() { }
        HuffNode(int value, int ignored) { this.value = value; data = value; letter = (char) value; }
        HuffNode getLeft() { return left; } HuffNode getRight() { return right; }
    }
    private HuffNode root;
    private int numLeaves;
    private OracleHuffmanTree() { root = fixtureRoot(); }
    private static HuffNode fixtureRoot() {
        HuffNode root = new HuffNode();
        root.left = new HuffNode(65, 0); root.right = new HuffNode();
        root.right.left = new HuffNode(66, 0); root.right.right = new HuffNode(256, 0);
        root.leftChild = root.left; root.rightChild = root.right;
        return root;
    }
private boolean completeHelper(HuffNode node) {
    if (node == null) return true;
    if (node.left == null && node.right == null) return true;
    if (node.left != null && node.right != null)
        return completeHelper(node.left) && completeHelper(node.right);
    return false;
}
    static OracleHuffmanTree fixture() { return new OracleHuffmanTree(); }
    public Object examCall(int caseIndex) { BitInputStream bits = new BitInputStream(0,0,0,0,0,0,1,0, 0,1,0,0,0,0,0,1, 0,0,0,0,0,0,0,1, 0);
        return completeHelper(root); }
    private void snapshot(HuffNode node, List<String> values) {
        if (node == null) { values.add("#"); return; }
        values.add(node.value + ":" + node.letter); snapshot(node.left, values); snapshot(node.right, values);
    }
    public String examSnapshot() { ArrayList<String> values = new ArrayList<>(); snapshot(root, values); return numLeaves + ":" + values; }
}