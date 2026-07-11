import java.util.*;
class OracleDicePuzzle implements ExamSnapshot {
    static class Die {char[]colors;int left;Die(String s){colors=s.toCharArray();}char getColor(int side){return colors[side];}char getColorSide(int side){return colors[side];}char getColorOppositeSide(int side){return colors[(side+3)%6];}void positionLeftFace(int side){left=side;}int getLeftFacingSide(){return left;}public String toString(){return ""+colors[left]+colors[(left+3)%6];}}
public ArrayList<Die> solvePuzzle(Die[] dice) {
    ArrayList<Die> result = new ArrayList<>();
    solve(dice, 0, '?', result);
    return result;
}

private boolean solve(Die[] dice, int position, char previousRight, ArrayList<Die> result) {
    if (position == dice.length) return true;
    Die die = dice[position];
    result.add(die);
    for (int side = 0; side < 6; side++) {
        die.positionLeftFace(side);
        if (position == 0 || previousRight == die.getColor(side)) {
            if (solve(dice, position + 1, die.getColorOppositeSide(side), result)) return true;
        }
    }
    result.remove(result.size() - 1);
    return false;
}
    static OracleDicePuzzle fixture(){return new OracleDicePuzzle();}
    public Object examCall(int c){Die[]d=c%2==0?new Die[]{new Die("ABCDEF"),new Die("DEFXYZ"),new Die("XABYCD")}:new Die[]{new Die("AAAAAA"),new Die("BBBBBB")};ArrayList<Die>r=solvePuzzle(d);return r.toString();}
    public String examSnapshot(){return "stateless";}
}