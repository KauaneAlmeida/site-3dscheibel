import { Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * The Journey Orb — small 3D golden ball that follows scroll.
 *
 * Architecture: a single state derivation function computes the orb's target
 * every frame, by reading the live progress of one ScrollTrigger per section.
 * No callbacks (onEnter/onLeaveBack) — those are unreliable on fast scroll
 * because they can fire out-of-order. Instead, we ask each ScrollTrigger
 * "what's your progress right now?" and pick the highest-priority section
 * that's currently active. State is always derived, never stored.
 */

function screenToWorld(xPx, yPx, viewport, camZ, fovDeg) {
  const fovRad = (fovDeg * Math.PI) / 180
  const visibleH = 2 * camZ * Math.tan(fovRad / 2)
  const visibleW = visibleH * (viewport.width / viewport.height)
  const ndcX = (xPx / viewport.width) * 2 - 1
  const ndcY = -((yPx / viewport.height) * 2 - 1)
  return { x: ndcX * (visibleW / 2), y: ndcY * (visibleH / 2) }
}

function lerp(a, b, t) { return a + (b - a) * t }
function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t }

function Orb({ targetRef }) {
  const meshRef = useRef()
  const lightRef = useRef()
  const { camera, size } = useThree()

  useFrame(() => {
    if (!meshRef.current) return
    const safeNum = (v, fallback) => (Number.isFinite(v) ? v : fallback)
    const tx = safeNum(targetRef.current.x, size.width * 0.5)
    const ty = safeNum(targetRef.current.y, size.height * 0.5)
    const op = Math.max(0, Math.min(1, safeNum(targetRef.current.opacity, 1)))
    const sz = Math.max(0, safeNum(targetRef.current.size, 1))

    const w = screenToWorld(tx, ty, size, camera.position.z, camera.fov)
    if (!Number.isFinite(w.x) || !Number.isFinite(w.y)) return

    meshRef.current.position.set(w.x, w.y, 0)
    // Base scale tracks viewport width so the orb stays a similar relative
    // size across phones / tablets / desktop. Matches the responsive sizing
    // applied to the hero sphere.
    const baseScale = size.width <= 480 ? 0.13
      : size.width <= 768 ? 0.15
      : size.width <= 1024 ? 0.18
      : 0.22
    const s = baseScale * sz * op
    meshRef.current.scale.setScalar(Math.max(0.0001, s))
    meshRef.current.visible = op > 0.01

    if (lightRef.current) {
      lightRef.current.position.set(w.x, w.y, 0.5)
      lightRef.current.intensity = 1.4 * op * sz
    }
  })

  const orbMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#d4a560',
    metalness: 1.0,
    roughness: 0.22,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
  }), [])

  // R3F auto-disposes JSX-declared materials/geometries, but a material
  // created via useMemo and passed by prop is owned by us — release it.
  useEffect(() => () => orbMat.dispose(), [orbMat])

  return (
    <>
      <mesh ref={meshRef} material={orbMat}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      <pointLight ref={lightRef} color="#ffd9a8" intensity={1.4} distance={2.8} />
    </>
  )
}

