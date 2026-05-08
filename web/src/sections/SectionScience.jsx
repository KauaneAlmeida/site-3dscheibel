import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DnaScene from '../components/DnaScene.jsx'
import ScienceConstellations from '../components/ScienceConstellations.jsx'
gsap.registerPlugin(ScrollTrigger)

// TEMP DIAGNOSTIC: see SectionHero.jsx — same flag, same purpose.
const IS_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

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
      // Long pin so the user has plenty of scroll to read each pillar.
      // Mobile gets a slightly shorter pin but the higher scrub damping keeps
      // it feeling smooth while still requiring multiple wheel/swipe events.
      const isMobile = window.innerWidth <= 768
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: isMobile ? '+=600%' : '+=700%',
          pin: true,
          pinSpacing: true,
          scrub: isMobile ? 1.5 : 0.8,
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

      // Pillars — strictly sequential. Each block: enter → hold → exit.
      // Slots are spaced so the previous pillar is FULLY exited (opacity 0,
      // mask closed) before the next one starts entering. This prevents two
      // pillars from rendering at the same time on top of each other.
      //
      // Per pillar block:
      //   t+0.00  container opacity 0 → 1 (instant)
      //   t+0.00  line wipe + title reveal start
      //   t+0.04  body reveal start
      //   t+0.20  → text fully revealed (HOLD begins)
      //   t+0.22  HOLD — user reads
      //   t+0.22  exit (title clip closes, then body)
      //   t+0.30  container opacity → 0 (fully gone)
      // Total slot length: 0.30. Spacing of 0.30 between starts = zero overlap.
      const pillarSlots = [
        { start: 0.10, name: '.science-pillar--1' },
        { start: 0.40, name: '.science-pillar--2' },
        { start: 0.70, name: '.science-pillar--3' },
      ]
      pillarSlots.forEach(({ start, name }) => {
        // Container fade in instantly so the mask reveal is what the eye sees.
        tl.fromTo(name,
          { opacity: 0 },
          { opacity: 1, duration: 0.01, ease: 'none' },
          start
        )
        // Decorative line wipes in.
        tl.fromTo(`${name} .science-pillar__line`,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.14, ease: 'power2.out' },
          start
        )
        // Title and body mask reveals.
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
        // HOLD between t+0.24 and t+0.24 (instant — the dwell comes from the
        // 0.30 slot length; user is reading while scrub progresses).
        // EXIT — fade the whole container at once. Quick & clean, no
        // overlapping mask animations with the next pillar's entrance.
        tl.to(name,
          { opacity: 0, duration: 0.06, ease: 'power2.in' },
          start + 0.24
        )
        // Reset the inner masks AFTER opacity hits 0 so they're ready to
        // re-reveal cleanly if the user scrolls back.
        tl.set(`${name} .science-pillar__title`,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          start + 0.30
        )
        tl.set(`${name} .science-pillar__body`,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          start + 0.30
        )
      })

      // Closing headline — starts AFTER pillar 3 fully exits (0.58 + 0.36 = 0.94).
      // Tightened a bit so the closing has room to land before the pin ends.
      tl.fromTo('.science-closing',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.10, ease: 'sine.inOut' },
        0.96
      )
      tl.fromTo('.science-stat',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.10, stagger: 0.03, ease: 'sine.inOut' },
        1.00
      )

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
          {IS_ANDROID ? <div data-android-stub /> : <DnaScene progressRef={sectionProgressRef} />}
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
