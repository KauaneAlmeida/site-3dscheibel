// O GLB foi editado no Blender para remover a bolinha pequena fundida ao mesh.
// A bolinha visual única do site é a JourneyOrb (componente separado), que viaja no scroll.
// NÃO reintroduzir manipulação de BufferGeometry em runtime — o asset já vem limpo do GLB.

import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

useGLTF.preload('/sphere.glb', undefined, undefined, (loader) => {
  loader.setMeshoptDecoder(MeshoptDecoder)
})

function Sphere({ autoSpin = false, isometricTilt = false }) {
  const groupRef = useRef()
  const startRef = useRef(performance.now())
  const { scene: cachedScene } = useGLTF('/sphere.glb', undefined, undefined, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder)
  })
  // Clone the cached scene per instance so HMR / iOS bfcache navigation
  // doesn't leave us pointing at a mutated shared object (which presented
  // as "blank canvas until reload" on iPhone 15 Safari).
  const scene = useMemo(() => cachedScene.clone(true), [cachedScene])

  useEffect(() => {
    // Center & scale only — the GLB is already clean (no pearl/decoration).
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3(); box.getCenter(center)
    const size = new THREE.Vector3(); box.getSize(size)
    scene.position.set(-center.x, -center.y, -center.z)

    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) {
      const w = window.innerWidth
      const target = w <= 480 ? 1.4 : w <= 768 ? 1.6 : w <= 1024 ? 2.0 : 2.5
      const k = target / maxDim
      scene.scale.setScalar(k)
    }
    scene.rotation.x = Math.PI
    startRef.current = performance.now()

    // Sphere just mounted with real geometry — tell ScrollTrigger to
    // recompute every trigger's offsets against the now-stable layout.
    // Without this, on first load (especially iPhone 15 Safari), some
    // triggers stayed at offsets calculated against an empty hero canvas
    // and required a manual reload to "wake up".
    requestAnimationFrame(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh()
    })
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const elapsed = (performance.now() - startRef.current) / 1000
    const introDur = 1.4

    if (elapsed < introDur) {
      const t = Math.min(1, elapsed / introDur)
      const eased = 1 - Math.pow(1 - t, 4)
      groupRef.current.position.y = (1 - eased) * 0.8
      groupRef.current.position.z = (1 - eased) * -1.5
      groupRef.current.scale.setScalar(0.6 + eased * 0.4)
    } else {
      const t = elapsed - introDur
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.08
      groupRef.current.position.z = 0
      groupRef.current.scale.setScalar(1)
    }

    // Touch devices: keep the sphere upright (no manual tilt) and spin only
    // around Y so the ring stays horizontal — same framing as the reference
    // screenshot. The hole on top of the GLB is hidden by the camera angle
    // because the scene itself was flipped 180° (rotation.x = Math.PI in the
    // setup effect), so we just need to keep rotating around Y.
    if (autoSpin) {
      groupRef.current.rotation.x = 0
      groupRef.current.rotation.z = 0
      groupRef.current.rotation.y += 0.004
    } else {
      groupRef.current.rotation.y += 0.0008
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

// Detect low-end Android (Samsung A-series, Motorola, etc) vs iPhone / iPad
// / desktop. iPhones have strong GPUs and should keep the full visual; only
// mid-range Android needs the lighter rig.
//   - iOS / iPadOS → never low-end (GPU is fine even on older models)
//   - Android with deviceMemory <= 4GB OR hardwareConcurrency <= 4 → low-end
//   - Everything else (desktop, high-end Android) → full quality
function detectLowEnd() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && navigator.maxTouchPoints > 1)
  if (isIOS) return false
  const isAndroid = /Android/.test(ua)
  if (!isAndroid) return false
  const mem = navigator.deviceMemory ?? 8        // unknown ⇒ assume strong
  const cores = navigator.hardwareConcurrency ?? 8
  return mem <= 4 || cores <= 4
}

export default function SphereHero() {
  const isTouch = typeof window !== 'undefined'
    && (matchMedia('(hover: none)').matches || matchMedia('(pointer: coarse)').matches)
  const isLowEnd = typeof window !== 'undefined' && detectLowEnd()

  // Low-end Android: ditch WebGL entirely and serve a pre-rendered MP4 loop
  // of the sphere. Hardware-decoded video runs smoothly on Mali-G52 / Adreno
  // 610, costs almost no battery, and the visual is identical to the 3D
  // render at hero size. iPhone and desktop keep the full Three.js canvas.
  if (isLowEnd) {
    return (
      <div className="sphere-hero sphere-hero--video">
        <video
          className="sphere-hero__video"
          src="/sphere-loop.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          poster="/hero.png"
        />
      </div>
    )
  }

  return (
    <div className="sphere-hero">
      <Canvas
        className="sphere-hero__canvas"
        // Cap DPR / disable MSAA only on low-end Android. iPhone keeps
        // [1, 1.8] + antialias for the polished look it can afford.
        dpr={isLowEnd ? 1 : [1, 1.8]}
        gl={{
          antialias: !isLowEnd,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        camera={{ position: [0, 0, 3.1], fov: 40, near: 0.05, far: 50 }}
      >
        {/* Low-end Android: brighter ambient + warm key to fake the IBL.
            Everywhere else: original lighting rig. */}
        <ambientLight intensity={isLowEnd ? 1.2 : 0.8} color="#fff5e0" />
        <directionalLight position={[3, 4, 3]} intensity={isLowEnd ? 2.6 : 2.0} color="#fff8ec" />
        {!isLowEnd && (
          <>
            <pointLight position={[-3, 1.5, 1.5]} intensity={3} distance={9} color="#d8b896" />
            <pointLight position={[2.5, -1, -1]} intensity={1.5} distance={7} color="#fff5e0" />
          </>
        )}
        {isLowEnd && (
          <pointLight position={[2, 2, 3]} intensity={1.5} distance={8} color="#d8b896" />
        )}

        <Suspense fallback={null}>
          <Sphere autoSpin={isTouch} isometricTilt={isTouch} />
          {/* HDR Environment kept on iPhone + desktop (good GPUs handle it).
              Only the low-end Android branch drops it. */}
          {!isLowEnd && <Environment preset="night" />}
        </Suspense>

        {!isTouch && (
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.8}
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={1.0}
            minPolarAngle={Math.PI * 0.30}
            maxPolarAngle={Math.PI * 0.58}
          />
        )}
      </Canvas>
    </div>
  )
}
