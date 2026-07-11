import java.util.*;

class OracleGraph implements ExamSnapshot {
    private static class Edge {
        private Vertex dest; private Vertex destination; private int cost; private int weight;
        Edge(Vertex dest, int cost) { this.dest = dest; destination = dest; this.cost = cost; weight = cost; }
        public String toString() { return dest.name + ":" + cost; }
    }
    private static class Vertex {
        private String name; private String label;
        private ArrayList<Edge> adjacent = new ArrayList<>();
        private ArrayList<Edge> edges = adjacent;
        private int scratch; private int indegree; private boolean visited;
        private Vertex prev;
        Vertex(String name) { this.name = name; label = name; }
        public boolean equals(Object other) { return other instanceof Vertex && name.equals(((Vertex) other).name); }
        public int hashCode() { return name.hashCode(); }
        public String toString() { return name; }
    }
    private LinkedHashMap<String, Vertex> vertices = new LinkedHashMap<>();
    private Map<String, Vertex> verts = vertices;
    private Map<String, Vertex> graph = vertices;
    private boolean[][] adjMat;
    private static final double INFINITY = Double.POSITIVE_INFINITY;

    private OracleGraph() { }
    static OracleGraph fixture() {
        OracleGraph result = new OracleGraph();
        for (String name : new String[]{"A", "B", "C", "D", "E"}) result.vertices.put(name, new Vertex(name));
        result.addEdge("A", "B", 2); result.addEdge("A", "C", 5);
        result.addEdge("B", "C", 1); result.addEdge("C", "A", 4); result.addEdge("C", "D", 3);
        result.addEdge("D", "E", 2); result.addEdge("E", "A", 1);
        result.adjMat = new boolean[][]{
            {false,true,true,false,false}, {false,false,true,false,false},
            {true,false,false,true,false}, {false,false,false,false,false}, {false,false,false,false,false}
        };
        return result;
    }
    private void addEdge(String from, String to, int cost) {
        vertices.get(from).adjacent.add(new Edge(vertices.get(to), cost));
        vertices.get(to).indegree++;
    }
    private boolean containsVertex(String name) { return vertices.containsKey(name); }
    private Vertex getVertex(String name) { return vertices.get(name); }
    private void clearAll() { for (Vertex vertex : vertices.values()) { vertex.scratch = 0; vertex.visited = false; } }
    
    private void updateIndegree() {
        for (Vertex vertex : vertices.values()) vertex.scratch = 0;
        for (Vertex vertex : vertices.values()) for (Edge edge : vertex.adjacent) edge.dest.scratch++;
    }
    private void addConnectedVertices(Set<Vertex> found, Vertex current) {
        if (!found.add(current)) return;
        for (Edge edge : current.adjacent) addConnectedVertices(found, edge.dest);
        for (Vertex vertex : vertices.values())
            for (Edge edge : vertex.adjacent) if (edge.dest == current) addConnectedVertices(found, vertex);
    }

private double help(Vertex cur, String dest, double minEdgeSoFar) {
      if (cur.name.equals(dest)) {
             return minEdgeSoFar;
      } else if (cur.scratch == 1) {
             return INFINITY;
      } else {
             cur.scratch = 1;
             // min edge for path through this node
             double myMaxMin = 0;
             for (Edge e : cur.adjacent) {
                 double temp = minEdgeSoFar;
                 if (e.cost < minEdgeSoFar) {
                        temp = e.cost;
                 }
                 double minThisPath = help(e.dest, dest, temp);
                 if (minThisPath != INFINITY && minThisPath > myMaxMin) {
                        myMaxMin = minThisPath;
                 }
             }
             // undo so we can try other paths through this vertex
             cur.scratch = 0;
             return myMaxMin == 0 ? INFINITY : myMaxMin;
      }
}

    public Object examCall(int caseIndex) {
        OracleGraph other = OracleGraph.fixture();
        Set<String> required = new LinkedHashSet<>(caseIndex % 2 == 0 ? Arrays.asList("A", "C") : Arrays.asList("A", "E"));
        Set<Vertex> visited = new LinkedHashSet<>();
        Map<String, Integer> indegree = new LinkedHashMap<>();
        for (String name : vertices.keySet()) indegree.put(name, 0);
        ArrayList<Vertex> path = new ArrayList<>();
        ArrayList<String> namesPath = new ArrayList<>();
        int[] visitedCount = {0};
        Object result = help(vertices.get("A"), "C", Double.POSITIVE_INFINITY);
        return Arrays.asList(result, required, visited, indegree, path, namesPath, Arrays.toString(visitedCount), other.examSnapshot());
    }
    public String examSnapshot() {
        ArrayList<String> result = new ArrayList<>();
        for (Vertex vertex : vertices.values())
            result.add(vertex.name + "(" + vertex.scratch + "," + vertex.indegree + "," + vertex.visited + ")->" + vertex.adjacent);
        return result.toString();
    }
}