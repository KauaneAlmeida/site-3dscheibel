import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/**
 * Section 07 — "CTA / Comece"
 * Mask reveal headline + minimal CTA button + footer.
 */
export default function SectionCTA() {
  const root = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-line', { yPercent: 100 }, {
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'top 20%', scrub: 0.6 },
        yPercent: 0, stagger: 0.1, ease: 'power3.out',
      })
      gsap.from('.cta-btn, .cta-foot', {
        scrollTrigger: { trigger: root.current, start: 'top 50%' },
        y: 30, opacity: 0, stagger: 0.15, duration: 1, ease: 'power3.out',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section-cta" data-section="cta">
      <h2 className="cta-headline">
        <span className="cta-mask"><span className="cta-line">Pronto para começar</span></span>
        <span className="cta-mask"><span className="cta-line"><em>a sua jornada?</em></span></span>
      </h2>

      <a href="#access" className="cta-btn">
        Solicitar acesso
        <span className="cta-btn__arrow">→</span>
      </a>

      <p className="cta-foot">
        Atualmente em programa fechado.<br/>
        Profissionais de saúde podem solicitar inscrição.
      </p>

      <footer className="cta-footer">
        <div className="cta-footer__brand">Scheibel</div>
        <div className="cta-footer__links">
          <a href="#about">Sobre</a>
          <a href="#privacy">Privacidade</a>
          <a href="#contact">Contato</a>
        </div>
        <div className="cta-footer__copy">© 2026</div>
      </footer>
    </section>
  )
}
