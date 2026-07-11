import java.util.*;
class OracleMultiSet<E> implements ExamSnapshot {
    private ValueAndFrequency<E>[] con; private int numDistinct; private int size;
    private static class ValueAndFrequency<T> { T element; int frequency; ValueAndFrequency(T e,int f){element=e;frequency=f;} }
    private OracleMultiSet() { con = (ValueAndFrequency<E>[]) new ValueAndFrequency[10]; }
public boolean isSubset(OracleMultiSet<E> other) {
    for (int i = 0; i < other.numDistinct; i++) {
        E element = other.con[i].element;
        int index = find(element);
        if (index == -1 || con[index].frequency < other.con[i].frequency) return false;
    }
    return true;
}

private int find(E target) {
    for (int i = 0; i < numDistinct; i++)
        if (con[i].element.equals(target)) return i;
    return -1;
}
    static OracleMultiSet<Integer> fixture() { OracleMultiSet<Integer> m=new OracleMultiSet<>(); m.con[0]=new ValueAndFrequency<>(1,1); m.con[1]=new ValueAndFrequency<>(2,3); m.con[2]=new ValueAndFrequency<>(3,4); m.numDistinct=3; m.size=8; return m; }
    public Object examCall(int c) { OracleMultiSet<E> o=new OracleMultiSet<>(); o.con[0]=new ValueAndFrequency<>((E)Integer.valueOf(c%2==0?1:3),c%3+1); o.con[1]=new ValueAndFrequency<>((E)Integer.valueOf(c%3==0?9:2),1); o.numDistinct=2; o.size=o.con[0].frequency+1; return isSubset(o); }
    public String examSnapshot(){return size+":"+numDistinct+":"+Arrays.deepToString(Arrays.stream(con).map(x->x==null?null:x.element+"="+x.frequency).toArray());}
}