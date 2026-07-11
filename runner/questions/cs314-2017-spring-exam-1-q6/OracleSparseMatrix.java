import java.util.*;
class OracleSparseMatrix implements ExamSnapshot {
    private int numRows=4,numCols=5,numNonZeros; private SMEntry[] nonZeros=new SMEntry[10];
    private static class SMEntry {int row,col,val;SMEntry(int r,int c,int v){row=r;col=c;val=v;}public String toString(){return row+","+col+"="+val;}}
    private OracleSparseMatrix(){int[][] v={{0,1,3},{1,0,4},{1,3,7},{2,2,8},{3,0,2},{3,4,9}};for(int[]x:v)nonZeros[numNonZeros++]=new SMEntry(x[0],x[1],x[2]);}
public void setNonZeroValue(int row, int col, int val) {

        // according to precondition, element specified by row, col MUST
        // be in the array. Don't need to check index < numNonZeros based
        // on precondition
        int index = 0;
        while (nonZeros[index].row != row || nonZeros[index].col != col) {
             index++;
        }

        if (val != 0) {
             // simple
             nonZeros[index].val = val;
        } else {
             // must shift and update instance variables
             numNonZeros--;
             for (int i = index; i < numNonZeros; i++) {
                   nonZeros[i] = nonZeros[i + 1];
             }
             // prevent memory leak
             nonZeros[numNonZeros] = null;
        }
}
    static OracleSparseMatrix fixture(){return new OracleSparseMatrix();}
    public Object examCall(int c){SMEntry e=nonZeros[c%numNonZeros];setNonZeroValue(e.row,e.col,c%2==0?0:20+c);return null;}
    public String examSnapshot(){return numNonZeros+":"+Arrays.toString(nonZeros);}
}