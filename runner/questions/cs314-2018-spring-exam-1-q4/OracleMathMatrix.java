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
    public int numRows() { return myCells.length; }
    public int numCols() { return myCells[0].length; }
    public int getValue(int row, int col) { return myCells[row][col]; }
    public int get(int row, int col) { return myCells[row][col]; }

public boolean isUpperBidiagonal() {
    if (myCells.length == 1 || myCells.length != myCells[0].length) return false;
    for (int row = 0; row < myCells.length; row++) {
        for (int column = 0; column < myCells[0].length; column++) {
            if (row == column || column == row + 1) {
                if (myCells[row][column] == 0) return false;
            } else if (myCells[row][column] != 0) {
                return false;
            }
        }
    }
    return true;
}

    public String examSnapshot() { return Arrays.deepToString(myCells); }
}
