import java.util.*;
class UnsortedSet<E> implements ExamSnapshot {
    private ArrayList<E> con;
// __STUDENT_CODE__
    static UnsortedSet<Integer> fixture(){return new UnsortedSet<>(new ArrayList<>(Arrays.asList(1,2,1,3,2,4,4)));}
    public Object examCall(int c){return con.contains(c);}
    public String examSnapshot(){return String.valueOf(con);}
}