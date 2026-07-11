import java.util.*;
import java.lang.reflect.Array;

interface ExamSnapshot { String examSnapshot(); }

public class TestRunner {
    private static int passed;
    private static int total;

    private interface CheckedCall { Object run() throws Throwable; }

    private static final class Outcome {
        private final Object value;
        private final String error;
        private Outcome(Object value, String error) { this.value = value; this.error = error; }
        static Outcome capture(CheckedCall call) {
            try { return new Outcome(normalize(call.run()), null); }
            catch (Throwable error) { return new Outcome(null, error.getClass().getName()); }
        }
        public boolean equals(Object other) {
            if (!(other instanceof Outcome)) return false;
            Outcome rhs = (Outcome) other;
            return Objects.equals(value, rhs.value) && Objects.equals(error, rhs.error);
        }
        public String toString() { return error == null ? String.valueOf(value) : "throws " + error; }
    }

    private static Object normalize(Object value) {
        if (value == null) return null;
        if (value instanceof ExamSnapshot) return ((ExamSnapshot) value).examSnapshot();
        if (value instanceof Iterable<?>) {
            ArrayList<Object> result = new ArrayList<>();
            for (Object item : (Iterable<?>) value) result.add(normalize(item));
            return result;
        }
        if (value instanceof Map<?, ?>) {
            TreeMap<String, Object> result = new TreeMap<>();
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) value).entrySet())
                result.put(String.valueOf(entry.getKey()), normalize(entry.getValue()));
            return result;
        }
        Class<?> type = value.getClass();
        if (!type.isArray()) return value;
        int length = Array.getLength(value);
        ArrayList<Object> result = new ArrayList<>();
        for (int i = 0; i < length; i++) result.add(normalize(Array.get(value, i)));
        return result;
    }

    private static void checkEqual(Object actual, Object expected, String name) {
        total++;
        if (Objects.equals(actual, expected)) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            System.out.println("FAIL " + name + " expected=" + expected + " actual=" + actual);
        }
    }

    private static void runCases() {
        for (int caseIndex = 0; caseIndex < 6; caseIndex++) {
            final int currentCase = caseIndex;
            StudentSolution student = new StudentSolution();
            OracleStudentSolution oracle = new OracleStudentSolution();
            int[] base = caseIndex % 2 == 0 ? new int[]{1, 2, 1, 3, -1} : new int[]{5, 4, 3, 2, 1};
            int[] sArray = Arrays.copyOf(base, base.length);
            int[] oArray = Arrays.copyOf(base, base.length);
            int[] sArray2 = new int[]{1, 2, 3, 4, 5};
            int[] oArray2 = Arrays.copyOf(sArray2, sArray2.length);
            int[][] sMatrix = {{1, 2}, {3, 4}};
            int[][] oMatrix = {{1, 2}, {3, 4}};
            boolean[][] sBoolMatrix = new boolean[3][3];
            boolean[][] oBoolMatrix = new boolean[3][3];
            String[] sWords = {"A", "W", "B", "L", "A", "W"};
            String[] oWords = Arrays.copyOf(sWords, sWords.length);
            boolean[] sFlags = {true, false, true, true, false, true};
            boolean[] oFlags = Arrays.copyOf(sFlags, sFlags.length);
            String[][] sGrid = {{"Dayanny", "M10", "T9"}, {"Aish", "M1"}, {"Hailey", "T9"}, {"Ivan", "M1"}};
            String[][] oGrid = {{"Dayanny", "M10", "T9"}, {"Aish", "M1"}, {"Hailey", "T9"}, {"Ivan", "M1"}};
            String[][] sGrid2 = {{"M10", null}, {"M1", null}, {"M1", null}, {"T9", null}};
            String[][] oGrid2 = {{"M10", null}, {"M1", null}, {"M1", null}, {"T9", null}};
            ArrayList<Integer> sInts = new ArrayList<>(Arrays.asList(1, 2, 3, 2));
            ArrayList<Integer> oInts = new ArrayList<>(sInts);
            ArrayList<Integer> sInts2 = new ArrayList<>(Arrays.asList(2, 3, 4));
            ArrayList<Integer> oInts2 = new ArrayList<>(sInts2);
            ArrayList<String> sStrings = new ArrayList<>(Arrays.asList("A", "AB", "B", "BA"));
            ArrayList<String> oStrings = new ArrayList<>(sStrings);
            ArrayList<String> sStrings2 = new ArrayList<>(Arrays.asList("A", "B", "C"));
            ArrayList<String> oStrings2 = new ArrayList<>(sStrings2);
            Map sMap = new LinkedHashMap() {{ put("A", 2); put("B", 3); put("C", 1); }};
            Map oMap = new LinkedHashMap(sMap);
            Map sMap2 = new LinkedHashMap();
            Map oMap2 = new LinkedHashMap();
            
            Set<String> sSet = new LinkedHashSet<>(Arrays.asList("A", "C"));
            Set<String> oSet = new LinkedHashSet<>(sSet);
            Set<Airline> sAirlines = new LinkedHashSet<>();
            Set<Airline> oAirlines = new LinkedHashSet<>();
            Stack314 sStack = new Stack314(); sStack.addAll(caseIndex % 2 == 0 ? Arrays.asList(1, 4, 2, 3) : Arrays.asList(5, 4, 3, 2));
            Stack314 oStack = (Stack314) sStack.clone();
            Queue314 sQueue = new Queue314(); sQueue.addAll(caseIndex % 2 == 0 ? Arrays.asList(4, 3, 2, 1) : Arrays.asList(3, 3, 2, 1));
            Queue314 oQueue = new Queue314(); oQueue.addAll(sQueue);
            Position startPosition = new Position(0, 0), targetPosition = new Position(1, 2);
            Point point = new Point(0, 0);
            Airline startAirline = new Airline("A"), destinationAirline = new Airline("B");
            startAirline.destinations.add(destinationAirline);
            Rectangle[] rectangles = {new Rectangle(), new Rectangle(), new Rectangle()};
            Rectangle goalRectangle = rectangles[2];
            BitInputStream sBits = new BitInputStream(1, 0, 1, 1, 0, 0, 1, 0);
            BitInputStream oBits = new BitInputStream(1, 0, 1, 1, 0, 0, 1, 0);
            BitOutputStream sOutput = new BitOutputStream();
            BitOutputStream oOutput = new BitOutputStream();
            Color[] colors = {Color.RED, Color.GREEN, Color.BLUE};
            Board sBoardFixture = Board.fixture(caseIndex), oBoardFixture = Board.fixture(caseIndex);
            ConnectFourBoard sConnectFour = ConnectFourBoard.fixture(caseIndex), oConnectFour = ConnectFourBoard.fixture(caseIndex);
            BuildingMap sBuildingMap = BuildingMap.fixture(caseIndex), oBuildingMap = BuildingMap.fixture(caseIndex);
            String scannerText = " should not be here \n he should not be here \n now now have no fear \n";
            Scanner sScanner = new Scanner(scannerText);
            Scanner oScanner = new Scanner(scannerText);
            String target = caseIndex % 2 == 0 ? "A" : "B";
            int amount = caseIndex + 1;
            int start = caseIndex % 2;
            int stop = Math.max(start, Math.min(base.length, start + amount));
            Outcome studentOutcome = Outcome.capture(() -> StudentSolution.maxImprove(sArray));
            Outcome oracleOutcome = Outcome.capture(() -> OracleStudentSolution.maxImprove(oArray));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(normalize(sArray), normalize(oArray), "case " + caseIndex + " array state");
            checkEqual(normalize(sArray2), normalize(oArray2), "case " + caseIndex + " second array state");
            checkEqual(normalize(sBoolMatrix), normalize(oBoolMatrix), "case " + caseIndex + " boolean matrix state");
            checkEqual(normalize(sGrid), normalize(oGrid), "case " + caseIndex + " first string grid state");
            checkEqual(normalize(sGrid2), normalize(oGrid2), "case " + caseIndex + " second string grid state");
            checkEqual(sInts, oInts, "case " + caseIndex + " integer list state");
            checkEqual(sStrings, oStrings, "case " + caseIndex + " string list state");
            checkEqual(normalize(sMap), normalize(oMap), "case " + caseIndex + " map state");
            checkEqual(normalize(sMap2), normalize(oMap2), "case " + caseIndex + " second map state");
            checkEqual(sSet, oSet, "case " + caseIndex + " set state");
            checkEqual(sStack, oStack, "case " + caseIndex + " stack state");
            checkEqual(sQueue, oQueue, "case " + caseIndex + " queue state");
            checkEqual(sBits.toString(), oBits.toString(), "case " + caseIndex + " input state");
            checkEqual(sOutput, oOutput, "case " + caseIndex + " output state");
            checkEqual(Arrays.toString(sBoardFixture.marbles), Arrays.toString(oBoardFixture.marbles), "case " + caseIndex + " board state");
            checkEqual(Arrays.toString(sConnectFour.cells), Arrays.toString(oConnectFour.cells), "case " + caseIndex + " connect four state");
        }
    }

    public static void main(String[] args) {
        runCases();
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
