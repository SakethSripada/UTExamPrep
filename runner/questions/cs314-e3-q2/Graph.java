import java.util.*;

class Queue314<E> {
    private LinkedList<E> values = new LinkedList<>();
    public void enqueue(E e) { values.addLast(e); }
    public void add(E e) { enqueue(e); }
    public boolean isEmpty() { return values.isEmpty(); }
    public E front() { return values.getFirst(); }
    public E dequeue() { return values.removeFirst(); }
}

class Graph {
    private Map<String, Vertex> verts = new LinkedHashMap<>();
    private Map<String, Vertex> vertices = verts;

    private void clearAll() {
        for (Vertex v : verts.values()) {
            v.scratch = 0;
        }
    }

// __STUDENT_CODE__

    private static class Vertex {
        private String name;
        private List<Edge> adjacent = new ArrayList<>();
        private int scratch;

        private Vertex(String name) { this.name = name; }

        public Edge removeEdge(Vertex dest) {
            Iterator<Edge> it = adjacent.iterator();
            while (it.hasNext()) {
                Edge edge = it.next();
                if (edge.dest == dest) {
                    it.remove();
                    return edge;
                }
            }
            return null;
        }
    }

    private static class Edge {
        private Vertex dest;
        private Edge(Vertex dest) { this.dest = dest; }
    }

    void addVertex(String name) {
        verts.put(name, new Vertex(name));
    }

    void addUndirectedEdge(String a, String b) {
        Vertex va = verts.get(a);
        Vertex vb = verts.get(b);
        va.adjacent.add(new Edge(vb));
        vb.adjacent.add(new Edge(va));
    }

    boolean hasEdge(String a, String b) {
        Vertex va = verts.get(a);
        Vertex vb = verts.get(b);
        for (Edge edge : va.adjacent) {
            if (edge.dest == vb) return true;
        }
        return false;
    }

    static Graph sample() {
        Graph graph = new Graph();
        for (String name : new String[]{"A", "B", "C", "D", "F", "G", "H"}) {
            graph.addVertex(name);
        }
        graph.addUndirectedEdge("A", "B");
        graph.addUndirectedEdge("A", "C");
        graph.addUndirectedEdge("B", "C");
        graph.addUndirectedEdge("B", "D");
        graph.addUndirectedEdge("C", "D");
        graph.addUndirectedEdge("D", "F");
        graph.addUndirectedEdge("F", "G");
        graph.addUndirectedEdge("F", "H");
        graph.addUndirectedEdge("H", "G");
        return graph;
    }
}
