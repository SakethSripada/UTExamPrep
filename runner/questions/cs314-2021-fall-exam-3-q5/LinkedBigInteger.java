import java.util.*;
class LinkedBigInteger implements ExamSnapshot {
    private final Node FIRST; private static class Node {int digit;Node next;Node(int d){digit=d;}}
    public LinkedBigInteger(){FIRST=new Node(0);}
// __STUDENT_CODE__
    static LinkedBigInteger fixture(){LinkedBigInteger n=new LinkedBigInteger();n.FIRST.digit=7;n.FIRST.next=new Node(1);n.FIRST.next.next=new Node(5);return n;}
    public Object examCall(int c){add(new String[]{"1","9","83","3741","9999","500"}[c]);return null;}
    public String examSnapshot(){StringBuilder s=new StringBuilder();Node n=FIRST;int g=0;while(n!=null&&g++<100){s.append(n.digit);n=n.next;}return s.toString();}
}