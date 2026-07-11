import java.util.*;

class NameRecord314 implements ExamSnapshot {
    static final int UNRANKED = 0;
    private String name;
    private ArrayList<Integer> ranks;
    private NameRecord314(String name, int... values) {
        this.name = name;
        ranks = new ArrayList<>();
        for (int value : values) ranks.add(value);
    }
    static NameRecord314 fixture(int caseIndex) {
        if (caseIndex % 3 == 0) return new NameRecord314("Ada", 0, 0, 12, 0, 0, 0);
        if (caseIndex % 3 == 1) return new NameRecord314("Bea", 50, 40, 30, 20, 10, 5);
        return new NameRecord314("Cy", 0, 0, 0, 0, 0, 0);
    }
    public int getRank(int decade) { return ranks.get(decade); }
    public String getName() { return name; }

// __STUDENT_CODE__

    public String examSnapshot() { return name + ranks; }
}