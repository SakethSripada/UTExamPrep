import java.util.*;

class IntBST {
    private IntNode root;

    private static class IntNode {
        private int val;
        private IntNode left;
        private IntNode right;
        private IntNode(int val) { this.val = val; }
    }

// __STUDENT_CODE__

    void add(int val) {
        root = add(root, val);
    }

    private IntNode add(IntNode node, int val) {
        if (node == null) return new IntNode(val);
        if (val <= node.val) node.left = add(node.left, val);
        else node.right = add(node.right, val);
        return node;
    }

    static IntBST sample() {
        IntBST tree = new IntBST();
        for (int val : new int[]{5, 3, 12, 0, 9, 15, 7}) {
            tree.add(val);
        }
        return tree;
    }
}
