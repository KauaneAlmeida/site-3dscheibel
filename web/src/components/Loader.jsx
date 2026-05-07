import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

/**
 * Loader — stays on screen until R3F finishes loading every asset (GLB
 * models + Environment HDR), plus a brief settle window for shader compile.
 *
 * Why this matters on mobile: the sphere.glb alone is ~32MB. On a slower
 * connection that's several seconds; we cannot hide the loader on a fixed
 * timer or the user lands on a blank hero with the 3D still streaming in.
 *
 * Strategy:
 *   1. Track drei's progress (0..100). Only consider hiding after it hits 100.
 *   2. Wait until `active` flips back to false (drei's "all loaders idle" flag).
 *   3. Add a small settle delay (400ms) so first frame can render with shaders
 *      already warm — avoids the user seeing a black flash.
 *   4. A safety timeout of 30s prevents an infinite loader if a fetch stalls
 *      or `active` never flips.
 */
export default function Loader() {
  const { progress, active, item } = useProgress()
  const [hide, setHide] = useState(false)
  const reachedFull = useRef(false)
  // Smoothed value so the bar doesn't jump backwards when a new asset starts.
  const [smoothProgress, setSmoothProgress] = useState(0)

  useEffect(() => {
    setSmoothProgress((prev) => Math.max(prev, progress))
  }, [progress])

  useEffect(() => {
    if (progress >= 100) reachedFull.current = true
  }, [progress])

  // Hide once everything has loaded AND drei is idle, after a short settle.
  useEffect(() => {
    if (!reachedFull.current) return
    if (active) return // still loading something
    const t = setTimeout(() => setHide(true), 400)
    return () => clearTimeout(t)
  }, [active, progress])

  // Safety net — never block the user for more than 30 seconds even if a
  // fetch hangs. The site degrades gracefully (Three canvases use Suspense).
  useEffect(() => {
    const t = setTimeout(() => setHide(true), 30000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`loader ${hide ? 'hidden' : ''}`}>
      <div className="loader__text">Carregando experiência…</div>
      <div className="loader__bar">
        <div
          className="loader__bar-fill"
          style={{ transform: `scaleX(${smoothProgress / 100})` }}
        />
      </div>
      <div className="loader__text" style={{ opacity: 0.6 }}>
        {Math.floor(smoothProgress)}%
      </div>
    </div>
  )
}
