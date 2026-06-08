import { useEffect } from 'react'

/**
 * Drives scroll-progress UI WITHOUT any React state, so it never re-renders the
 * App tree on scroll (which was stealing frame budget during the gesture,
 * especially on Android). Every frame it writes the smoothed 0..1 progress
 * straight into the DOM:
 *   - the progress bar fill's scaleX (via `fillRef`)
 *   - the `scrolled` class on <body> (crossing a 0.04 threshold)
 *
 * `fillRef` is an optional ref to the .progress__fill element.
 */
export function useScrollProgress(fillRef) {
  useEffect(() => {
    let rafId
    let raw = 0
    let smoothed = 0
    let scrolled = false

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      raw = h > 0 ? window.scrollY / h : 0
    }
    const tick = () => {
      smoothed += (raw - smoothed) * 0.12

      const fill = fillRef?.current
      if (fill) fill.style.transform = `scaleX(${smoothed})`

      const shouldScroll = smoothed > 0.04
      if (shouldScroll !== scrolled) {
        scrolled = shouldScroll
        document.body.classList.toggle('scrolled', shouldScroll)
      }

      rafId = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [fillRef])
}
