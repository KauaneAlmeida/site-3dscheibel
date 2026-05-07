const LABELS = [
  '01 — Awakening',
  '02 — Activation',
  '03 — Data Space',
  '04 — Convergence',
  '05 — Interface',
  '06 — System',
  '07 — Network',
  '08 — Origin',
]

export default function SectionNav({ active }) {
  return (
    <nav className="section-nav">
      {LABELS.map((l, i) => (
        <div key={l} className={`section-nav__item ${i === active ? 'active' : ''}`}>
          <span className="section-nav__bar" />
          <span>{l}</span>
        </div>
      ))}
    </nav>
  )
}
