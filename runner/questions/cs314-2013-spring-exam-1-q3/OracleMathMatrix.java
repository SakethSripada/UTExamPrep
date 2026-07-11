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

public void multiplyByVector(ArrayList<Integer> vector) {
    if (vector.size() == coeffs.length || vector.size() == coeffs[0].length) {
        boolean matchesRows = vector.size() == coeffs.length;
        for (int row = 0; row < coeffs.length; row++) {
            for (int column = 0; column < coeffs[0].length; column++) {
                coeffs[row][column] *= matchesRows ? vector.get(row) : vector.get(column);
            }
        }
    }
}

    public String examSnapshot() { return Arrays.deepToString(coeffs); }
}
