import { useEffect, useRef } from 'react'

// returns a ref { x, y, nx, ny, vx, vy } (normalized -1..1)
export function useMouse() {
  const m = useRef({ x: 0, y: 0, nx: 0, ny: 0, vx: 0, vy: 0, prevX: 0, prevY: 0 })
  useEffect(() => {
    const onMove = (e) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const x = e.clientX
      const y = e.clientY
      m.current.vx = x - m.current.prevX
      m.current.vy = y - m.current.prevY
      m.current.prevX = x
      m.current.prevY = y
      m.current.x = x
      m.current.y = y
      m.current.nx = (x / w) * 2 - 1
      m.current.ny = (y / h) * 2 - 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  return m
}
