import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'

/**
 * Tiny bridge that exposes drei's R3F asset-loading progress to the Loader
 * WITHOUT pulling @react-three/drei (→ fiber → three) into the main bundle.
 *
 * It's lazy-loaded only on desktop/iOS (where the WebGL scenes actually load
 * assets). On Android nothing imports this, so the whole three.js graph stays
 * out of the eagerly-downloaded code — that's a ~700KB reduction in what an
 * Android phone has to download and parse before it can scroll.
 *
 * Renders nothing; just reports progress/active into the provided ref.
 */
export default function DreiProgress({ onUpdate }) {
  const { progress, active } = useProgress()
  useEffect(() => { onUpdate(progress, active) }, [progress, active, onUpdate])
  return null
}
