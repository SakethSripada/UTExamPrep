import java.util.*;

class MathMatrix {
    private int[][] cells;

    public MathMatrix(int rows, int columns) {
        cells = new int[rows][columns];
    }

// __STUDENT_CODE__

    static MathMatrix of(int[][] data) {
        MathMatrix matrix = new MathMatrix(data.length, data[0].length);
        for (int r = 0; r < data.length; r++) {
            for (int c = 0; c < data[0].length; c++) {
                matrix.cells[r][c] = data[r][c];
            }
        }
        return matrix;
    }

    String rowsForTest() {
        return Arrays.deepToString(cells);
    }
}
