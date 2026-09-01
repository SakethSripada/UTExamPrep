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
private static boolean helper(Map<String, List<String>> borders,
           Color[] colors, List<String> areas, int currentArea,
           Map<String, Color> result) {

     // base case, all areas assigned a color with no conflicts
     if(currentArea == areas.size())
         return true;
     else {
         // try the choices for the current area
         String area = areas.get(currentArea);
         int nextArea = currentArea + 1;
         for(int i = 0; i < colors.length; i++) {
             result.put(area, colors[i]);
             if(colorsOkay(borders, result)) {
                 boolean solved = helper(borders, colors, areas,
                                                          nextArea, result);
                 if(solved)
                     return true;
             }
             // loop will try the next color
         }
         // no colors worked, remove last color from map
         result.remove(area);
     }
     return false;
}
    public Object examCall(Map<String, List<String>> borders, Color[] colors, List<String> areas, int currentArea, Map<String, Color> result) {
        return helper(borders, colors, areas, currentArea, result);
    }
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
