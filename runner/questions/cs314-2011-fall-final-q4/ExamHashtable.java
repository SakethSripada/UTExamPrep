import java.util.*;
class ExamHashtable<E> implements ExamSnapshot, Iterable<E> {
    private int size; private static final Object EMPTY=new Object(); private E[] con;
// __STUDENT_CODE__
    public Iterator<E> iterator(){return new HashIterator();}
    private ExamHashtable(){con=(E[])new Object[12];Object[]v={1,null,2,EMPTY,3,null,4};for(int i=0;i<v.length;i++){con[i]=(E)v[i];if(v[i]!=null&&v[i]!=EMPTY)size++;}}
    static ExamHashtable<Integer> fixture(){return new ExamHashtable<>();}
    public Object examCall(int c){Iterator<E>it=iterator();ArrayList<E>seen=new ArrayList<>();if(c==0){try{it.remove();}catch(IllegalStateException e){return "illegal";}}while(it.hasNext()){E value=it.next();seen.add(value);if((c%3)==seen.size()%3)it.remove();}return seen;}
    public String examSnapshot(){ArrayList<String>v=new ArrayList<>();for(E x:con)v.add(x==EMPTY?"EMPTY":String.valueOf(x));return size+":"+v;}
}