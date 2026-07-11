import java.util.*;
class OracleFuzzySet<E> implements ExamSnapshot {
    static class SetPair<T>{T elem;double degree;SetPair(T e,double d){elem=e;degree=d;}T getElem(){return elem;}double getDegree(){return degree;}public String toString(){return elem+"="+degree;}}
    private ArrayList<SetPair<E>> pairs=new ArrayList<>();
    public OracleFuzzySet(){}
    boolean add(SetPair<E> p){for(SetPair<E>x:pairs)if(x.elem.equals(p.elem)){boolean c=x.degree!=p.degree;x.degree=p.degree;return c;}pairs.add(p);return true;}
    Iterator<SetPair<E>> iterator(){return pairs.iterator();}
public OracleFuzzySet<E> getFuzzyIntersection(OracleFuzzySet<E> other) {
    OracleFuzzySet<E> result = new OracleFuzzySet<>();
    Iterator<SetPair<E>> first = iterator();
    while (first.hasNext()) {
        SetPair<E> left = first.next();
        Iterator<SetPair<E>> second = other.iterator();
        boolean found = false;
        while (!found && second.hasNext()) {
            SetPair<E> right = second.next();
            if (left.getElem().equals(right.getElem())) {
                result.add(new SetPair<>(left.getElem(), left.getDegree() * right.getDegree()));
                found = true;
            }
        }
    }
    return result;
}
    static OracleFuzzySet<Integer> fixture(){OracleFuzzySet<Integer>s=new OracleFuzzySet<>();s.add(new SetPair<>(1,1));s.add(new SetPair<>(3,.1));s.add(new SetPair<>(4,.5));s.add(new SetPair<>(7,.7));return s;}
    public Object examCall(int c){OracleFuzzySet<E>o=new OracleFuzzySet<>();o.add(new SetPair<>((E)Integer.valueOf(1),.5));o.add(new SetPair<>((E)Integer.valueOf(3),.7));o.add(new SetPair<>((E)Integer.valueOf(c%2==0?7:9),.02));return getFuzzyIntersection(o).examSnapshot();}
    public String examSnapshot(){return pairs.toString();}
}