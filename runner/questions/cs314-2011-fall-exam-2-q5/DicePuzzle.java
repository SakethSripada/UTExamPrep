import java.util.*;
class DicePuzzle implements ExamSnapshot {
    static class Die {char[]colors;int left;Die(String s){colors=s.toCharArray();}char getColor(int side){return colors[side];}char getColorSide(int side){return colors[side];}char getColorOppositeSide(int side){return colors[(side+3)%6];}void positionLeftFace(int side){left=side;}int getLeftFacingSide(){return left;}public String toString(){return ""+colors[left]+colors[(left+3)%6];}}
// __STUDENT_CODE__
    static DicePuzzle fixture(){return new DicePuzzle();}
    public Object examCall(int c){Die[]d=c%2==0?new Die[]{new Die("ABCDEF"),new Die("DEFXYZ"),new Die("XABYCD")}:new Die[]{new Die("AAAAAA"),new Die("BBBBBB")};ArrayList<Die>r=solvePuzzle(d);return r.toString();}
    public String examSnapshot(){return "stateless";}
}