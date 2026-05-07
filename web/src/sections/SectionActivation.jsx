import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function SectionActivation() {
  const root = useRef()
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.act-line', {
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'top 20%', scrub: 0.6 },
        x: -80, opacity: 0, stagger: 0.08, ease: 'power2.out'
      })
      gsap.from('.act-num', {
        scrollTrigger: { trigger: root.current, start: 'top 60%', end: 'bottom 40%', scrub: 0.4 },
        scale: 0.7, opacity: 0, ease: 'power2.out'
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section" data-section="activation">
      <div className="split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <span className="eyebrow">02 — Activation</span>
          <h2 className="headline act-line" style={{ overflow: 'hidden' }}>
            <span className="act-line">First signal —</span><br/>
            <em className="act-line">a system that listens.</em>
          </h2>
          <p className="body-large act-line">
            From the moment a patient enters the network, every micro-event becomes
            a vector: vitals, words, silences. The Nexus weaves them into meaning.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', alignItems: 'flex-end' }}>
          <span className="label">live signals · sample</span>
          <div className="metric act-num"><span className="metric__num">1.4M</span><span className="metric__label">events / minute</span></div>
          <div className="metric act-num"><span className="metric__num">96 ms</span><span className="metric__label">median latency</span></div>
          <div className="metric act-num"><span className="metric__num">312</span><span className="metric__label">signal channels</span></div>
        </div>
      </div>
    </section>
  )
}
