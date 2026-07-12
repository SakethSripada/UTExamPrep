import java.util.*;

interface ExamSnapshot { String examSnapshot(); }

public class TestRunner {
    private static int passed;
    private static int total;

    private interface CheckedCall { Object run() throws Throwable; }

    private static final class Outcome {
        private final Object value;
        private final String error;

        private Outcome(Object value, String error) {
            this.value = value;
            this.error = error;
        }

        static Outcome capture(CheckedCall call) {
            try {
                return new Outcome(call.run(), null);
            } catch (Throwable error) {
                return new Outcome(null, error.getClass().getName());
            }
        }

        public boolean equals(Object other) {
            if (!(other instanceof Outcome)) return false;
            Outcome rhs = (Outcome) other;
            return Objects.equals(value, rhs.value) && Objects.equals(error, rhs.error);
        }

        public String toString() {
            return error == null ? String.valueOf(value) : "throws " + error;
        }
    }

    private static final class AirlineGraph {
        private final LinkedHashMap<String, Airline> airlines = new LinkedHashMap<>();

        Airline add(String name) {
            Airline airline = new Airline(name);
            airlines.put(name, airline);
            return airline;
        }

        Airline get(String name) {
            return airlines.get(name);
        }

        void link(String origin, String destination) {
            get(origin).destinations.add(get(destination));
        }

        String snapshot() {
            StringBuilder result = new StringBuilder();
            for (Map.Entry<String, Airline> entry : airlines.entrySet()) {
                result.append(entry.getKey()).append("->");
                for (Airline destination : entry.getValue().destinations) {
                    result.append(destination.name).append(',');
                }
                result.append(';');
            }
            return result.toString();
        }
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

    private static AirlineGraph graphFor(int scenario) {
        AirlineGraph graph = new AirlineGraph();
        graph.add("A");
        graph.add("B");
        graph.add("C");
        graph.add("D");
        if (scenario == 0) { // A -> B
            graph.link("A", "B");
        } else if (scenario == 1) { // A -> B -> C
            graph.link("A", "B");
            graph.link("B", "C");
        } else if (scenario == 2) { // A -> B, C is unreachable
            graph.link("A", "B");
        } else if (scenario == 3) { // A <-> B, C is unreachable
            graph.link("A", "B");
            graph.link("B", "A");
        } else if (scenario == 4) { // A's first branch is a dead end; second reaches D
            graph.link("A", "B");
            graph.link("A", "C");
            graph.link("C", "D");
        } else if (scenario == 5) { // Same-origin success, regardless of partners
            graph.link("A", "B");
        }
        return graph;
    }

    private static void runCase(String name, int scenario, String origin, String destination) {
        AirlineGraph studentGraph = graphFor(scenario);
        AirlineGraph oracleGraph = graphFor(scenario);
        String before = studentGraph.snapshot();
        StudentSolution student = new StudentSolution();
        OracleStudentSolution oracle = new OracleStudentSolution();

        Outcome actual = Outcome.capture(
            () -> student.examCall(studentGraph.get(origin), studentGraph.get(destination), new LinkedHashSet<Airline>())
        );
        Outcome expected = Outcome.capture(
            () -> oracle.examCall(oracleGraph.get(origin), oracleGraph.get(destination), new LinkedHashSet<Airline>())
        );
        checkEqual(actual, expected, name + " return");
        checkEqual(studentGraph.snapshot(), before, name + " preserves partner graph");
    }

    private static void runCases() {
        runCase("direct path", 0, "A", "B");
        runCase("multi-hop path", 1, "A", "C");
        runCase("unreachable destination", 2, "A", "C");
        runCase("cycle without destination", 3, "A", "C");
        runCase("branch after dead end", 4, "A", "D");
        runCase("same origin and destination", 5, "A", "A");
    }

    public static void main(String[] args) {
        runCases();
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
