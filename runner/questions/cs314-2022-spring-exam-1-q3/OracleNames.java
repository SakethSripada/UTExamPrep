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

public ArrayList<String> getOneHitWonders(int requiredRank) {
    ArrayList<String> result = new ArrayList<>();
    for (int i = 0; i < records.size(); i++) {
        if (oneHitName(records.get(i), requiredRank)) {
            result.add(records.get(i).getName());
        }
    }
    return result;
}

private boolean oneHitName(NameRecord nameRecord, int requiredRank) {
    final int LIMIT = NUM_DECADES - 1;
    for (int i = 1; i < LIMIT; i++) {
        if (nameRecord.getRank(i - 1) == 0
                && nameRecord.getRank(i + 1) == 0) {
            int current = nameRecord.getRank(i);
            if (current != 0 && current < requiredRank) {
                return true;
            }
        }
    }
    return false;
}

    public String examSnapshot() { return records + "|" + data; }
}