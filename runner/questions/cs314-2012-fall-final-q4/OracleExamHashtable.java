import java.util.*;
class OracleExamHashtable<E> implements ExamSnapshot, Iterable<E> {
    private int size; private static final Object EMPTY=new Object(); private E[] con;
private class HashIterator implements Iterator<E> {
    private boolean removeOK;
    private int index;
    private int numReturned;
    private final int maxReturn;

    private HashIterator() {
        maxReturn = size;
        index = -1;
    }

    public boolean hasNext() { return numReturned < maxReturn; }

    public E next() {
        if (!hasNext()) throw new NoSuchElementException();
        index++;
        while (con[index] == null || con[index] == EMPTY) index++;
        removeOK = true;
        numReturned++;
        return con[index];
    }

    public void remove() {
        if (!removeOK) throw new IllegalStateException();
        removeOK = false;
        size--;
        con[index] = (E) EMPTY;
    }
}
    public Iterator<E> iterator(){return new HashIterator();}
    private OracleExamHashtable(){con=(E[])new Object[12];Object[]v={1,null,2,EMPTY,3,null,4};for(int i=0;i<v.length;i++){con[i]=(E)v[i];if(v[i]!=null&&v[i]!=EMPTY)size++;}}
    static OracleExamHashtable<Integer> fixture(){return new OracleExamHashtable<>();}
    public Object examCall(int c){Iterator<E>it=iterator();ArrayList<E>seen=new ArrayList<>();if(c==0){try{it.remove();}catch(IllegalStateException e){return "illegal";}}while(it.hasNext()){E value=it.next();seen.add(value);if((c%3)==seen.size()%3)it.remove();}return seen;}
    public String examSnapshot(){ArrayList<String>v=new ArrayList<>();for(E x:con)v.add(x==EMPTY?"EMPTY":String.valueOf(x));return size+":"+v;}
}