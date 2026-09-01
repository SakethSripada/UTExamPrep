import java.util.*;
class ExamHashMap<K,V> implements ExamSnapshot {
    private static final double LOAD_LIMIT=.65; private Pair<K,V>[] con; private int size; private final Pair<K,V> EMPTY=new Pair<>(null,null);
    private static class Pair<A,B>{A key;B value;Pair(A k,B v){key=k;value=v;}public String toString(){return key+"="+value;}}
    private ExamHashMap(){con=(Pair<K,V>[])new Pair[11];}
    private void resize(){Pair<K,V>[]old=con;con=(Pair<K,V>[])new Pair[old.length*2+1];size=0;for(Pair<K,V>p:old)if(p!=null&&p.key!=null)putSeed(p.key,p.value);}
    private void putSeed(K k,V v){int i=Math.abs(k.hashCode()%con.length);while(con[i]!=null)i=(i+1)%con.length;con[i]=new Pair<>(k,v);size++;}
// __STUDENT_CODE__
    static ExamHashMap<String,Integer> fixture(){ExamHashMap<String,Integer>m=new ExamHashMap<>();m.putSeed("Aa",1);m.putSeed("BB",2);m.putSeed("C",3);return m;}
    public Object examCall(int c){return putIfAbsent((K)(Object)new String[]{"Aa","BB","D","E","F","G"}[c],(V)(Object)Integer.valueOf(10+c));}
    public String examSnapshot(){return size+":"+Arrays.toString(con);}
}