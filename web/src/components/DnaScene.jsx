import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

useGLTF.preload('/dna.glb', undefined, undefined, (loader) => {
  loader.setMeshoptDecoder(MeshoptDecoder)
})

function Dna({ progressRef }) {
  const outerRef = useRef()  // position + tilt (constant)
  const innerRef = useRef()  // scroll-driven rotation around DNA's own center
  const { scene: cachedScene, animations } = useGLTF('/dna.glb', undefined, undefined, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder)
  })

  // Clone the cached scene per instance so HMR / remounts don't re-mutate
  // the shared cached object (which would compound transforms and dispose
  // textures on the cached version, breaking re-mounts).
  const scene = useMemo(() => cachedScene.clone(true), [cachedScene])

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene])
  const animDuration = useMemo(() => {
    if (!animations?.length) return 0
    return Math.max(...animations.map((c) => c.duration))
  }, [animations])

  useEffect(() => {
    scene.position.set(0, 0, 0)
    scene.scale.setScalar(1)
    scene.rotation.set(0, 0, 0)
    scene.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3(); box.getCenter(center)
    const size = new THREE.Vector3(); box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    // Target world-units for the longest dimension. Bigger = more screen presence.
    const s = maxDim > 0 ? 6.5 / maxDim : 1

    scene.scale.setScalar(s)
    scene.position.set(-center.x * s, -center.y * s, -center.z * s)

    const gold = new THREE.MeshPhysicalMaterial({
      color: '#e8c179',
      metalness: 1.0,
      roughness: 0.22,
      clearcoat: 0.6,
      clearcoatRoughness: 0.12,
      emissive: '#2a1808',
      emissiveIntensity: 0.18,
    })
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material = gold
      }
    })

    animations.forEach((clip) => {
      const action = mixer.clipAction(clip)
      action.play()
      action.setLoop(THREE.LoopRepeat, Infinity)
    })

    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(scene)
      gold.dispose()
    }
  }, [scene, animations, mixer])

  // Pure scroll-driven: nothing moves when not scrolling.
  useFrame(() => {
    if (!innerRef.current || !outerRef.current) return
    const p = progressRef?.current?.value ?? 0

    if (animDuration > 0) {
      mixer.setTime(p * animDuration)
    }

    // DNA travels vertically with scroll — but range is constrained so it
    // never leaves the frame. Total travel = 3 units (subtle, always visible).
    outerRef.current.position.x = -0.5
    outerRef.current.position.y = -2.5 + p * 3

    // No spin — keeps DNA visually anchored. Avoids the side-swing caused
    // by Y-rotation combined with the outer Z-tilt.
    innerRef.current.rotation.y = 0
  })

  return (
    // Tilt wrapper: applies the visual lean LAST, so the inner spin happens
    // around DNA's true vertical axis. Z rotation here = visual tilt only.
    <group rotation={[0, 0, 0.45]}>
      <group ref={outerRef} position={[-0.5, -2.5, 0]} rotation={[Math.PI, 0, 0]}>
        <group ref={innerRef}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  )
}

/**
 * CameraRig — scroll-driven camera that follows the DNA model.
 *
 * Reads progressRef.current.value (0..1) and tweens the camera position so the
 * viewer feels like they're traveling alongside the helix as they scroll. We
 * keep the visual identity intact: same fov, same lookAt, same overall framing —
 * only the viewpoint slides smoothly.
 *
 * Damping (lerp 0.06) absorbs scroll jitter and gives that velvet "follow" feel
 * even when the user scrolls abruptly.
 */
function CameraRig({ progressRef }) {
  const { camera } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame(() => {
    const p = progressRef?.current?.value ?? 0

    // Camera ORBITS the DNA: stays at a constant distance, but the angle
    // around the helix changes with scroll. The model itself appears still
    // — what changes is the viewpoint. This is the "observer walking around
    // a sculpture" feel, not "flying through the scene".
    const RADIUS = 5.0
    // Small arc only — viewpoint shifts ±15° around the DNA, no full orbit feel.
    const angle = (p - 0.5) * 0.5    // -0.25 to +0.25 rad ≈ ±14°
    const camX = Math.sin(angle) * RADIUS
    const camZ = Math.cos(angle) * RADIUS

    target.set(camX, 0, camZ)
    lookTarget.set(0, 0, 0)

    camera.position.lerp(target, 0.06)
    camera.lookAt(lookTarget)
  })

  return null
}

export default function DnaScene({ progressRef }) {
  return (
    <Canvas
      className="dna-scene__canvas"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      camera={{ position: [0, 0, 5], fov: 32, near: 0.05, far: 50 }}
    >
      <ambientLight intensity={0.55} color="#fff5e0" />
      <directionalLight position={[3, 4, 4]} intensity={1.8} color="#fff8ec" />
      <pointLight position={[-3, 2, 2]} intensity={2.2} distance={10} color="#d8b896" />
      <pointLight position={[2.5, -2, 1]} intensity={1.4} distance={8} color="#fff5e0" />
      <Suspense fallback={null}>
        <Dna progressRef={progressRef} />
        <CameraRig progressRef={progressRef} />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  )
}
