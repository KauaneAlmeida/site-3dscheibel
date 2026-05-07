import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

export default function Loader() {
  const { progress, active } = useProgress()
  const [hide, setHide] = useState(false)

  useEffect(() => {
    // Hide as soon as we hit 100% — drei's `active` flag can sometimes never flip
    if (progress >= 100) {
      const t = setTimeout(() => setHide(true), 300)
      return () => clearTimeout(t)
    }
  }, [progress])

  // Hard guarantee: max 1.5 seconds visible
  useEffect(() => {
    const t = setTimeout(() => setHide(true), 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`loader ${hide ? 'hidden' : ''}`}>
      <div className="loader__text">Initialising consciousness…</div>
      <div className="loader__bar">
        <div className="loader__bar-fill" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <div className="loader__text" style={{ opacity: 0.6 }}>{Math.floor(progress)}%</div>
    </div>
  )
}
