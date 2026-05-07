import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DnaScene from '../components/DnaScene.jsx'
import ScienceConstellations from '../components/ScienceConstellations.jsx'
gsap.registerPlugin(ScrollTrigger)

/**
 * SectionScience — DNA reveal + manifesto.
 *
 * Single pinned timeline driven by scrub. Stages:
 *   0.00 – 0.10  intro hold (cream visible)
 *   0.10 – 0.20  dark wedge rises diagonally from below, covers full screen
 *   0.20 – 0.32  pillar 01
 *   0.32 – 0.46  pillar 02
 *   0.46 – 0.60  pillar 03
 *   0.60 – 0.78  closing + stats
 *   0.78 – 1.00  hold dark + DNA so the next section can replace cleanly
 */
const PILLARS = [
  { n: '01', title: 'Acompanhamento contínuo', body: 'Não só nas consultas. Em cada respiração, em cada decisão, em cada noite difícil.' },
  { n: '02', title: 'Linguagem que respeita',  body: 'Sem jargão clínico, sem alarmes desnecessários. Comunicação humana, no seu ritmo.' },
  { n: '03', title: 'Decisões baseadas no paciente', body: 'Cada protocolo se adapta à sua história, suas escolhas e seu corpo.' },
]

export default function SectionScience() {
  const root = useRef()
  const sectionProgressRef = useRef({ value: 0 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Mobile gets a much shorter pin — 5 viewports of locked scroll feels
      // broken on phones. Desktop keeps the full cinematic length.
      const isMobile = window.innerWidth <= 768
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: isMobile ? '+=200%' : '+=400%',
          pin: true,
          pinSpacing: true,
          scrub: 0.4,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => { sectionProgressRef.current.value = self.progress },
        },
      })

      // Background gradient — the WHOLE section shifts color across scroll.
      // Three full-bleed environments:
      //   warm brown (start) → deep navy (mid) → dark forest green (end)
      tl.fromTo('.science-split-dark',
        { '--c-base': '#1a120a', '--c-base-deep': '#0a0703', '--c-glow': 'rgba(180, 100, 40, 0.4)' },
        { '--c-base': '#0f1a2e', '--c-base-deep': '#040814', '--c-glow': 'rgba(60, 110, 200, 0.35)',
          duration: 0.30, ease: 'sine.inOut' },
        0.28
      )
      tl.to('.science-split-dark',
        { '--c-base': '#0d1f17', '--c-base-deep': '#03100a', '--c-glow': 'rgba(50, 160, 100, 0.32)',
          duration: 0.30, ease: 'sine.inOut' },
        0.60
      )

      // Stage A — cream intro fades, dark wedge rises diagonally then covers full screen.
      // Smoother entry: longer cross-fade and gentler eases so the pin doesn't read as a "snap".
      tl.to('.science-light', { opacity: 0, duration: 0.12, ease: 'sine.inOut' }, 0.06)
        .fromTo('.science-split-dark',
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 60%, 100% 30%, 100% 100%, 0% 100%)', duration: 0.10, ease: 'sine.inOut' },
          0.06
        )
        .to('.science-split-dark',
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 0.10, ease: 'sine.inOut' },
          0.14
        )
        .to('.dna-scene', { opacity: 1, duration: 0.12, ease: 'sine.inOut' }, 0.12)

      // Pillars — sequential fade-in/out, NO overlaps with each other or the closing.
      // Each pillar block: enter (0.10) → hold (0.04) → exit (0.10) = 0.24 of timeline.
      // Slots spaced 0.16 apart so previous pillar fully exits before next enters.
      const pillarSlots = [
        { start: 0.18, name: '.science-pillar--1' },
        { start: 0.34, name: '.science-pillar--2' },
        { start: 0.50, name: '.science-pillar--3' },
      ]
      pillarSlots.forEach(({ start, name }) => {
        // Container fade in (no movement — the mask does the choreography).
        tl.fromTo(name,
          { opacity: 0 },
          { opacity: 1, duration: 0.04, ease: 'none' },
          start
        )
        // Decorative line wipes in from the left.
        tl.fromTo(`${name} .science-pillar__line`,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.14, ease: 'power2.out' },
          start
        )
        // Mask reveal — title and body unveil from bottom to top with a small
        // delay between them. clip-path starts fully closed at the top, then
        // opens downward as scroll progresses. The text inside also rises a
        // touch for parallax inside the mask.
        tl.fromTo(`${name} .science-pillar__title`,
          { clipPath: 'inset(100% 0% 0% 0%)', y: 16 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.18, ease: 'power3.out' },
          start + 0.02
        )
        tl.fromTo(`${name} .science-pillar__body`,
          { clipPath: 'inset(100% 0% 0% 0%)', y: 12 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.18, ease: 'power3.out' },
          start + 0.06
        )
        // Exit — mask closes again, this time from the top down (mirror).
        tl.to(`${name} .science-pillar__title`,
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.10, ease: 'power2.in' },
          start + 0.14
        )
        tl.to(`${name} .science-pillar__body`,
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.10, ease: 'power2.in' },
          start + 0.16
        )
        tl.to(name,
          { opacity: 0, duration: 0.06, ease: 'none' },
          start + 0.20
        )
      })

      // Closing headline — starts AFTER pillar 3 has fully exited (0.50 + 0.24 = 0.74)
      tl.fromTo('.science-closing',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.12, ease: 'sine.inOut' },
        0.76
      )
      tl.fromTo('.science-stat',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.12, stagger: 0.04, ease: 'sine.inOut' },
        0.82
      )

      // Hold the final state until pin releases (so transition out is clean)
      tl.to({}, { duration: 0.20 }, 0.78)

      // One-shot intro reveal of the cream-side text
      gsap.from('.science-eyebrow, .science-title, .science-sub, .science-scroll-hint', {
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
        y: 28, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section-science" data-section="science">
      <div className="science-light">
        <h2 className="science-title">
          Não é um app.<br/><em>É uma presença.</em>
        </h2>
        <p className="science-sub">
          Construído como um hospital pensa, comunicado como um amigo fala.
          Por trás de cada respiração, uma equação.
        </p>
        <div className="science-scroll-hint">↓ continue rolando</div>
      </div>

      <div className="science-split-dark">
        <ScienceConstellations />
        <div className="dna-scene">
          <DnaScene progressRef={sectionProgressRef} />
        </div>

        <div className="science-pillars">
          {PILLARS.map((p, i) => (
            <article key={p.n} className={`science-pillar science-pillar--${i + 1}`}>
              <span className="science-pillar__line" />
              <h3 className="science-pillar__title">{p.title}</h3>
              <p className="science-pillar__body">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="science-final">
          <h3 className="science-closing">
            A ciência<br/><em>do cuidado humano.</em>
          </h3>
          <div className="science-stats">
            <div className="science-stat">
              <span className="science-stat__num">312</span>
              <span className="science-stat__label">artigos científicos<br/>na base de protocolos</span>
            </div>
            <div className="science-stat">
              <span className="science-stat__num">14</span>
              <span className="science-stat__label">centros clínicos<br/>parceiros validadores</span>
            </div>
            <div className="science-stat">
              <span className="science-stat__num">∞</span>
              <span className="science-stat__label">adaptação contínua<br/>aos seus dados</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
