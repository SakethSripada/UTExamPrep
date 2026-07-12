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
        MNode e = new MNode('E', 0); MNode t = new MNode('T', 0);
        MNode i = new MNode('I', 0); MNode a = new MNode('A', 0);
        MNode s = new MNode('S', 0); MNode u = new MNode('U', 0); MNode h = new MNode('H', 0);
        MNode n = new MNode('N', 0); MNode m = new MNode('M', 0);
        MNode d = new MNode('D', 0); MNode k = new MNode('K', 0); MNode c = new MNode('C', 0);
        root.left = e; root.right = t;
        e.left = i; e.right = a; i.left = s; i.right = u; s.left = h;
        t.left = n; t.right = m; n.left = d; n.right = k; k.left = c;
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
    public Object examCall(int caseIndex) {
        String[] encodings = {
            ".*", "-.*..*-..*....*..*", "..-*-*-.-.*...*", "*.*", ".-", "..*+-*", "....-*"
        };
        String before = examSnapshot();
        Object result = decode(encodings[caseIndex]);
        return Arrays.asList(result, before, examSnapshot());
    }
    private void snapshot(MNode node, List<String> values) {
        if (node == null) { values.add("#"); return; }
        values.add(node.value + ":" + node.letter); snapshot(node.left, values); snapshot(node.right, values);
    }
    public String examSnapshot() { ArrayList<String> values = new ArrayList<>(); snapshot(root, values); return numLeaves + ":" + values; }
}
