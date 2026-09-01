import java.util.*;
class OracleExamHashMap<K,V> implements ExamSnapshot {
    private static final double LOAD_LIMIT=.65; private Pair<K,V>[] con; private int size; private final Pair<K,V> EMPTY=new Pair<>(null,null);
    private static class Pair<A,B>{A key;B value;Pair(A k,B v){key=k;value=v;}public String toString(){return key+"="+value;}}
    private OracleExamHashMap(){con=(Pair<K,V>[])new Pair[11];}
    private void resize(){Pair<K,V>[]old=con;con=(Pair<K,V>[])new Pair[old.length*2+1];size=0;for(Pair<K,V>p:old)if(p!=null&&p.key!=null)putSeed(p.key,p.value);}
    private void putSeed(K k,V v){int i=Math.abs(k.hashCode()%con.length);while(con[i]!=null)i=(i+1)%con.length;con[i]=new Pair<>(k,v);size++;}
public boolean putIfAbsent(K key, V value) {
    if ((double) size / con.length >= LOAD_LIMIT) resize();
    int index = Math.abs(key.hashCode() % con.length);
    int addIndex = -1;
    while (con[index] != null) {
        if (con[index] == EMPTY) {
            if (addIndex == -1) addIndex = index;
        } else if (key.equals(con[index].key)) return false;
        index = (index + 1) % con.length;
    }
    if (addIndex == -1) addIndex = index;
    con[addIndex] = new Pair<>(key, value);
    size++;
    return true;
}
    static OracleExamHashMap<String,Integer> fixture(){OracleExamHashMap<String,Integer>m=new OracleExamHashMap<>();m.putSeed("Aa",1);m.putSeed("BB",2);m.putSeed("C",3);return m;}
    public Object examCall(int c){return putIfAbsent((K)(Object)new String[]{"Aa","BB","D","E","F","G"}[c],(V)(Object)Integer.valueOf(10+c));}
    public String examSnapshot(){return size+":"+Arrays.toString(con);}
}