import java.util.*;

class OracleMorseCodeTree implements ExamSnapshot {
    private static class MNode {
        private int value = -1; private int data = -1; private char letter = '?';
        private MNode left, right, leftChild, rightChild;
        MNode() { }
        MNode(int value, int ignored) { this.value = value; data = value; letter = (char) value; }
        MNode getLeft() { return left; } MNode getRight() { return right; }
    }
    private MNode root;
    private int numLeaves;
    private OracleMorseCodeTree() { root = fixtureRoot(); }
    private static MNode fixtureRoot() {
        MNode root = new MNode();
        root.left = new MNode(65, 0); root.right = new MNode();
        root.right.left = new MNode(66, 0); root.right.right = new MNode(256, 0);
        root.leftChild = root.left; root.rightChild = root.right;
        return root;
    }
public String decode(String encoded) {
    if (encoded.charAt(0) == '*' || encoded.charAt(encoded.length() - 1) != '*') return null;
    String result = "";
    MNode current = root;
    for (int index = 0; index < encoded.length(); index++) {
        char symbol = encoded.charAt(index);
        if (symbol == '*') {
            result += current.letter;
            current = root;
        } else if (symbol == '.') current = current.left;
        else if (symbol == '-') current = current.right;
        else return null;
        if (current == null) return null;
    }
    return result;
}
    static OracleMorseCodeTree fixture() { return new OracleMorseCodeTree(); }
    public Object examCall(int caseIndex) { BitInputStream bits = new BitInputStream(0,0,0,0,0,0,1,0, 0,1,0,0,0,0,0,1, 0,0,0,0,0,0,0,1, 0);
        return decode(".*-*"); }
    private void snapshot(MNode node, List<String> values) {
        if (node == null) { values.add("#"); return; }
        values.add(node.value + ":" + node.letter); snapshot(node.left, values); snapshot(node.right, values);
    }
    public String examSnapshot() { ArrayList<String> values = new ArrayList<>(); snapshot(root, values); return numLeaves + ":" + values; }
}