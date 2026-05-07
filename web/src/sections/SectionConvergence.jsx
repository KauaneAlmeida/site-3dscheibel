import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function SectionConvergence() {
  const root = useRef()
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.conv-mask', { clipPath: 'inset(100% 0 0 0)' }, {
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'top 10%', scrub: 0.7 },
        clipPath: 'inset(0% 0 0 0)', ease: 'power2.out'
      })
      gsap.from('.conv-meta', {
        scrollTrigger: { trigger: root.current, start: 'top 60%', end: 'bottom 50%', scrub: 0.4 },
        y: 40, opacity: 0, stagger: 0.07
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section--center" data-section="convergence">
      <span className="eyebrow">04 — Convergence</span>
      <h2 className="display" style={{ marginTop: '2rem', maxWidth: '20ch' }}>
        <span className="conv-mask" style={{ display: 'block' }}>Out of energy,</span>
        <em className="conv-mask" style={{ display: 'block' }}>a tool is born.</em>
      </h2>
      <p className="body-large conv-meta" style={{ marginTop: '2rem' }}>
        The interface is not a screen.
        It is the residue of intelligence — concentrated, made tangible.
      </p>
      <div className="conv-meta" style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
        <button className="pill">request access</button>
        <button className="pill" style={{ borderColor: 'var(--text-soft)', color: 'var(--text-soft)' }}>see the protocol</button>
      </div>
    </section>
  )
}
