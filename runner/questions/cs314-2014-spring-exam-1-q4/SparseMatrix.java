import java.util.*;

class SMEntry {
    private final int row, col, value;
    SMEntry(int row, int col, int value) { this.row = row; this.col = col; this.value = value; }
    public int getRow() { return row; }
    public int getCol() { return col; }
    public int getVal() { return value; }
}

class SparseMatrix {
    private final int numRows;
    private final int numCols;
    private final ArrayList<SMEntry> nonZeroValues = new ArrayList<>();

    private SparseMatrix(int[][] values) {
        numRows = values.length;
        numCols = values[0].length;
        for (int row = 0; row < numRows; row++)
            for (int col = 0; col < numCols; col++)
                if (values[row][col] != 0) nonZeroValues.add(new SMEntry(row, col, values[row][col]));
    }

    static SparseMatrix of(int[][] values) { return new SparseMatrix(values); }

// __STUDENT_CODE__
}
