import java.util.*;
import java.io.*;

class SparseMatrix implements ExamSnapshot {
    private int[][] cells;
    private int[][] coefficients;
    private int[][] coeffs;
    private int[][] myCells;
    private int[][] elements;
    private int[][] data;
    private int[][] matrix;

    public SparseMatrix(int rows, int columns) { set(new int[rows][columns]); }
    private void set(int[][] source) {
        cells = copy(source); coefficients = cells; coeffs = cells; myCells = cells; elements = cells; data = cells; matrix = cells;
    }
    private static int[][] copy(int[][] source) {
        int[][] result = new int[source.length][];
        for (int i = 0; i < source.length; i++) result[i] = Arrays.copyOf(source[i], source[i].length);
        return result;
    }
    static SparseMatrix of(int[][] source) {
        SparseMatrix result = new SparseMatrix(source.length, source[0].length);
        result.set(source);
        return result;
    }
    public int numRows() { return cells.length; }
    public int numCols() { return cells[0].length; }
    public int getValue(int row, int col) { return cells[row][col]; }
    public int get(int row, int col) { return cells[row][col]; }

// __STUDENT_CODE__

    public String examSnapshot() { return Arrays.deepToString(cells); }
}
