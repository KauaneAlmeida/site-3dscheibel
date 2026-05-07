import { useEffect, useState } from 'react'

/**
 * Small fixed indicator showing (current section / total) — top-right.
 */
const TOTAL = 7

export default function ScrollIndicator() {
  const [n, setN] = useState(1)

  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll('[data-section]')
      const center = window.scrollY + window.innerHeight / 2
      let active = 1
      sections.forEach((s, i) => {
        if (center >= s.offsetTop) active = Math.min(i + 1, TOTAL)
      })
      setN(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="scroll-counter">
      <span className="scroll-counter__current">{String(n).padStart(2, '0')}</span>
      <span className="scroll-counter__sep"> / </span>
      <span className="scroll-counter__total">{String(TOTAL).padStart(2, '0')}</span>
    </div>
  )
}
