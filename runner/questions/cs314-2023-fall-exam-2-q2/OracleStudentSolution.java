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
public static Object[] getMap(String[] results) {
        TreeMap<String, int[]> map = new TreeMap<>();
        for (int i = 0; i < results.length; i += 2) {
            String name = results[i];
            String gameResult = results[i + 1];
            int[] record = map.get(name);
            if (record == null) {
                // first time seen this team.
                record = new int[2];
                map.put(name, record);
            }
            // Win or Loss?
            if (gameResult.equals("W")) {
                record[0]++;
            } else { // must have been a loss
                record[1]++;
            }
        }
        // Now find the best team.
        double bestWinPercentage = -1;
        String best = "";
        for (String teamName : map.keySet()) {
            int[] record = map.get(teamName);
            double winPercentage = 1.0 * record[0]
                / (record[0] + record[1]);
            if (winPercentage > bestWinPercentage) {
                bestWinPercentage = winPercentage;
                best = teamName;
            }
        }
        return new Object[] {map, best};
    }
    
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
