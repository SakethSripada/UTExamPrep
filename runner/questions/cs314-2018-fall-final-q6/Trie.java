import java.util.*;
class Trie implements ExamSnapshot {
    private TNode root=new TNode();
    private static class TNode {boolean word;char ch;List<TNode> children;TNode(){}TNode(char c){ch=c;}public boolean equals(Object o){return o instanceof TNode&&ch==((TNode)o).ch;}}
    private TNode getNodeForPrefix(String p){TNode n=root;for(char c:p.toCharArray()){if(n.children==null)return null;TNode found=null;for(TNode x:n.children)if(x.ch==c)found=x;if(found==null)return null;n=found;}return n;}
    private void addWord(String w){TNode n=root;for(char c:w.toCharArray()){if(n.children==null)n.children=new ArrayList<>();TNode f=null;for(TNode x:n.children)if(x.ch==c)f=x;if(f==null){f=new TNode(c);n.children.add(f);}n=f;}n.word=true;}
// __STUDENT_CODE__
    static Trie fixture(){Trie t=new Trie();for(String w:new String[]{"bat","bats","bad","be","bear","bed","bee","been","bees","do","dog"})t.addWord(w);return t;}
    public Object examCall(int c){List<String>r=getWords(new String[]{"bee","ba","do","z","b","dog"}[c]);Collections.sort(r);return r;}
    public String examSnapshot(){return String.valueOf(examCall(4));}
}