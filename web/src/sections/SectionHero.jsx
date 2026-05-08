import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SphereHero from '../components/SphereHero.jsx'
gsap.registerPlugin(ScrollTrigger)

// TEMP DIAGNOSTIC: skip the WebGL hero on Android to isolate whether the
// scroll-jank source is the Three.js scenes or something else. Remove once
// the bottleneck is confirmed.
const IS_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

export default function SectionHero() {
  const root = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-eyebrow-label', { y: 12, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 })
      gsap.from('.hero-display', { y: 60, opacity: 0, duration: 1.4, ease: 'power3.out', delay: 0.6 })
      gsap.from('.hero-divider', { scaleX: 0, opacity: 0, duration: 1.2, ease: 'power2.out', delay: 1.0 })
      gsap.from('.hero-desc', { y: 20, opacity: 0, duration: 1, ease: 'power3.out', delay: 1.4 })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section hero" data-section="hero">
      {IS_ANDROID ? <div className="sphere-hero" data-android-stub /> : <SphereHero />}

      {/* Top-left small label */}
      <div className="hero-eyebrow-label">INSTITUTO SCHEIBEL</div>

      {/* Bottom-left huge display headline */}
      <h1 className="hero-display">SCHEIBEL</h1>

      {/* Horizontal divider line, splits viewport */}
      <div className="hero-divider" />

      {/* Bottom-right description */}
      <p className="hero-desc">
        SCHEIBEL DESBLOQUEIA O POTENCIAL HUMANO ATRAVÉS<br/>
        {' '}DE PERCEPÇÕES BIOTECNOLÓGICAS ÉTICAS E A PRÓXIMA<br/>
        {' '}EVOLUÇÃO DA SAÚDE DA CONSCIÊNCIA.
      </p>
    </section>
  )
}
