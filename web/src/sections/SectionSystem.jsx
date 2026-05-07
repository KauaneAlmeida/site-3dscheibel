import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const ROWS = [
  ['SIGNAL', 'Patient vitals, history, voice — multimodal in.'],
  ['REASONING', 'Constrained reasoning across an evidence graph.'],
  ['EVIDENCE', 'Every claim backs to a source with provenance.'],
  ['ACTION', 'A protocol, a referral, or simply: better attention.'],
]

export default function SectionSystem() {
  const root = useRef()
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.sys-row').forEach((row) => {
        gsap.from(row, {
          scrollTrigger: { trigger: row, start: 'top 85%', end: 'top 30%', scrub: 0.5 },
          x: -60, opacity: 0, ease: 'power2.out'
        })
      })
      gsap.fromTo('.sys-line', { scaleX: 0 }, {
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'top 20%', scrub: 0.5 },
        scaleX: 1, transformOrigin: 'left', stagger: 0.08
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section" data-section="system">
      <div style={{ maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <span className="eyebrow">06 — System view</span>
        <h2 className="headline">
          A loop, <em>not a black box.</em>
        </h2>
      </div>
      <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column' }}>
        {ROWS.map((r, i) => (
          <div key={r[0]} className="sys-row" style={{ display: 'grid', gridTemplateColumns: '160px 1fr 64px', alignItems: 'baseline', padding: '1.6rem 0', borderTop: '1px solid rgba(124,255,177,0.08)' }}>
            <span className="label" style={{ color: 'var(--text-accent)' }}>{r[0]}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.6vw, 2.4rem)', fontStyle: 'italic', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{r[1]}</span>
            <span className="label" style={{ textAlign: 'right' }}>0{i + 1}</span>
            <div className="sys-line" style={{ gridColumn: '1 / -1', height: 1, background: 'var(--text-accent)', opacity: 0.35, marginTop: '1.4rem' }} />
          </div>
        ))}
      </div>
    </section>
  )
}
