import java.util.*;
import java.io.*;

class OracleStudentSolution implements ExamSnapshot {
    private static final int[][] rc_deltas = {{-1, 1, 0, 0}, {0, 0, -1, 1}};
    private static final int[][] KNIGHT_DIRECTIONS = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
    private static final int MINE = -1;
    private static final int PSEUDO_EOF = 256, BITS_PER_WORD = 8;
    private static int[][] numMines = {{0,0,1},{0,1,1},{0,0,0}};
    private static boolean[][] revealed = new boolean[3][3];
    private char[][] theBoard = {{'C','A','T'},{'A','R','E'},{'T','E','N'}};
    private char[][] board = theBoard;
    private static boolean gameOver;
    private boolean inbounds(int row, int col) { return 0 <= row && row < theBoard.length && 0 <= col && col < theBoard[0].length; }
    private static boolean allMatch(int row, int col, Rectangle rectangle, boolean value, boolean[][] matrix) {
        for (int r = row; r < row + rectangle.height; r++)
            for (int c = col; c < col + rectangle.width; c++) if (matrix[r][c] != value) return false;
        return true;
    }
    private static void setVals(int row, int col, Rectangle rectangle, boolean value, boolean[][] matrix) {
        for (int r = row; r < row + rectangle.height; r++)
            for (int c = col; c < col + rectangle.width; c++) matrix[r][c] = value;
    }
    private static boolean colorsOkay(Map<String, List<String>> borders, Map<String, Color> colors) {
        for (String area : colors.keySet())
            for (String neighbor : borders.getOrDefault(area, Collections.emptyList()))
                if (colors.containsKey(neighbor) && colors.get(area) == colors.get(neighbor)) return false;
        return true;
    }
public static <E> boolean sameBottomN(Stack<E> s1, Stack<E> s2, int n) {
    Stack<E> t1 = new Stack<>();
    Stack<E> t2 = new Stack<>();
    dump(s1, t1);
    dump(s2, t2);
    int count = 0;
    boolean same = true;
    while (same && !t1.isEmpty() && !t2.isEmpty() && count < n) {
        same = t1.top().equals(t2.top());
        if (same) {
            count++;
        }
        s1.push(t1.pop());
        s2.push(t2.pop());
    }
    dump(t1, s1);
    dump(t2, s2);
    return count == n;
}
// empty the contents of org into dest
private static <E> void dump(Stack<E> org, Stack<E> dest) {
    while (!org.isEmpty()) {
        dest.push(org.pop());
    }
}
    
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
