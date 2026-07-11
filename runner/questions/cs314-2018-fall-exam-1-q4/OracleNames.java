import java.util.*;

class OracleNames implements ExamSnapshot {
    static final int NUM_DECADES = 6;
    static final int MAX_RANK = 1000;
    private ArrayList<NameRecord> records;
    private NameCollection myRecs;
    private NameCollection nameRecords;
    private NameCollection names;
    private NameCollection namesList;
    private NameCollection nameRecordList;
    private Map<String, NameRecord> data;
    private int numDecades = NUM_DECADES;
    private int numDecade = NUM_DECADES;

    private OracleNames(List<NameRecord> source) {
        records = new ArrayList<>(source);
        myRecs = new NameCollection(source);
        nameRecords = myRecs;
        names = myRecs;
        namesList = myRecs;
        nameRecordList = myRecs;
        data = new LinkedHashMap<>();
        for (NameRecord record : records) data.put(record.getName(), record);
    }
    private NameRecord getRecord(String name) { return data.get(name); }
    static OracleNames fixture() {
        return new OracleNames(Arrays.asList(
            new NameRecord("Ada", 0, 0, 8, 12, 0, 0),
            new NameRecord("Bea", 50, 40, 30, 20, 10, 5),
            new NameRecord("Cy", 0, 0, 0, 0, 0, 0),
            new NameRecord("Dee", 9, 0, 0, 11, 0, 13),
            new NameRecord("Eli", 100, 80, 60, 40, 20, 0)
        ));
    }

public ArrayList<String> getSteadyNames(ArrayList<String> namesToCheck, int limit) {
    ArrayList<String> result = new ArrayList<>();
    for (String name : namesToCheck) {
        NameRecord record = myRecs.get(name);
        if (record != null) {
            boolean steady = true;
            int previous = fixRank(record.getRank(0));
            int decade = 1;
            while (steady && decade < numDecades) {
                int current = fixRank(record.getRank(decade));
                steady = Math.abs(current - previous) <= limit;
                previous = current;
                decade++;
            }
            if (steady) result.add(name);
        }
    }
    return result;
}

private static int fixRank(int rank) { return rank == 0 ? 1001 : rank; }

    public String examSnapshot() { return records + "|" + data; }
}