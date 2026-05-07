import { useEffect, useState, useRef } from 'react'

/**
 * Returns:
 * - progress: 0..1 across full scroll height (smoothed)
 *
 * Updates state only when the smoothed progress crosses an epsilon, so we
 * don't trigger 60Hz re-renders of the entire App tree just to track scroll.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const raw = useRef(0)
  const smoothed = useRef(0)
  const lastReported = useRef(0)

  useEffect(() => {
    let rafId
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      raw.current = h > 0 ? window.scrollY / h : 0
    }
    const tick = () => {
      smoothed.current += (raw.current - smoothed.current) * 0.12
      // Only push to React state if the value changed enough to matter visually.
      // 0.005 ≈ half a percent — coarse enough to avoid every-frame churn.
      if (Math.abs(smoothed.current - lastReported.current) > 0.005) {
        lastReported.current = smoothed.current
        setProgress(smoothed.current)
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
  }, [])

  return { progress }
}
