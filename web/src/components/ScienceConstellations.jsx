/**
 * Background constellation lines for SectionScience — recreates the Pioneer
 * "FIRST, A SOLID FOUNDATION" star-map atmosphere with thin connecting lines
 * and node dots scattered around the DNA.
 *
 * Pure SVG, no PNG. Lives behind the DNA canvas (z-index lower).
 */

const NODES = [
  // Bottom-left cluster
  { x: 8,  y: 86, c: 'g' },
  { x: 16, y: 80, c: 'd' },
  { x: 22, y: 90, c: 'g' },
  { x: 12, y: 72, c: 'd' },
  // Bottom-center
  { x: 32, y: 92, c: 'd' },
  { x: 40, y: 84, c: 'g' },
  { x: 48, y: 90, c: 'r' },
  { x: 56, y: 86, c: 'd' },
  // Bottom-right
  { x: 70, y: 88, c: 'd' },
  { x: 80, y: 82, c: 'g' },
  { x: 88, y: 90, c: 'd' },
  { x: 94, y: 78, c: 'y' },
  // Right-mid
  { x: 90, y: 60, c: 'd' },
  { x: 96, y: 50, c: 'g' },
  { x: 84, y: 48, c: 'd' },
  // Right-top
  { x: 88, y: 28, c: 'd' },
  { x: 94, y: 18, c: 'g' },
  { x: 78, y: 22, c: 'd' },
  // Top-left
  { x: 6,  y: 22, c: 'd' },
  { x: 14, y: 14, c: 'g' },
  { x: 24, y: 18, c: 'd' },
  // Left-mid
  { x: 4,  y: 50, c: 'd' },
  { x: 10, y: 58, c: 'g' },
  { x: 18, y: 52, c: 'd' },
  // Far drift
  { x: 32, y: 40, c: 'd' },
  { x: 64, y: 36, c: 'd' },
  // Right-center constellation — fills the dead space on the right side
  // of the DNA panel, mid-height. Indices 26..32.
  { x: 70, y: 50, c: 'd' },     // 26 — anchor
  { x: 78, y: 42, c: 'g' },     // 27 — green firefly top-left
  { x: 82, y: 58, c: 'd' },     // 28 — bottom-right
  { x: 74, y: 64, c: 'y' },     // 29 — yellow firefly bottom-left
  { x: 88, y: 66, c: 'd' },     // 30 — far-right anchor
  { x: 66, y: 60, c: 'd' },     // 31 — left of the cluster
  { x: 76, y: 30, c: 'd' },     // 32 — connects up to right-top group
]

// Edges (indices into NODES) — sparse triangulations forming small constellations
const EDGES = [
  [0,1],[1,2],[2,0],[1,3],[3,0],
  [4,5],[5,6],[6,7],[5,7],
  [8,9],[9,10],[10,11],[8,10],
  [12,13],[13,14],[14,12],
  [15,16],[16,17],[15,17],
  [18,19],[19,20],[18,20],
  [21,22],[22,23],
  [24,25],
  [3,18],[7,8],[11,12],[14,15],[20,24],
  // Right-center constellation lines.
  [26,27],[27,28],[28,26],         // inner triangle
  [28,29],[29,26],                 // tail to bottom-left
  [28,30],[27,30],                 // far-right anchor
  [26,31],[31,29],                 // arm reaching left
  [27,32],[32,15],                 // upward connection to right-top group
]

const COLOR = {
  d: '#7a5c3e',   // dust gold (default)
  g: '#7ad27a',   // green firefly
  y: '#f0d048',   // yellow firefly
  r: '#c84830',   // red ember
}

export default function ScienceConstellations() {
  return (
    <div className="science-constellations" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="science-constellations__svg">
        {/* Lines first so dots render on top */}
        {EDGES.map(([a, b], i) => {
          const A = NODES[a], B = NODES[b]
          return (
            <line
              key={`e-${i}`}
              x1={A.x} y1={A.y}
              x2={B.x} y2={B.y}
              stroke="rgba(138, 90, 60, 0.35)"
              strokeWidth="0.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        {NODES.map((n, i) => (
          <circle
            key={`n-${i}`}
            cx={n.x} cy={n.y}
            r={n.c === 'd' ? 0.3 : 0.55}
            fill={COLOR[n.c]}
            opacity={n.c === 'd' ? 0.55 : 0.85}
          />
        ))}
      </svg>
    </div>
  )
}
