import java.util.*;

class Graph implements ExamSnapshot {
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

    private Graph() { }
    static Graph fixture() { return fixtureForCase(0); }

    private static Graph fixtureForCase(int caseIndex) {
        Graph result = new Graph();
        String[] names = caseIndex == 3 ? new String[]{"A", "B", "C"}
            : caseIndex == 4 ? new String[]{"A", "B", "C", "D", "E"}
            : caseIndex == 5 ? new String[]{"A", "B", "C"}
            : caseIndex == 0 ? new String[]{"A", "B", "C"}
            : new String[]{"A", "B", "C", "D"};
        for (String name : names) result.vertices.put(name, new Vertex(name));

        if (caseIndex == 0) { // Simple Hamiltonian chain.
            result.addEdge("A", "B", 1); result.addEdge("B", "C", 1);
        } else if (caseIndex == 1) { // The first A branch is a dead end; backtracking is required.
            result.addEdge("A", "B", 1); result.addEdge("A", "C", 1);
            result.addEdge("B", "D", 1); result.addEdge("C", "B", 1);
        } else if (caseIndex == 2) { // No Hamiltonian path from A.
            result.addEdge("A", "B", 1); result.addEdge("A", "C", 1);
            result.addEdge("B", "D", 1); result.addEdge("C", "D", 1);
        } else if (caseIndex == 3) { // Cycle must not cause infinite recursion.
            result.addEdge("A", "B", 1); result.addEdge("B", "C", 1); result.addEdge("C", "A", 1);
        } else if (caseIndex == 4) { // Skip a revisited edge and continue along the path.
            result.addEdge("A", "B", 1); result.addEdge("B", "C", 1); result.addEdge("C", "B", 1);
            result.addEdge("C", "D", 1); result.addEdge("D", "E", 1);
        } else { // A failed call must fully undo scratch marks before a retry.
            result.addEdge("A", "B", 1); result.addEdge("A", "C", 1);
        }
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

// __STUDENT_CODE__

    public Object examCall(int caseIndex) {
        Graph tree = fixtureForCase(caseIndex);
        Object result = tree.helper("A", 0);
        if (caseIndex == 5) {
            Object retry = tree.helper("A", 0);
            return Arrays.asList(result, retry, tree.examSnapshot());
        }
        return Arrays.asList(result, tree.examSnapshot());
    }
    public String examSnapshot() {
        ArrayList<String> result = new ArrayList<>();
        for (Vertex vertex : vertices.values())
            result.add(vertex.name + "(" + vertex.scratch + "," + vertex.indegree + "," + vertex.visited + ")->" + vertex.adjacent);
        return result.toString();
    }
}
