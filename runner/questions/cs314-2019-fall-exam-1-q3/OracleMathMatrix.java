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
    public int numRows() { return cells.length; }
    public int numCols() { return cells[0].length; }
    public int getValue(int row, int col) { return cells[row][col]; }
    public int get(int row, int col) { return cells[row][col]; }

public boolean diagonallyDominates(OracleMathMatrix other) {
     if (!square() || !other.square() || cells.length != other.cells.length) {
         throw new IllegalArgumentException("Matrices not square or size");
     }

        for (int r = 0; r < cells.length; r++) {
            for (int c = 0; c <= r; c++) {
                if (cells[r][c] <= other.cells[r][c]) {
                    return false;
                }
            }
        }
        return true;
 }

private boolean square() {
       // recall, we know (assume) cells is rectangular
       return cells.length == cells[0].length;
}

    public String examSnapshot() { return Arrays.deepToString(cells); }
}
