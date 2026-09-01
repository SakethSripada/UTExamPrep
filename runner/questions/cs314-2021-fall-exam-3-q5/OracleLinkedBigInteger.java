import java.util.*;
class OracleLinkedBigInteger implements ExamSnapshot {
    private final Node FIRST; private static class Node {int digit;Node next;Node(int d){digit=d;}}
    public OracleLinkedBigInteger(){FIRST=new Node(0);}
public void add(String value) {
    Node lead = FIRST;
    Node trailer = lead;
    int carry = 0;
    for (int i = value.length() - 1; i >= 0; i--) {
        int digit = value.charAt(i) - '0';
        carry = addVal(lead, carry + digit);
        if (lead.next == null) lead.next = new Node(0);
        trailer = lead;
        lead = lead.next;
    }
    while (carry == 1) {
        carry = addVal(lead, carry);
        if (lead.next == null) lead.next = new Node(0);
        trailer = lead;
        lead = lead.next;
    }
    if (carry == 0) trailer.next = null;
}

private int addVal(Node node, int value) {
    node.digit += value;
    int carry = node.digit / 10;
    node.digit %= 10;
    return carry;
}
    static OracleLinkedBigInteger fixture(){OracleLinkedBigInteger n=new OracleLinkedBigInteger();n.FIRST.digit=7;n.FIRST.next=new Node(1);n.FIRST.next.next=new Node(5);return n;}
    public Object examCall(int c){add(new String[]{"1","9","83","3741","9999","500"}[c]);return null;}
    public String examSnapshot(){StringBuilder s=new StringBuilder();Node n=FIRST;int g=0;while(n!=null&&g++<100){s.append(n.digit);n=n.next;}return s.toString();}
}