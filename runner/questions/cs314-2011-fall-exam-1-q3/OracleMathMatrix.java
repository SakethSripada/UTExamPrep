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
    public int numRows() { return coefficients.length; }
    public int numCols() { return coefficients[0].length; }
    public int getValue(int row, int col) { return coefficients[row][col]; }
    public int get(int row, int col) { return coefficients[row][col]; }

public int getNumUniformColumns() {
    int result = 0;
    for(int col = 0; col < coefficients[0].length; col++) {
        int first = coefficients[0][col];
        int row = 1;
        while(row < coefficients.length
                                    && coefficients[row][col] == first)
            row++;
        if(row == coefficients.length)
            result++;
    }
    return result;
}

    public String examSnapshot() { return Arrays.deepToString(coefficients); }
}
