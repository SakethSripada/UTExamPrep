import java.util.*;
import java.io.*;

public class TestRunner {
    private static int passed = 0;
    private static int total = 0;

    private static void check(boolean condition, String name) {
        total++;
        if (condition) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            System.out.println("FAIL " + name);
        }
    }

    private static void checkEquals(Object actual, Object expected, String name) {
        check(Objects.equals(actual, expected), name + " expected=" + expected + " actual=" + actual);
    }

    private static void checkArray(int[] actual, int[] expected, String name) {
        check(Arrays.equals(actual, expected), name + " expected=" + Arrays.toString(expected) + " actual=" + Arrays.toString(actual));
    }

    public static void main(String[] args) {
        Map<String, ArrayList<String>> teams = new LinkedHashMap<>();
        teams.put("Texas", new ArrayList<>(Arrays.asList("A&M", "Pitt", "SMU", "TCU", "Stanford", "Baylor")));
        teams.put("A&M", new ArrayList<>(Arrays.asList("Texas", "SMU", "Florida", "Alabama", "Arkansas")));
        teams.put("SMU", new ArrayList<>(Arrays.asList("Texas", "A&M", "TCU", "UNT", "Texas Tech", "Colorado")));
        teams.put("UNT", new ArrayList<>(Arrays.asList("A&M", "SMU", "Sam Houston", "TCU", "TxSt")));
        Set<String> ranked = new HashSet<>(Arrays.asList("Pitt", "Stanford", "Baylor", "Florida", "Texas", "Colorado"));
        checkEquals(StudentSolution.playedMostRanked(teams, ranked), "Texas", "unique best team");
        Map<String, ArrayList<String>> tied = new LinkedHashMap<>();
        tied.put("One", new ArrayList<>(Arrays.asList("R1", "X", "R2")));
        tied.put("Two", new ArrayList<>(Arrays.asList("R3", "R4")));
        Set<String> ranked2 = new HashSet<>(Arrays.asList("R1", "R2", "R3", "R4"));
        String answer = StudentSolution.playedMostRanked(tied, ranked2);
        check(answer.equals("One") || answer.equals("Two"), "tie may return either team");
        checkEquals(teams.get("Texas").toString(), "[A&M, Pitt, SMU, TCU, Stanford, Baylor]", "input map unaltered");
        System.out.println("RESULT " + passed + "/" + total);
        if (passed != total) System.exit(1);
    }
}
