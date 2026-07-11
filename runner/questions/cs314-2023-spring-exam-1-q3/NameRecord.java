import java.util.*;

class NameRecord implements Comparable<NameRecord> {
    static final int UNRANKED = 0;
    private final String name;
    private final ArrayList<Integer> ranks;
    NameRecord(String name, int... values) {
        this.name = name;
        this.ranks = new ArrayList<>();
        for (int value : values) ranks.add(value);
    }
    NameRecord(String line) {
        String[] pieces = line.trim().split("\s+");
        name = pieces[0];
        ranks = new ArrayList<>();
        for (int i = 1; i < pieces.length; i++) ranks.add(Integer.parseInt(pieces[i]));
    }
    String getName() { return name; }
    int getRank(int decade) { return ranks.get(decade); }
    int numDecades() { return ranks.size(); }
    int numDecadesRanked() { return ranks.size(); }
    int get(int decade) { return getRank(decade); }
    void addRank(int rank) { ranks.add(rank); }
    boolean alwaysPresent() {
        for (int rank : ranks) if (rank == UNRANKED) return false;
        return true;
    }
    boolean anyRanksGreater(int cutoff) {
        for (int rank : ranks) if (rank > cutoff) return true;
        return false;
    }
    int getBestRank() {
        int best = Integer.MAX_VALUE;
        for (int rank : ranks) if (rank != UNRANKED && rank < best) best = rank;
        return best == Integer.MAX_VALUE ? UNRANKED : best;
    }
    public int compareTo(NameRecord other) { return name.compareTo(other.name); }
    public boolean equals(Object other) {
        if (!(other instanceof NameRecord)) return false;
        NameRecord rhs = (NameRecord) other;
        return name.equals(rhs.name) && ranks.equals(rhs.ranks);
    }
    public int hashCode() { return Objects.hash(name, ranks); }
    public String toString() { return name + ranks; }
}

class NameCollection extends ArrayList<NameRecord> {
    NameCollection(Collection<NameRecord> source) { super(source); }
    NameRecord get(String name) {
        for (NameRecord record : this) if (record.getName().equals(name)) return record;
        return null;
    }
}