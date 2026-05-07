import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/**
 * Section 02 — "O Silêncio Antes"
 * Typographic reveal: each line slides up word-by-word as you scroll.
 * Two animated counters at the bottom that tick up.
 */
export default function SectionSilence() {
  const root = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal each line word-by-word
      const words = root.current.querySelectorAll('.silence-word')
      gsap.from(words, {
        scrollTrigger: {
          trigger: root.current,
          start: 'top 70%',
          end: 'top 10%',
          scrub: 0.6,
        },
        y: '100%',
        opacity: 0,
        stagger: 0.04,
        ease: 'power3.out',
      })

      // Animated counters
      root.current.querySelectorAll('.counter').forEach((el) => {
        const target = +el.dataset.target
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          onUpdate: () => { el.textContent = Math.round(obj.v) + '%' },
        })
      })

      // Counter labels fade in
      gsap.from('.counter-row', {
        scrollTrigger: { trigger: '.silence-counters', start: 'top 80%' },
        y: 24, opacity: 0, stagger: 0.15, duration: 1, ease: 'power3.out',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // Helper: split text into spans, keeping real spaces BETWEEN word wrappers
  const renderLine = (text, className = '') => {
    const words = text.split(' ')
    return words.map((w, i) => (
      <span key={i}>
        <span className="silence-word-wrap">
          <span className={`silence-word ${className}`}>{w}</span>
        </span>
        {i < words.length - 1 && ' '}
      </span>
    ))
  }

  return (
    <section ref={root} className="section section-silence" data-section="silence">
      <h2 className="silence-headline">
        <span className="silence-line">{renderLine('A maioria dos pacientes')}</span>
        <span className="silence-line">{renderLine('se sente sozinha')}</span>
        <span className="silence-line"><em>{renderLine('na recuperação.', 'silence-em')}</em></span>
      </h2>

      <div className="silence-counters">
        <div className="counter-row">
          <span className="counter" data-target="78">0%</span>
          <span className="counter-label">sentem ansiedade fora do consultório</span>
        </div>
        <div className="counter-row">
          <span className="counter" data-target="64">0%</span>
          <span className="counter-label">abandonam o tratamento em 90 dias</span>
        </div>
      </div>
    </section>
  )
}
