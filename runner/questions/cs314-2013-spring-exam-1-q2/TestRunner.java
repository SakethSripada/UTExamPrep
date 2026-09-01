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
        String[][] fixtures = {
            {}, {"A"}, {"A", "B"}, {"A", "B", "A", "C", "B"},
            {"B", "A", "A", "A", "C"}, {"A", "A", "A", "A"}, {"B", "C", "A", "A"}
        };
        int caseIndex = 0;
        for (String[] fixture : fixtures) {
            String[] otherFixture = new String[fixture.length]; for (int oi = 0; oi < fixture.length; oi++) otherFixture[oi] = (oi + caseIndex) % 2 == 0 ? "Z" : fixture[oi];
            GenericList<String> student = GenericList.of(fixture);
            OracleGenericList<String> oracle = OracleGenericList.of(fixture);
            GenericList<String> studentOther = GenericList.of(otherFixture);
            OracleGenericList<String> oracleOther = OracleGenericList.of(otherFixture);
            GenericList<String> sOther = studentOther;
            OracleGenericList<String> oOther = oracleOther;
            
            int length = fixture.length;
            String target = caseIndex % 2 == 0 ? "A" : "Z";
            int start = length == 0 ? 0 : Math.min(1, length - 1);
            int stop = Math.max(start, length);
            int index = length == 0 ? 0 : length - 1;
            int amount = length == 0 ? 1 : Math.max(1, Math.min(2, length));
            int[] intArrayArg = {1, 2, 1, 3, 2};
            int[][] matrixArg = {{1, 0}, {0, 2}};
            ArrayList<Integer> vectorArg = new ArrayList<>();
            for (int vectorIndex = 0; vectorIndex < (fixture.length == 0 ? 0 : fixture.length); vectorIndex++) {
                vectorArg.add(vectorIndex + 2);
            }
            Outcome studentOutcome = Outcome.capture(() -> student.sublist(start));
            Outcome oracleOutcome = Outcome.capture(() -> oracle.sublist(start));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " receiver state");
            
            caseIndex++;
        }
    }

    public static void main(String[] args) {
        runCases();
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
