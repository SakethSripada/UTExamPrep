import java.util.*;
import java.io.*;

class Stack<E> extends java.util.Stack<E> { E top() { return peek(); } }
class Queue<E> extends LinkedList<E> {
    void enqueue(E value) { add(value); }
    E dequeue() { return remove(); }
    E front() { return element(); }
}
class Stack314<E> extends Stack<E> { }
class Queue314<E> extends Queue<E> { }
class Point {
    final double x, y; Point(double x, double y) { this.x = x; this.y = y; }
    double distance(Point other) { return Math.hypot(x - other.x, y - other.y); }
    double distanceTo(Point other) { return distance(other); }
    int getX() { return (int) x; } int getY() { return (int) y; }
    public String toString() { return x + ":" + y; }
}
class Position {
    final int row, col; Position(int row, int col) { this.row = row; this.col = col; }
    int getRow() { return row; } int getCol() { return col; }
    public boolean equals(Object other) { return other instanceof Position && row == ((Position) other).row && col == ((Position) other).col; }
    public int hashCode() { return Objects.hash(row, col); }
}
class Rectangle {
    final int height = 1, width = 1;
    boolean intersects(Rectangle other) { return this != other; }
}
class Airline {
    final String name; final Set<Airline> destinations = new LinkedHashSet<>();
    Airline(String name) { this.name = name; }
    Set<Airline> getDestinations() { return destinations; }
    Airline[] getPartners() { return destinations.toArray(new Airline[0]); }
    public boolean equals(Object other) { return other instanceof Airline && name.equals(((Airline) other).name); }
    public int hashCode() { return name.hashCode(); }
}
enum Color { RED, GREEN, BLUE }
class Move { final int source, removed, dest; Move(int s,int r,int d){source=s;removed=r;dest=d;} int sourceRow(){return 0;} int sourceCol(){return source;} int removedRow(){return 0;} int removedCol(){return removed;} int destRow(){return 0;} int destCol(){return dest;} }
class Board {
    final boolean[] marbles; Board(boolean... values){marbles=values;}
    static Board fixture(int c){return c%3==0?new Board(true,true,false):c%3==1?new Board(false,true,true):new Board(true,false,true);}
    int numMarblesOnBoard(){int n=0;for(boolean b:marbles)if(b)n++;return n;}
    Move[] getMoves(){ArrayList<Move>m=new ArrayList<>();for(int i=0;i+2<marbles.length;i++){if(marbles[i]&&marbles[i+1]&&!marbles[i+2])m.add(new Move(i,i+1,i+2));if(!marbles[i]&&marbles[i+1]&&marbles[i+2])m.add(new Move(i+2,i+1,i));}return m.toArray(new Move[0]);}
    void removeMarble(int r,int c){marbles[c]=false;} void placeMarble(int r,int c){marbles[c]=true;}
}
class ConnectFourBoard {
    static final int NUM_COL=4; final char[] cells=new char[NUM_COL];
    static ConnectFourBoard fixture(int c){ConnectFourBoard b=new ConnectFourBoard();if(c%2==0){b.cells[0]='r';b.cells[1]='r';b.cells[2]='r';}return b;}
    boolean gameOver(){return winner()!=' ';} char winner(){char x=cells[0];if(x!=0)for(char y:cells)if(y!=x)return ' ';return x==0?' ':x;}
    boolean columnisOpen(int c){return cells[c]==0;} void dropPiece(int c,char x){cells[c]=x;} void pickUpTopChecker(int c){cells[c]=0;}
}
class BuildingMap {
    final Map<String,String[]> links=new LinkedHashMap<>(); final Set<String> visited=new HashSet<>();
    static BuildingMap fixture(int c){BuildingMap m=new BuildingMap();m.links.put("A",new String[]{"B","C"});m.links.put("B",new String[]{"D"});m.links.put("C",c%2==0?new String[]{"D"}:new String[0]);m.links.put("D",new String[0]);return m;}
    void setVisited(String s,boolean v){if(v)visited.add(s);else visited.remove(s);} boolean visitedStatus(String s){return visited.contains(s);} String[] connected(String s){return links.getOrDefault(s,new String[0]);}
}
class BitInputStream {
    private final int[] bits; private int index;
    BitInputStream(int... bits) { this.bits = bits; }
    int readBits(int count) {
        if (index + count > bits.length) return -1;
        int result = 0;
        for (int i = 0; i < count; i++) result = (result << 1) | bits[index++];
        return result;
    }
    void close() { }
    public String toString() { return index + "/" + bits.length; }
}
class BitInputReader extends BitInputStream { BitInputReader(int... bits) { super(bits); } }
class BitOutputStream {
    private final ArrayList<Integer> bits = new ArrayList<>();
    void writeBits(int count, int value) { for (int shift = count - 1; shift >= 0; shift--) bits.add((value >> shift) & 1); }
    void close() { }
    public boolean equals(Object other) { return other instanceof BitOutputStream && bits.equals(((BitOutputStream) other).bits); }
    public int hashCode() { return bits.hashCode(); }
    public String toString() { return bits.toString(); }
}