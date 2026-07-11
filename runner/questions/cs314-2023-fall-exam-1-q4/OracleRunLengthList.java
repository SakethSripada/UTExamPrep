import java.util.*;
class OracleRunLengthList implements ExamSnapshot {
    private ElementRun[] con=new ElementRun[10]; private int size; private int numRuns; private int numPairs;
    private static class ElementRun { int element,runLength; ElementRun(int e,int r){element=e;runLength=r;} public String toString(){return element+"x"+runLength;} }
    private OracleRunLengthList(){int[][] v={{5,4},{7,4},{3,8},{2,1},{3,6}}; for(int[] x:v)con[numRuns++]=new ElementRun(x[0],x[1]);numPairs=numRuns;size=23;}
public void remove(int pos) {
    int index = 0;
    int elementCount = con[0].runLength;
    while (pos > elementCount - 1) {
        index++;
        elementCount += con[index].runLength;
    }
    con[index].runLength--;
    size--;
    if (con[index].runLength == 0) {
        numRuns--;
        for (int i = index; i < numRuns; i++) con[i] = con[i + 1];
        con[numRuns] = null;
    }
}
    static OracleRunLengthList fixture(){return new OracleRunLengthList();}
    public Object examCall(int c){remove(new int[]{0,3,4,8,15,16}[c%6]);return null;}
    public String examSnapshot(){return size+":"+numRuns+":"+Arrays.toString(con);}
}