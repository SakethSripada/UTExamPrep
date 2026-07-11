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
public static TreeMap<String, ArrayList<Integer>>
      getIndex(String[][] book, String[] keyWords) {
      TreeMap<String, ArrayList<Integer>> index;
      index = new TreeMap<>();
      // We know all elements of keyWords are present
      // in book so add them all up front.
      for (String word : keyWords) {
          index.put(word, new ArrayList<>());
      }
      for (int i = 0; i < book.length; i++) {
          int pageNum = i + 1;
          for (String word : book[i]) {
              if (index.containsKey(word)) {
                  ArrayList<Integer> pageNums = index.get(word);
                  // Make sure we have not already
                  // added this page.
                  if (pageNums.size() == 0
                      || pageNums.get(pageNums.size() - 1) != pageNum) {
                      pageNums.add(pageNum);
                   // pageNums is a reference shared by map, so no
                   // need to put back.
                  }
              }
          }
      }
      return index;
}
    
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
