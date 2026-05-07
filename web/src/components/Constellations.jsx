/**
 * Subtle constellation lines orbiting the entity — small triangulated
 * clusters in negative space around the figure. NO dots, just thin lines.
 */

// Cluster 1 — top right (around the raised arm tip)
const C1 = [
  { x: 86, y: 12 },
  { x: 92, y: 18 },
  { x: 88, y: 24 },
  { x: 82, y: 18 },
  { x: 95, y: 8 },
]
const C1_E = [[0,1],[1,2],[2,3],[3,0],[0,4],[4,1]]

// Cluster 2 — middle right (above the body)
const C2 = [
  { x: 78, y: 38 },
  { x: 86, y: 42 },
  { x: 90, y: 50 },
  { x: 82, y: 48 },
]
const C2_E = [[0,1],[1,2],[2,3],[3,0],[1,3]]

// Cluster 3 — lower right (below hand area)
const C3 = [
  { x: 70, y: 78 },
  { x: 78, y: 82 },
  { x: 84, y: 78 },
  { x: 76, y: 88 },
  { x: 88, y: 86 },
]
const C3_E = [[0,1],[1,2],[1,3],[3,4],[2,4]]

// Cluster 4 — bottom-center (under hand with crystal)
const C4 = [
  { x: 38, y: 90 },
  { x: 48, y: 86 },
  { x: 56, y: 92 },
  { x: 44, y: 95 },
]
const C4_E = [[0,1],[1,2],[2,3],[3,0],[0,2]]

// Cluster 5 — far right edge
const C5 = [
  { x: 96, y: 55 },
  { x: 92, y: 65 },
  { x: 98, y: 70 },
]
const C5_E = [[0,1],[1,2],[2,0]]

const CLUSTERS = [
  { nodes: C1, edges: C1_E },
  { nodes: C2, edges: C2_E },
  { nodes: C3, edges: C3_E },
  { nodes: C4, edges: C4_E },
  { nodes: C5, edges: C5_E },
]

export default function Constellations() {
  return (
    <div className="constellations" aria-hidden>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="constellations__svg"
      >
        {CLUSTERS.map((c, ci) => (
          <g key={ci}>
            {c.edges.map(([a, b], i) => {
              const A = c.nodes[a], B = c.nodes[b]
              return (
                <line
                  key={i}
                  x1={A.x} y1={A.y}
                  x2={B.x} y2={B.y}
                  stroke="rgba(138, 90, 60, 0.5)"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </g>
        ))}
      </svg>
    </div>
  )
}
