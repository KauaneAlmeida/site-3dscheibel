import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { IS_ANDROID } from '../lib/isAndroid.js'

/**
 * Loader — stays on screen until R3F finishes loading every asset (GLB
 * models + Environment HDR), plus a brief settle window for shader compile.
 *
 * The displayed % is the MAX of two sources:
 *   - drei's real progress (jumps when an asset finishes downloading)
 *   - a smooth "ghost" that crawls toward 90% on its own clock
 * This guarantees the number is always visibly moving — important for users
 * on slow connections who'd otherwise see "0%" while the GLB streams in.
 *
 * Hide is gated on the REAL drei progress reaching 100 + active flipping
 * to false, so we never hide on the ghost.
 */
export default function Loader() {
  const { progress: realProgress, active } = useProgress()
  const [hide, setHide] = useState(false)
  const [displayed, setDisplayed] = useState(0)
  const reachedFull = useRef(false)
  const startedAt = useRef(performance.now())
  const realRef = useRef(0)

  useEffect(() => { realRef.current = realProgress }, [realProgress])

  useEffect(() => {
    if (realProgress >= 100) reachedFull.current = true
  }, [realProgress])

  // RAF loop — drives the displayed number every frame. The ghost moves
  // along an easing curve that approaches (but never reaches) 90% based on
  // elapsed time. Once real progress crosses ghost, real takes over.
  useEffect(() => {
    let raf
    const tick = () => {
      const elapsed = (performance.now() - startedAt.current) / 1000
      // Ghost: 0 → ~90 over ~6 seconds, easing out so it slows as it approaches.
      const ghost = 90 * (1 - Math.exp(-elapsed / 2))
      const real = realRef.current
      // If real finished, snap to 100; otherwise show whichever is further along.
      const target = reachedFull.current ? 100 : Math.max(ghost, real)
      setDisplayed((prev) => {
        // Tiny lerp so the bar moves smoothly even if target jumps.
        const next = prev + (target - prev) * 0.18
        return Math.abs(next - target) < 0.05 ? target : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Android loads NO Three.js assets (GLBs/HDR are swapped for video), so
  // useProgress never reaches 100 and `active` may stay false forever. Gating
  // the hide on drei progress would leave the loader up until the 30s safety
  // net — which is exactly the "page frozen at start, can't scroll" bug. So on
  // Android we just hide after a short fixed settle once mounted.
  useEffect(() => {
    if (!IS_ANDROID) return
    setDisplayed(100)
    const t = setTimeout(() => setHide(true), 700)
    return () => clearTimeout(t)
  }, [])

  // Desktop/iOS — hide once everything has loaded AND drei is idle, after a
  // short settle.
  useEffect(() => {
    if (IS_ANDROID) return
    if (!reachedFull.current) return
    if (active) return
    const t = setTimeout(() => setHide(true), 600)
    return () => clearTimeout(t)
  }, [active, realProgress])

  // Safety net — 30s max (desktop/iOS only; Android hides on its own timer).
  useEffect(() => {
    if (IS_ANDROID) return
    const t = setTimeout(() => setHide(true), 30000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`loader ${hide ? 'hidden' : ''}`}>
      <div className="loader__text">Carregando experiência…</div>
      <div className="loader__bar">
        <div
          className="loader__bar-fill"
          style={{ transform: `scaleX(${displayed / 100})` }}
        />
      </div>
      <div className="loader__text" style={{ opacity: 0.6 }}>
        {Math.floor(displayed)}%
      </div>
    </div>
  )
}
