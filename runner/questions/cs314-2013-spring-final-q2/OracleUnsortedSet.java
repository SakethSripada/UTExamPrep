import java.util.*;
class OracleUnsortedSet<E> implements ExamSnapshot {
    private ArrayList<E> con;
public OracleUnsortedSet(ArrayList<E> init) {
    con = new ArrayList<>(init);
    int index = 0;
    while (index < con.size()) {
        E current = con.get(index);
        int earlier = 0;
        while (earlier < index && !current.equals(con.get(earlier))) earlier++;
        if (earlier < index) con.remove(index);
        else index++;
    }
}
    static OracleUnsortedSet<Integer> fixture(){return new OracleUnsortedSet<>(new ArrayList<>(Arrays.asList(1,2,1,3,2,4,4)));}
    public Object examCall(int c){return con.contains(c);}
    public String examSnapshot(){return String.valueOf(con);}
}