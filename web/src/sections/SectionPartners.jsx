import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function SectionPartners() {
  const root = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.partners-line', { scaleX: 0 }, {
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'top 20%', scrub: 0.6 },
        scaleX: 1, transformOrigin: 'left center', ease: 'power2.out',
      })
      gsap.from('.partners-quote', {
        scrollTrigger: { trigger: root.current, start: 'top 65%' },
        opacity: 0, y: 30, duration: 1.4, ease: 'power3.out',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section-partners" data-section="partners">
      <p className="partners-quote">
        “Cada decisão foi tomada<br/>com pacientes reais ao nosso lado.”
      </p>
      <div className="partners-line" />
    </section>
  )
}
