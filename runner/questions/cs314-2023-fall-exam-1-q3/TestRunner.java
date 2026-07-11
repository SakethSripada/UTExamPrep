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
            Names student = Names.fixture();
            OracleNames oracle = OracleNames.fixture();
            NameRecord recordArg = new NameRecord("Arg", 0, 4, 0, 8, 0, 12);
            ArrayList<String> namesArg = new ArrayList<>(Arrays.asList("Ada", "Bea", "Missing"));
            Map<String, Integer> newRanks = new LinkedHashMap<>();
            newRanks.put("Ada", 7); newRanks.put("Fox", 22);
            int amount = caseIndex + 1;
            Outcome studentOutcome = Outcome.capture(() -> student.getRareish(amount, amount));
            Outcome oracleOutcome = Outcome.capture(() -> oracle.getRareish(amount, amount));
            checkEqual(studentOutcome, oracleOutcome, "case " + caseIndex + " return");
            checkEqual(student.examSnapshot(), oracle.examSnapshot(), "case " + caseIndex + " receiver state");
        }
    }

    public static void main(String[] args) {
        runCases();
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
