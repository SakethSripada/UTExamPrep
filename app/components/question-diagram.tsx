import { memo } from "react";
import Image from "next/image";
import type { GraphDiagram, LinkedListDiagram, QuestionDiagram, TreeDiagram } from "@/app/lib/exam-types";

function TreeVisual({ diagram }: { diagram: TreeDiagram }) {
  const byId = new Map(diagram.nodes.map((node) => [node.id, node]));
  const positions = new Map<string, { x: number; y: number }>();
  let nextColumn = 0;

  const place = (id: string, depth: number): number => {
    const node = byId.get(id);
    if (!node) return nextColumn++;
    const left = node.left ? place(node.left, depth + 1) : null;
    const own = nextColumn++;
    const right = node.right ? place(node.right, depth + 1) : null;
    const column = left === null && right === null ? own : ((left ?? own) + (right ?? own)) / 2;
    positions.set(id, { x: column, y: depth });
    return column;
  };

  place(diagram.root, 0);
  const maxColumn = Math.max(0, ...[...positions.values()].map((position) => position.x));
  const maxDepth = Math.max(0, ...[...positions.values()].map((position) => position.y));
  const width = Math.max(320, (maxColumn + 1) * 78 + 48);
  const height = Math.max(132, (maxDepth + 1) * 78 + 48);
  const point = (id: string) => {
    const position = positions.get(id);
    return position ? { x: 40 + position.x * 78, y: 32 + position.y * 78 } : null;
  };

  return (
    <svg aria-label={diagram.description ?? diagram.title ?? "Tree diagram"} className="tree-diagram" role="img" viewBox={`0 0 ${width} ${height}`}>
      {diagram.nodes.flatMap((node) =>
        [node.left, node.right].flatMap((child) => {
          if (!child) return [];
          const from = point(node.id);
          const to = point(child);
          if (!from || !to) return [];
          return [
            <line className="tree-edge" key={`${node.id}-${child}`} x1={from.x} x2={to.x} y1={from.y + 17} y2={to.y - 17} />,
          ];
        }),
      )}
      {diagram.nodes.map((node) => {
        const position = point(node.id);
        if (!position) return null;
        return (
          <g className={`tree-node ${node.tone ?? "neutral"}`} key={node.id} transform={`translate(${position.x} ${position.y})`}>
            <circle r="18" />
            <text dy="0.34em">{node.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LinkedListVisual({ diagram }: { diagram: LinkedListDiagram }) {
  const cellWidth = 70;
  const width = Math.max(310, diagram.values.length * (cellWidth + 18) + 52);
  return (
    <svg aria-label={diagram.description ?? diagram.title ?? "Linked-list diagram"} className="linked-list-diagram" role="img" viewBox={`0 0 ${width} 102`}>
      <text className="list-head-label" x="14" y="52">first</text>
      <path className="list-arrow" d="M 44 48 H 70" />
      {diagram.values.map((value, index) => {
        const x = 70 + index * (cellWidth + 18);
        const nextX = x + cellWidth + 18;
        return (
          <g key={`${value}-${index}`}>
            <rect className="list-cell" height="38" rx="4" width={cellWidth} x={x} y="29" />
            <line className="list-divider" x1={x + 47} x2={x + 47} y1="29" y2="67" />
            <text className="list-value" x={x + 23} y="53">{value}</text>
            <path className="list-arrow" d={`M ${x + 52} 48 H ${nextX}`} />
          </g>
        );
      })}
      <text className="list-null" x={70 + diagram.values.length * (cellWidth + 18)} y="53">{diagram.nullLabel ?? "null"}</text>
    </svg>
  );
}

function GraphVisual({ diagram }: { diagram: GraphDiagram }) {
  const byId = new Map(diagram.nodes.map((node) => [node.id, node]));
  return (
    <svg
      aria-label={diagram.description ?? diagram.title ?? "Graph diagram"}
      className="graph-diagram"
      role="img"
      viewBox="0 0 720 420"
    >
      {diagram.directed ? (
        <defs>
          <marker id="graph-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="10" refY="4">
            <path d="M0,0 L0,8 L10,4 z" />
          </marker>
        </defs>
      ) : null}
      {diagram.edges.map((edge, index) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const inset = 27;
        const startX = from.x + (dx / distance) * inset;
        const startY = from.y + (dy / distance) * inset;
        const endX = to.x - (dx / distance) * inset;
        const endY = to.y - (dy / distance) * inset;
        const reciprocal = diagram.edges.some((candidate) => candidate.from === edge.to && candidate.to === edge.from);
        const curve = reciprocal ? 28 : 0;
        const controlX = (startX + endX) / 2 - (dy / distance) * curve;
        const controlY = (startY + endY) / 2 + (dx / distance) * curve;
        return (
          <path
            className="graph-edge"
            d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
            key={`${edge.from}-${edge.to}-${index}`}
            markerEnd={diagram.directed ? "url(#graph-arrow)" : undefined}
          />
        );
      })}
      {diagram.nodes.map((node) => (
        <g className="graph-node" key={node.id} transform={`translate(${node.x} ${node.y})`}>
          <circle r="24" />
          <text dy="0.35em">{node.label}</text>
        </g>
      ))}
    </svg>
  );
}

function QuestionDiagramVisualImpl({ diagram }: { diagram: QuestionDiagram }) {
  return (
    <figure className="question-diagram">
      {diagram.title ? <figcaption>{diagram.title}</figcaption> : null}
      {diagram.kind === "tree" ? <TreeVisual diagram={diagram} /> : null}
      {diagram.kind === "linked-list" ? <LinkedListVisual diagram={diagram} /> : null}
      {diagram.kind === "graph" ? <GraphVisual diagram={diagram} /> : null}
      {diagram.kind === "source" ? (
        <Image
          className="source-diagram"
          src={diagram.src}
          alt={diagram.alt}
          width={diagram.width}
          height={diagram.height}
          sizes="(max-width: 900px) 100vw, 860px"
        />
      ) : null}
      {diagram.description ? <p>{diagram.description}</p> : null}
    </figure>
  );
}

// Diagrams are laid out from scratch on every render; the diagram objects come
// straight from the static exam data, so memoizing keeps typing cheap.
export const QuestionDiagramVisual = memo(QuestionDiagramVisualImpl);
