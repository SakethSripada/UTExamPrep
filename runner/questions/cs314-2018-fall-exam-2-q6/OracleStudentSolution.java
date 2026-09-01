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
private static boolean helper(int i, Rectangle[] rects,
              boolean[][] mat, Rectangle goal) {

       if (allMatch(0, 0, goal, true, mat))
           return true; // pop, pop, pop. Covered all elements!
       else if (i == rects.length)
           return false; // no more options, too bad :(

       // deal with the current Rectangle.
       // Options are upper left corner to place it in.
       Rectangle currentRect = rects[i];
       int rowLimit = mat.length - currentRect.height;
       int colLimit = mat[0].length - currentRect.width;
       for (int r = 0; r <= rowLimit; r++) {
           for (int c = 0; c <= colLimit; c++) {
               if (allMatch(r, c, currentRect, false, mat)) {
                   // we can place current rectangle at r, c
                   setVals(r, c, currentRect, true, mat);
                   if (helper(i + 1, rects, mat, goal)) {
                       return true; // It worked!!!!
                   }
                   // didn't work, pick up the rectangle
                   setVals(r, c, currentRect, false, mat);
               }
           }
       }
       // One last chance! Don't use this Rectangle at all!!
       return helper(i + 1, rects, mat, goal);
}
    public Object examCall(int i, Rectangle[] rects, boolean[][] mat, Rectangle goal) {
        return helper(i, rects, mat, goal);
    }
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
