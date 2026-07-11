import java.util.*;
import java.io.*;

class OracleMathMatrix implements ExamSnapshot {
    private int[][] cells;
    private int[][] coefficients;
    private int[][] coeffs;
    private int[][] myCells;
    private int[][] elements;
    private int[][] data;
    private int[][] matrix;

    public OracleMathMatrix(int rows, int columns) { set(new int[rows][columns]); }
    private void set(int[][] source) {
        cells = copy(source); coefficients = cells; coeffs = cells; myCells = cells; elements = cells; data = cells; matrix = cells;
    }
    private static int[][] copy(int[][] source) {
        int[][] result = new int[source.length][];
        for (int i = 0; i < source.length; i++) result[i] = Arrays.copyOf(source[i], source[i].length);
        return result;
    }
    static OracleMathMatrix of(int[][] source) {
        OracleMathMatrix result = new OracleMathMatrix(source.length, source[0].length);
        result.set(source);
        return result;
    }
    public int numRows() { return coeffs.length; }
    public int numCols() { return coeffs[0].length; }
    public int getValue(int row, int col) { return coeffs[row][col]; }
    public int get(int row, int col) { return coeffs[row][col]; }

public boolean possibleDiagonal () {
     // square matrix so we can use same nested loop to traverse row and column.
     // Must have exactly one non zero value per row and per column to be
     // possible strictly diagonal.
     for (int i = 0; i < coeffs.length; i++) {
           int rowCount = 0;
           int colCount = 0;
           for (int j = 0; j < coeffs.length; j++) {
                if (coeffs[i][j] != 0)
                      rowCount++;
                if (coeffs[j][i] != 0)
                      colCount++;
           }
           if (rowCount != 1 || colCount != 1)
                return false;
     }
     return true;
}

    public String examSnapshot() { return Arrays.deepToString(coeffs); }
}
