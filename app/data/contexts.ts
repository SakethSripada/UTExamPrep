export const computerContext = `public class Computer {
    private int memory;
    public Computer() { memory = 8; }
    public Computer(int m) { memory = m; }
    public void upgrade() { memory *= 2; }
    public String toString() { return "" + getMemory(); }
    public int getMemory() { return memory; }
}

public class PC extends Computer {
    public int getMemory() { return 10; }
}

public class Mac extends Computer {
    private int colors;
    public Mac(int c, int m) {
        super(m);
        colors = c;
    }
    public int getColors() { return colors; }
}`;

export const roomContext = `public class Room {
    private int seats;
    public Room(int s) { seats = s; }
    public void expand() { seats += 5; }
    public int getSeats() { return seats; }
    public String toString() { return "room: " + seats; }
}

public class Meeting extends Room {
    private boolean tele;
    public Meeting(int s) { super(s); }
    public void expand() { tele = true; }
    public String toString() { return super.toString() + " " + tele; }
}

public class Classroom extends Room {
    private int plugs;
    public Classroom(int p, int s) {
        super(s * 2);
        plugs = p;
    }
    public void add(int p) {
        plugs += p;
        expand();
        expand();
    }
}`;

export const critterContext = `public abstract class Critter {
    public boolean eat() { return false; }
    public Attack fight(String opponent) { return Attack.FORFEIT; }
    public Color getColor() { return Color.BLACK; }
    public Direction getMove() { return Direction.CENTER; }
    public String toString() { return "?"; }

    public static enum Direction {
        NORTH, SOUTH, EAST, WEST, CENTER
    }

    public static enum Attack {
        ROAR, POUNCE, SCRATCH, FORFEIT
    }
}

Use Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST, and Direction.CENTER for moves.
Use Attack.ROAR, Attack.POUNCE, Attack.SCRATCH, and Attack.FORFEIT for fights.`;

