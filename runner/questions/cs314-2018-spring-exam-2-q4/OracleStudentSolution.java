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
public static String highestGPA(Map<String, Map<String, Double>> m) {
       // I'll store the number of students that took the class
       // in the first element and the total grade points
       // in the second element.
       Map<String, double[]> classes = new HashMap<>();
       for (String student : m.keySet()) {
              Map<String, Double> studentsGrades = m.get(student);
              for (String aClass : studentsGrades.keySet()) {
                   double[] grades = classes.get(aClass);
                   if (grades == null) {
                         // First time we have seen this class.
                         grades = new double[] {0.0, 0.0};
                         classes.put(aClass, grades);
                   }
                   grades[0]++;
                   grades[1] += studentsGrades.get(aClass);
              }
       }
       // Now find highest average GPA.
       double max = -1.0;
       String result = "";
       for (String aClass : classes.keySet()) {
              double[] data = classes.get(aClass);
              double aveGPA = data[1] / data[0];
              if (aveGPA > max) {
                   max = aveGPA;
                   result = aClass;
              }
       }
       return result;
}
    
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
