// O GLB foi editado no Blender para remover a bolinha pequena fundida ao mesh.
// A bolinha visual única do site é a JourneyOrb (componente separado), que viaja no scroll.
// NÃO reintroduzir manipulação de BufferGeometry em runtime — o asset já vem limpo do GLB.

import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

useGLTF.preload('/sphere.glb', undefined, undefined, (loader) => {
  loader.setMeshoptDecoder(MeshoptDecoder)
})

function Sphere({ autoSpin = false, isometricTilt = false }) {
  const groupRef = useRef()
  const startRef = useRef(performance.now())
  const { scene } = useGLTF('/sphere.glb', undefined, undefined, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder)
  })

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

    // Small phones: lock the camera into an isometric-style angle (camera
    // looking down at ~30°) and spin only horizontally. Matches the look of
    // the user-provided reference and keeps the ring/hole framing pleasant
    // on narrow viewports where free orbit feels random.
    if (isometricTilt) {
      groupRef.current.rotation.x = -0.5  // ~28° tilt down
      groupRef.current.rotation.z = 0
    }

    if (autoSpin) {
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

export default function SphereHero() {
  // Small phones get a locked isometric tilt + auto-spin (no manual rotation).
  // Larger devices keep OrbitControls so the user can drag to rotate.
  const isSmallPhone = typeof window !== 'undefined' && window.innerWidth <= 480

  return (
    <div className="sphere-hero">
      <Canvas
        className="sphere-hero__canvas"
        dpr={[1, 1.8]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        camera={{ position: [0, 0, 3.1], fov: 40, near: 0.05, far: 50 }}
      >
        <ambientLight intensity={0.8} color="#fff5e0" />
        <directionalLight position={[3, 4, 3]} intensity={2.0} color="#fff8ec" />
        <pointLight position={[-3, 1.5, 1.5]} intensity={3} distance={9} color="#d8b896" />
        <pointLight position={[2.5, -1, -1]} intensity={1.5} distance={7} color="#fff5e0" />

        <Suspense fallback={null}>
          <Sphere autoSpin={isSmallPhone} isometricTilt={isSmallPhone} />
          <Environment preset="night" />
        </Suspense>

        {!isSmallPhone && (
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
            touches={{ ONE: 1 /* THREE.TOUCH.ROTATE */ }}
          />
        )}
      </Canvas>
    </div>
  )
}
