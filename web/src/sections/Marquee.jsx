/**
 * Marquee divider — endless horizontal text loop.
 * Used as visual breath between major sections.
 */
export default function Marquee({ words = ['recuperação','escuta','evidência','tempo','cuidado'] }) {
  const seq = [...words, ...words]
  return (
    <div className="marquee">
      <div className="marquee__track">
        {seq.map((w, i) => (
          <span key={i} className={i % words.length === 0 ? 'accent' : ''}>
            <em style={{ fontStyle: 'italic' }}>{w}</em>
            <span style={{ marginLeft: '4rem', opacity: 0.4 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
