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
    public int numRows() { return elements.length; }
    public int numCols() { return elements[0].length; }
    public int getValue(int row, int col) { return elements[row][col]; }
    public int get(int row, int col) { return elements[row][col]; }

public boolean isIntegerMultiple(OracleMathMatrix other) {
    int magicMultiple = other.elements[0][0] / this.elements[0][0];
    int remainder = other.elements[0][0] % this.elements[0][0];
    boolean integerMultiple = remainder == 0;
    int row = 0;
    while (row < elements.length && integerMultiple) {
        int column = 0;
        while (column < elements[0].length && integerMultiple) {
            int multiple = other.elements[row][column] / elements[row][column];
            remainder = other.elements[row][column] % elements[row][column];
            integerMultiple = multiple == magicMultiple && remainder == 0;
            column++;
        }
        row++;
    }
    return integerMultiple;
}

    public String examSnapshot() { return Arrays.deepToString(elements); }
}
