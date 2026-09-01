import java.util.*;
class OracleBag implements ExamSnapshot {
    private Pair[] container=new Pair[4]; private int sizeOfBag; private int distinctItemsInBag;
    private static class Pair {Object object;int frequency;Pair(Object o,int f){object=o;frequency=f;}Object getObject(){return object;}int getFrequency(){return frequency;}void setFrequency(int f){frequency=f;}public String toString(){return object+"="+frequency;}}
    private OracleBag(){container[0]=new Pair("C",3);container[1]=new Pair("A",1);container[2]=new Pair("F",2);distinctItemsInBag=3;sizeOfBag=6;}
public void add(Object value) {
      sizeOfBag++;
      boolean found = false;
      int index = 0;
      while (!found && index < distinctItemsInBag) {
           Pair currentPair = container[index];
           if (value.equals(currentPair.getObject())) {
                 // found match
                 int newFreq = 1 + currentPair.getFrequency();
                 currentPair.setFrequency(newFreq);
                 found = true;
           }
           index++;
      }

       if (!found) {
           // first occurrence of value in this OracleBag
           if (distinctItemsInBag == container.length) {
                resize();
           }
           container[distinctItemsInBag] = new Pair(value, 1);
             distinctItemsInBag++;
       }
 }

 private void resize() {
        Pair[] temp = new Pair[container.length * 2 + 1];
        for (int i = 0; i < container.length; i++) {
            temp[i] = container[i];
        }
        container = temp;
 }
    static OracleBag fixture(){return new OracleBag();}
    public Object examCall(int c){add(new String[]{"C","D","A","E","F","D"}[c]);return null;}
    public String examSnapshot(){return sizeOfBag+":"+distinctItemsInBag+":"+Arrays.toString(container);}
}