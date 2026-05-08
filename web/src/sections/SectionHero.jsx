import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SphereHero from '../components/SphereHero.jsx'
gsap.registerPlugin(ScrollTrigger)

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
      <SphereHero />

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
