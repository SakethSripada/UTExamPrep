// Point is provided to the student as a top-level type so their
// minDistance(Point[]) signature compiles. The original Next.js harness
// nested this inside TestRunner, where StudentSolution could not see it; the
// runner fixes that here. Method surface (getX, getY, distance, length) is
// unchanged from the exam prompt.
class Point {
    private int x;
    private int y;
    Point(int x, int y) { this.x = x; this.y = y; }
    int getX() { return x; }
    int getY() { return y; }
    double distance(Point p2) {
        int dx = x - p2.x;
        int dy = y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
