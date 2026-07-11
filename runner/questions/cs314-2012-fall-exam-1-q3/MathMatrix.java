import java.util.*;
import java.io.*;

class MathMatrix implements ExamSnapshot {
    private int[][] cells;
    private int[][] coefficients;
    private int[][] coeffs;
    private int[][] myCells;
    private int[][] elements;
    private int[][] data;
    private int[][] matrix;

    public MathMatrix(int rows, int columns) { set(new int[rows][columns]); }
    private void set(int[][] source) {
        cells = copy(source); coefficients = cells; coeffs = cells; myCells = cells; elements = cells; data = cells; matrix = cells;
    }
    private static int[][] copy(int[][] source) {
        int[][] result = new int[source.length][];
        for (int i = 0; i < source.length; i++) result[i] = Arrays.copyOf(source[i], source[i].length);
        return result;
    }
    static MathMatrix of(int[][] source) {
        MathMatrix result = new MathMatrix(source.length, source[0].length);
        result.set(source);
        return result;
    }
    public int numRows() { return elements.length; }
    public int numCols() { return elements[0].length; }
    public int getValue(int row, int col) { return elements[row][col]; }
    public int get(int row, int col) { return elements[row][col]; }

// __STUDENT_CODE__

    public String examSnapshot() { return Arrays.deepToString(elements); }
}
