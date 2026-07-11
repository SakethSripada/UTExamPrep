import java.util.*;
class MultiSet<E> implements ExamSnapshot {
    private ValueAndFrequency<E>[] con; private int numDistinct; private int size;
    private static class ValueAndFrequency<T> { T element; int frequency; ValueAndFrequency(T e,int f){element=e;frequency=f;} }
    private MultiSet() { con = (ValueAndFrequency<E>[]) new ValueAndFrequency[10]; }
// __STUDENT_CODE__
    static MultiSet<Integer> fixture() { MultiSet<Integer> m=new MultiSet<>(); m.con[0]=new ValueAndFrequency<>(1,1); m.con[1]=new ValueAndFrequency<>(2,3); m.con[2]=new ValueAndFrequency<>(3,4); m.numDistinct=3; m.size=8; return m; }
    public Object examCall(int c) { MultiSet<E> o=new MultiSet<>(); o.con[0]=new ValueAndFrequency<>((E)Integer.valueOf(c%2==0?1:3),c%3+1); o.con[1]=new ValueAndFrequency<>((E)Integer.valueOf(c%3==0?9:2),1); o.numDistinct=2; o.size=o.con[0].frequency+1; return isSubset(o); }
    public String examSnapshot(){return size+":"+numDistinct+":"+Arrays.deepToString(Arrays.stream(con).map(x->x==null?null:x.element+"="+x.frequency).toArray());}
}