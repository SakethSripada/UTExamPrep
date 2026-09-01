import java.util.*;

class OracleNameRecord314 implements ExamSnapshot {
    static final int UNRANKED = 0;
    private String name;
    private ArrayList<Integer> ranks;
    private OracleNameRecord314(String name, int... values) {
        this.name = name;
        ranks = new ArrayList<>();
        for (int value : values) ranks.add(value);
    }
    static OracleNameRecord314 fixture(int caseIndex) {
        if (caseIndex % 3 == 0) return new OracleNameRecord314("Ada", 0, 0, 12, 0, 0, 0);
        if (caseIndex % 3 == 1) return new OracleNameRecord314("Bea", 50, 40, 30, 20, 10, 5);
        return new OracleNameRecord314("Cy", 0, 0, 0, 0, 0, 0);
    }
    public int getRank(int decade) { return ranks.get(decade); }
    public String getName() { return name; }

public boolean isTrendy(int cutoff) {
    boolean result = ranks.get(0) == UNRANKED;
    if (result) {
        int index = 1;
        while (index < ranks.size() && ranks.get(index) == UNRANKED) index++;
        if (index < ranks.size()) result = ranks.get(index) <= cutoff;
    }
    return result;
}

    public String examSnapshot() { return name + ranks; }
}