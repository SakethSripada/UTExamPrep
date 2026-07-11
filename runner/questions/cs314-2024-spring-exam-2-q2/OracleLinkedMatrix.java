import java.util.*;
class OracleLinkedMatrix<E> implements ExamSnapshot {
    private RowHeader<E> firstRow;
    private static class RowHeader<T>{RowHeader<T> nextRow;DataNode<T> first;}
    private static class DataNode<T>{T data;DataNode<T> next;DataNode(T d){data=d;}}
private boolean isRectangular() {
    if (firstRow == null) {
        return true;
    }
    int targetColumns = numColumns(firstRow);
    RowHeader<E> temp = firstRow.nextRow;
    while (temp != null) {
        int columns = numColumns(temp);
        if (columns != targetColumns) {
            return false;
        }
        temp = temp.nextRow;
    }
    return true;
}

private int numColumns(RowHeader header) {
    int count = 0;
    DataNode<E> temp = header.first;
    while (temp != null) {
        count++;
        temp = temp.next;
    }
    return count;
}
    static OracleLinkedMatrix<Integer> fixture(){return make(3,3,3);}
    static OracleLinkedMatrix<Integer> make(int... lengths){OracleLinkedMatrix<Integer>m=new OracleLinkedMatrix<>();RowHeader<Integer>prev=null;for(int len:lengths){RowHeader<Integer>r=new RowHeader<>();if(prev==null)m.firstRow=r;else prev.nextRow=r;prev=r;DataNode<Integer>p=null;for(int i=0;i<len;i++){DataNode<Integer>n=new DataNode<>(i);if(p==null)r.first=n;else p.next=n;p=n;}}return m;}
    public Object examCall(int c){OracleLinkedMatrix<Integer>m=switch(c){case 0->make();case 1->make(0);case 2->make(0,0,0);case 3->make(2,2);case 4->make(2,3);default->make(3,3,1);};firstRow=(RowHeader<E>)(Object)m.firstRow;return isRectangular();}
    public String examSnapshot(){ArrayList<Integer> lengths=new ArrayList<>();RowHeader<E>r=firstRow;while(r!=null){int n=0;DataNode<E>d=r.first;while(d!=null){n++;d=d.next;}lengths.add(n);r=r.nextRow;}return lengths.toString();}
}