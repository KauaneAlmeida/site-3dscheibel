import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function SectionOrigin() {
  const root = useRef()
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.origin-line', {
        scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top 30%', scrub: 0.6 },
        y: 60, opacity: 0, stagger: 0.1, ease: 'power3.out'
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section--center section--tall" data-section="origin">
      <span className="eyebrow origin-line">08 — Origin</span>
      <h2 className="display origin-line" style={{ marginTop: '2rem', maxWidth: '24ch' }}>
        Built quietly.<br/>
        <em>For care that won&apos;t wait.</em>
      </h2>
      <p className="body-large origin-line" style={{ marginTop: '2rem' }}>
        Verdant Nexus is a research-grade clinical intelligence system, currently in private trial.
        We are not a chatbot. We are infrastructure.
      </p>
      <div className="origin-line" style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
        <a className="pill" href="#contact">request demo</a>
      </div>
    </section>
  )
}
