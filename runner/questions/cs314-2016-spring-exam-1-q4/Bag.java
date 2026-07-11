import java.util.*;
class Bag implements ExamSnapshot {
    private Pair[] container=new Pair[4]; private int sizeOfBag; private int distinctItemsInBag;
    private static class Pair {Object object;int frequency;Pair(Object o,int f){object=o;frequency=f;}Object getObject(){return object;}int getFrequency(){return frequency;}void setFrequency(int f){frequency=f;}public String toString(){return object+"="+frequency;}}
    private Bag(){container[0]=new Pair("C",3);container[1]=new Pair("A",1);container[2]=new Pair("F",2);distinctItemsInBag=3;sizeOfBag=6;}
// __STUDENT_CODE__
    static Bag fixture(){return new Bag();}
    public Object examCall(int c){add(new String[]{"C","D","A","E","F","D"}[c]);return null;}
    public String examSnapshot(){return sizeOfBag+":"+distinctItemsInBag+":"+Arrays.toString(container);}
}