import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react'
import { IS_ANDROID } from '../lib/isAndroid.js'

// drei's useProgress lives in a lazy child so @react-three/drei (→ fiber →
// three) is NOT pulled into the main bundle. Android never loads this.
const DreiProgress = lazy(() => import('./DreiProgress.jsx'))

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
  const [hide, setHide] = useState(false)
  const [displayed, setDisplayed] = useState(0)
  const reachedFull = useRef(false)
  const startedAt = useRef(performance.now())
  const realRef = useRef(0)
  const activeRef = useRef(true)
  // Bumped whenever drei reports, so the desktop hide-effect re-evaluates.
  const [progressTick, setProgressTick] = useState(0)

  const onDreiUpdate = useCallback((progress, active) => {
    realRef.current = progress
    activeRef.current = active
    if (progress >= 100) reachedFull.current = true
    setProgressTick((n) => n + 1)
  }, [])

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
  // there is no drei progress to wait on. Gating the hide on it would leave
  // the loader up until the safety net — the "page frozen at start, can't
  // scroll" bug. So on Android we just hide after a short fixed settle.
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
    if (activeRef.current) return
    const t = setTimeout(() => setHide(true), 600)
    return () => clearTimeout(t)
  }, [progressTick])

  // Safety net — 30s max (desktop/iOS only; Android hides on its own timer).
  useEffect(() => {
    if (IS_ANDROID) return
    const t = setTimeout(() => setHide(true), 30000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`loader ${hide ? 'hidden' : ''}`}>
      {!IS_ANDROID && (
        <Suspense fallback={null}>
          <DreiProgress onUpdate={onDreiUpdate} />
        </Suspense>
      )}
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
