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
public static String getMissingGroupingSymbols(String str) {
    Stack<Character> symbols = new Stack<>();
    for (int i = 0; i < str.length(); i++) {
        char ch = str.charAt(i);
        if (isOpening(ch)) symbols.push(ch);
        else if (symbols.isEmpty() || !matches(ch, symbols.peek())) return null;
        else symbols.pop();
    }
    String result = "";
    while (!symbols.isEmpty()) result += getMatch(symbols.pop());
    return result;
}

private static boolean matches(char close, char open) {
    return close == ']' ? open == '[' : open == '(';
}

private static boolean isOpening(char ch) { return ch == '[' || ch == '('; }
private static char getMatch(char ch) { return ch == '(' ? ')' : ']'; }
    
    public String examSnapshot() { return Arrays.deepToString(revealed) + gameOver + Arrays.deepToString(theBoard); }
}
