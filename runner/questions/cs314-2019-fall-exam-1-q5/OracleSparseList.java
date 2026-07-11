import java.util.*;
class OracleSparseList<E> implements ExamSnapshot {
    private ListElem<E>[] values; private ListElem<E>[] con; private int elementsStored; private int sizeOfList; private E defaultValue;
    private static class ListElem<T>{int position;T data;ListElem(int p,T d){position=p;data=d;}T getData(){return data;}int getPosition(){return position;}void setPosition(int p){position=p;}void setPositon(int p){position=p;}public String toString(){return position+"="+data;}}
    private OracleSparseList(){values=(ListElem<E>[])new ListElem[12];con=values;defaultValue=(E)Integer.valueOf(0);int[]p={1,10,12,15};int[]d={2,11,2,3};for(int i=0;i<p.length;i++)values[elementsStored++]=new ListElem<>(p[i],(E)Integer.valueOf(d[i]));sizeOfList=17;}
public void removeFirstN(int n) {
      // Find the first non-default element
      // with a position >= n.
      int index = 0;
      while (index < elementsStored && values[index].getPosition() < n) {
                  index++;
      }
      // Shift elements that remain to front and
      // update position in list.
      for (int i = index; i < elementsStored; i++) {
          ListElem<E> cur = values[i];
          int oldPos = cur.getPosition();
          cur.setPosition(oldPos - n);
          values[i - index] = cur;
      }
      int oldElementsStored = elementsStored;
      elementsStored -= index;
      // null out unused references
      for (int i = elementsStored; i < oldElementsStored; i++) {
          values[i] = null;
      }
      sizeOfList -= n;
}
    static OracleSparseList<Integer> fixture(){return new OracleSparseList<>();}
    public Object examCall(int c){removeFirstN(new int[]{0,1,5,10,12,16}[c%6]); return null;}
    public String examSnapshot(){return sizeOfList+":"+elementsStored+":"+Arrays.toString(values);}
}