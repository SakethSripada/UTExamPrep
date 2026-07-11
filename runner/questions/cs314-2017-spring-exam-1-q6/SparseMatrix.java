import java.util.*;
class SparseMatrix implements ExamSnapshot {
    private int numRows=4,numCols=5,numNonZeros; private SMEntry[] nonZeros=new SMEntry[10];
    private static class SMEntry {int row,col,val;SMEntry(int r,int c,int v){row=r;col=c;val=v;}public String toString(){return row+","+col+"="+val;}}
    private SparseMatrix(){int[][] v={{0,1,3},{1,0,4},{1,3,7},{2,2,8},{3,0,2},{3,4,9}};for(int[]x:v)nonZeros[numNonZeros++]=new SMEntry(x[0],x[1],x[2]);}
// __STUDENT_CODE__
    static SparseMatrix fixture(){return new SparseMatrix();}
    public Object examCall(int c){SMEntry e=nonZeros[c%numNonZeros];setNonZeroValue(e.row,e.col,c%2==0?0:20+c);return null;}
    public String examSnapshot(){return numNonZeros+":"+Arrays.toString(nonZeros);}
}