import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const SCREENS = [
  { id: '01', title: 'Triage', body: 'Live patient ingestion, ranked by signal urgency.', tag: 'OPS' },
  { id: '02', title: 'Diagnosis', body: 'Differential diagnosis with confidence intervals and source citations.', tag: 'AI' },
  { id: '03', title: 'Protocol', body: 'Adaptive treatment paths cross-checked against current standards of care.', tag: 'CARE' },
]

export default function SectionInterface() {
  const root = useRef()
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.iface-screen').forEach((s, i) => {
        gsap.from(s, {
          scrollTrigger: { trigger: s, start: 'top 80%', end: 'top 25%', scrub: 0.6 },
          y: 80, opacity: 0, rotateX: 6, ease: 'power2.out'
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section--tall" data-section="interface">
      <div style={{ maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <span className="eyebrow">05 — Interface</span>
        <h2 className="headline">
          The product, <em>quietly.</em>
        </h2>
        <p className="body-large">
          Three views — a single line of reasoning. Each surface is composed only of the signal you need, when you need it.
        </p>
      </div>
      <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.4rem', perspective: '1200px' }}>
        {SCREENS.map((s) => (
          <div key={s.id} className="iface-screen panel">
            <span className="panel__label">{s.tag} · {s.id}</span>
            <span className="panel__value">{s.title}</span>
            <p style={{ marginTop: '0.8rem', color: 'var(--text-soft)', fontFamily: 'var(--font-body)', fontSize: '0.92rem', lineHeight: 1.5 }}>
              {s.body}
            </p>
            <div style={{ marginTop: '1.4rem', display: 'flex', gap: '0.6rem', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'var(--text-mute)' }}>
              <span className="status-dot" style={{ width: 4, height: 4 }} />
              <span>STATUS — LIVE</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