export default function JourneyOrb() {
  const targetRef = useRef({ x: 0, y: 0, opacity: 1, size: 1 })

  useEffect(() => {
    const target = targetRef.current
    const vw = (n) => window.innerWidth * n
    const vh = (n) => window.innerHeight * n

    /**
     * The journey is a list of segments. Each segment owns a ScrollTrigger
     * (no callbacks — only progress is read), and an interpolator from `from`
     * to `to`. Segments are evaluated in order; the LAST active segment wins.
     * "Hidden" segments are just regular tweens that end with opacity 0.
     *
     * This means: in any scroll position, the orb's state is fully determined
     * by which segments are currently active and their progress — a pure
     * function of scroll. No timing race conditions possible.
     */
    const segments = [
      // Hero — moon nudged a bit further left, drifts slightly down.
      {
        selector: '[data-section="hero"]',
        start: 'top top',
        end: 'bottom top',
        from: { x: vw(0.65), y: vh(0.14), opacity: 1, size: 1 },
        to:   { x: vw(0.65), y: vh(0.22), opacity: 1, size: 1 },
      },
      // Silence — drifts toward the right edge so the orb sits clear of the
      // centered text block, then descends along the right side.
      {
        selector: '[data-section="silence"]',
        start: 'top bottom',
        end: 'bottom bottom',
        from: { x: vw(0.65), y: vh(0.22), opacity: 1, size: 1 },
        to:   { x: vw(0.82), y: vh(0.70), opacity: 1, size: 1 },
      },
      // Science (03) — Phase 1: orb keeps falling diagonally toward the
      // bottom-left, fully visible. This is the long approach, so the orb
      // has clearly traveled before the helix takes over.
      {
        selector: '[data-section="science"]',
        start: 'top 80%',
        end: 'top top',
        from: { x: vw(0.82), y: vh(0.70), opacity: 1, size: 1 },
        to:   { x: vw(0.45), y: vh(0.85), opacity: 1, size: 0.85 },
      },
      // Science (03) — Phase 2: pin has engaged. Orb keeps moving in the
      // SAME direction (down + slightly left) and exits through the bottom
      // of the viewport while fading. No reverse, no retreat.
      {
        selector: '[data-section="science"]',
        start: 'top top',
        end: '+=15%',
        from: { x: vw(0.45), y: vh(0.85), opacity: 1, size: 0.85 },
        to:   { x: vw(0.38), y: vh(1.10), opacity: 0, size: 0.7 },
      },
      // Science PIN — once exited, stays at opacity 0 for the rest of the page.
      {
        selector: '[data-section="science"]',
        start: 'top -15%',
        end: 'bottom top',
        from: { x: vw(0.38), y: vh(1.10), opacity: 0, size: 0.7 },
        to:   { x: vw(0.38), y: vh(1.10), opacity: 0, size: 0.7 },
      },
    ]

    // Materialize each segment into a real ScrollTrigger that reports its
    // own progress live. Reading `st.progress` is the authoritative source
    // of truth — GSAP keeps it in sync with whatever scroll is reported,
    // including Lenis smooth scroll. We never read `window.scrollY` directly.
    const live = segments
      .map((seg) => {
        const el = document.querySelector(seg.selector)
        if (!el) return null
        const st = ScrollTrigger.create({
          trigger: el,
          start: seg.start,
          end: seg.end,
          invalidateOnRefresh: true,
        })
        return { ...seg, st }
      })
      .filter(Boolean)

    // Pure-derivation update: state is computed from each trigger's live
    // `progress`, not from any callback. This makes it impossible for
    // fast scroll to skip an `onEnter` and leave the orb in a wrong state —
    // every frame we recompute from scratch.
    const update = () => {
      // Find the LAST segment that's currently active (progress > 0 and < 1).
      // Later segments in the array represent later sections, so they win
      // any overlap with earlier ones.
      let active = null
      for (let i = live.length - 1; i >= 0; i--) {
        const s = live[i]
        if (s.st.progress > 0 && s.st.progress < 1) { active = s; break }
      }

      // If nothing is mid-scroll (progress is exactly 0 or 1 on every
      // segment), pick the latest segment that has reached progress 1 —
      // i.e., the orb stays at the END state of the most recent passed
      // segment, never reverting to a stale earlier state.
      if (!active) {
        for (let i = live.length - 1; i >= 0; i--) {
          if (live[i].st.progress >= 1) {
            // Pin to the END state of the last completed segment.
            const s = live[i]
            target.x = s.to.x
            target.y = s.to.y
            target.opacity = s.to.opacity
            target.size = s.to.size
            return
          }
        }
        // Otherwise we're before the first segment — pin to its FROM state.
        const first = live[0]
        if (first) {
          target.x = first.from.x
          target.y = first.from.y
          target.opacity = first.from.opacity
          target.size = first.from.size
        }
        return
      }

      const p = active.st.progress
      const { from, to } = active
      target.x = lerp(from.x, to.x, p)
      target.y = lerp(from.y, to.y, p)
      target.opacity = lerp(from.opacity, to.opacity, p)
      target.size = lerp(from.size, to.size, p)
    }

    // The GSAP ticker already fires every frame in sync with ScrollTrigger,
    // so it's the only source we need. (Previously we also subscribed to
    // scrollStart/scrollEnd/refresh — those fired the update at moments when
    // progress wasn't yet committed, occasionally clobbering the live value.)
    gsap.ticker.add(update)
    update()

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(update)
      live.forEach((s) => s.st.kill())
    }
  }, [])

  return (
    <div className="journey-orb">
      <Canvas
        className="journey-orb__canvas"
        dpr={[1, 1.8]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        camera={{ position: [0, 0, 5], fov: 40, near: 0.05, far: 50 }}
      >
        <ambientLight intensity={0.6} color="#fff5e0" />
        <directionalLight position={[2, 3, 4]} intensity={1.5} color="#fff8ec" />
        <Suspense fallback={null}>
          <Orb targetRef={targetRef} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  )
}
