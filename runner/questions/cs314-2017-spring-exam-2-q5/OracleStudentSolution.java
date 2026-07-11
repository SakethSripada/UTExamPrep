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
public boolean canWin(ConnectFourBoard b, char goal, char cur) {
      // base case
      if (b.gameOver()) {
            return b.winner() == goal;
      } else {
            char next = cur == 'b' ? 'r' : 'b';
            if (goal == cur) {
                   // looking for a winning move to return true
                   for (int col = 0; col < ConnectFourBoard.NUM_COL; col++) {
                         if (b.columnisOpen(col)) {
                               b.dropPiece(col, cur);
                               boolean won = canWin(b, goal, next);
                               b.pickUpTopChecker(col);
                               if (won)
                                     return true;
                         }
                   }
                   return false; // the goal player can't find a win
            } else {
                   // looking for any non-win to prevent goal from winning
                   for (int col = 0; col < ConnectFourBoard.NUM_COL; col++) {
                         if (b.columnisOpen(col)) {
                               b.dropPiece(col, cur);
                               boolean won = canWin(b, goal, next);
                               b.pickUpTopChecker(col);
                               if (!won)
                                     return false;
                         }
                   }
                   return true; // The goal player can win no matter what we do!!
            }
      }
}
    
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
