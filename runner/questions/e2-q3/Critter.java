import java.awt.Color;

public abstract class Critter {
    public boolean eat() { return false; }
    public Attack fight(String opponent) { return Attack.FORFEIT; }
    public Color getColor() { return Color.BLACK; }
    public Direction getMove() { return Direction.CENTER; }
    public String toString() { return "?"; }
    public static enum Direction { NORTH, SOUTH, EAST, WEST, CENTER }
    public static enum Attack { ROAR, POUNCE, SCRATCH, FORFEIT }
}
