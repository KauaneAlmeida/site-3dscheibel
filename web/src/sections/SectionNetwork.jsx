import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const NODES = [
  ['NODE-001','Albert Einstein','SP, BR'],
  ['NODE-002','Sírio-Libanês','SP, BR'],
  ['NODE-003','HCor','SP, BR'],
  ['NODE-004','Oswaldo Cruz','SP, BR'],
  ['NODE-005','BP — A Beneficência','SP, BR'],
  ['NODE-006','Moinhos de Vento','RS, BR'],
  ['NODE-007','D&apos;Or Network','RJ, BR'],
  ['NODE-008','Hospital Israelita','PR, BR'],
]

export default function SectionNetwork() {
  const root = useRef()
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.node-cell').forEach((c, i) => {
        gsap.from(c, {
          scrollTrigger: { trigger: c, start: 'top 90%', end: 'top 50%', scrub: 0.5 },
          y: 30, opacity: 0, stagger: 0.04, ease: 'power2.out', delay: i * 0.02
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section" data-section="network">
      <div style={{ maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <span className="eyebrow">07 — Network</span>
        <h2 className="headline">
          One mind, <em>many hospitals.</em>
        </h2>
        <p className="body-large">
          Each node a room, a ward, a clinician. Each connection an opportunity to learn — privately, locally, instantly.
        </p>
      </div>
      <div style={{ marginTop: '3.5rem' }}>
        <div className="nodes-list">
          {NODES.map((n) => (
            <div key={n[0]} className="node-cell">
              <span className="node-cell__id">{n[0]}</span>
              <span className="node-cell__name" dangerouslySetInnerHTML={{ __html: n[1] }} />
              <span className="node-cell__meta">{n[2]} · ONLINE</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
