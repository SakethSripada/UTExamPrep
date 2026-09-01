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
private int helper(int[] data, int index, int tgt) {
    if(tgt == 0)
           // found a solution!
           return 1;
    else if(index == data.length)
           // no more cards to consider, assert tgt > 0
           return 0;
    else {
        // recursive case, choices are values times multipliers
        // multiplier of 0 means we are choosing to not use this card
        int result = 0;
        for(int multiplier = 0; multiplier <= 3; multiplier++) {
            int newTarget = tgt - data[index] * multiplier;
            if(newTarget >= 0)
                 // can't make a negative tgt, could handle 0 here
                 result += helper(data, index + 1, newTarget);
        }
        return result;
    }
}
    public Object examCall(int[] values, int valueIndex, int tgt) {
        return helper(values, valueIndex, tgt);
    }
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
