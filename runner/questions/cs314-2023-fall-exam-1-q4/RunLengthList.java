import java.util.*;
class RunLengthList implements ExamSnapshot {
    private ElementRun[] con=new ElementRun[10]; private int size; private int numRuns; private int numPairs;
    private static class ElementRun { int element,runLength; ElementRun(int e,int r){element=e;runLength=r;} public String toString(){return element+"x"+runLength;} }
    private RunLengthList(){int[][] v={{5,4},{7,4},{3,8},{2,1},{3,6}}; for(int[] x:v)con[numRuns++]=new ElementRun(x[0],x[1]);numPairs=numRuns;size=23;}
// __STUDENT_CODE__
    static RunLengthList fixture(){return new RunLengthList();}
    public Object examCall(int c){remove(new int[]{0,3,4,8,15,16}[c%6]);return null;}
    public String examSnapshot(){return size+":"+numRuns+":"+Arrays.toString(con);}
}