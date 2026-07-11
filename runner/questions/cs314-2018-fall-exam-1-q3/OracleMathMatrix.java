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

public boolean hasIntegerMultipleRow() {
    for (int first = 0; first < cells.length; first++) {
        for (int second = first + 1; second < cells.length; second++) {
            if (isMultiple(cells[first], cells[second]) || isMultiple(cells[second], cells[first])) {
                return true;
            }
        }
    }
    return false;
}

private static boolean isMultiple(int[] first, int[] second) {
    int multiple = second[0] / first[0];
    if (multiple == 0) return false;
    for (int index = 0; index < first.length; index++) {
        if (multiple * first[index] != second[index]) return false;
    }
    return true;
}

    public String examSnapshot() { return Arrays.deepToString(cells); }
}
