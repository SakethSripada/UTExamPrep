import java.util.*;
class FuzzySet<E> implements ExamSnapshot {
    static class SetPair<T>{T elem;double degree;SetPair(T e,double d){elem=e;degree=d;}T getElem(){return elem;}double getDegree(){return degree;}public String toString(){return elem+"="+degree;}}
    private ArrayList<SetPair<E>> pairs=new ArrayList<>();
    public FuzzySet(){}
    boolean add(SetPair<E> p){for(SetPair<E>x:pairs)if(x.elem.equals(p.elem)){boolean c=x.degree!=p.degree;x.degree=p.degree;return c;}pairs.add(p);return true;}
    Iterator<SetPair<E>> iterator(){return pairs.iterator();}
// __STUDENT_CODE__
    static FuzzySet<Integer> fixture(){FuzzySet<Integer>s=new FuzzySet<>();s.add(new SetPair<>(1,1));s.add(new SetPair<>(3,.1));s.add(new SetPair<>(4,.5));s.add(new SetPair<>(7,.7));return s;}
    public Object examCall(int c){FuzzySet<E>o=new FuzzySet<>();o.add(new SetPair<>((E)Integer.valueOf(1),.5));o.add(new SetPair<>((E)Integer.valueOf(3),.7));o.add(new SetPair<>((E)Integer.valueOf(c%2==0?7:9),.02));return getFuzzyIntersection(o).examSnapshot();}
    public String examSnapshot(){return pairs.toString();}
}