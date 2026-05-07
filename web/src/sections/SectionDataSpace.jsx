import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const PHRASES = [
  ['data','blooms'],
  ['into','behaviour.'],
  ['behaviour','into'],
  ['judgement.','—'],
]

export default function SectionDataSpace() {
  const root = useRef()
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.ds-row').forEach((row, i) => {
        gsap.from(row, {
          scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 30%', scrub: 0.5 },
          x: i % 2 === 0 ? -120 : 120,
          opacity: 0,
          ease: 'power2.out'
        })
      })
      gsap.fromTo('.ds-quote', { letterSpacing: '0.4em', opacity: 0 }, {
        scrollTrigger: { trigger: '.ds-quote', start: 'top 75%', end: 'top 30%', scrub: 0.6 },
        letterSpacing: '-0.045em', opacity: 1, ease: 'power2.out'
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section--tall" data-section="data" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
      <span className="eyebrow" style={{ alignSelf: 'flex-end' }}>03 — Data space</span>
      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
        {PHRASES.map((p, i) => (
          <h2 key={i} className="display ds-row" style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline' }}>
            <span style={{ color: 'var(--text-soft)' }}>{p[0]}</span>
            <em>{p[1]}</em>
          </h2>
        ))}
      </div>
      <div style={{ marginTop: '8rem', maxWidth: '38rem' }}>
        <p className="ds-quote body-large" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.4rem, 2.4vw, 2.4rem)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
          “Every signal matters — silence most of all.”
        </p>
      </div>
    </section>
  )
}
