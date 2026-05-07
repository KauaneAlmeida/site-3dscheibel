import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/**
 * Section 03 — "A Proposta"
 * Sticky text on left while 3 pillars reveal on the right with horizontal lines drawing.
 */
const PILLARS = [
  { n: '01', title: 'Acompanhamento contínuo', body: 'Não só nas consultas. Em cada respiração, em cada decisão, em cada noite difícil.' },
  { n: '02', title: 'Linguagem que respeita',  body: 'Sem jargão clínico, sem alarmes desnecessários. Comunicação humana, no seu ritmo.' },
  { n: '03', title: 'Decisões baseadas em ti', body: 'Cada protocolo se adapta à sua história, suas escolhas e seu corpo.' },
]

export default function SectionProposal() {
  const root = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the left column
      ScrollTrigger.create({
        trigger: '.proposal-left',
        start: 'top 20%',
        endTrigger: '.proposal-right',
        end: 'bottom 80%',
        pin: true,
        pinSpacing: false,
      })

      // Each pillar reveals: line draws, then text fades in
      gsap.utils.toArray('.pillar').forEach((p) => {
        const line = p.querySelector('.pillar-line')
        const content = p.querySelectorAll('.pillar-num, .pillar-title, .pillar-body')
        gsap.fromTo(line, { scaleX: 0 }, {
          scrollTrigger: { trigger: p, start: 'top 70%', end: 'top 30%', scrub: 0.6 },
          scaleX: 1, transformOrigin: 'left center', ease: 'power2.out',
        })
        gsap.from(content, {
          scrollTrigger: { trigger: p, start: 'top 65%', end: 'top 25%', scrub: 0.5 },
          y: 30, opacity: 0, stagger: 0.08, ease: 'power3.out',
        })
      })

      gsap.from('.proposal-eyebrow, .proposal-title, .proposal-sub', {
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
        y: 24, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section-proposal" data-section="proposal">
      <div className="proposal-grid">
        <div className="proposal-left">
          <div className="proposal-eyebrow">03 — A PROPOSTA</div>
          <h2 className="proposal-title">
            Não é um app.<br/><em>É uma presença.</em>
          </h2>
          <p className="proposal-sub">
            Construído como um hospital pensa, comunicado como um amigo fala.
          </p>
        </div>

        <div className="proposal-right">
          {PILLARS.map((p) => (
            <article key={p.n} className="pillar">
              <span className="pillar-line" />
              <span className="pillar-num">{p.n}</span>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-body">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
