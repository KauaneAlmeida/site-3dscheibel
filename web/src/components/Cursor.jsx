import { useEffect, useRef } from 'react'

export default function Cursor() {
  const ringRef = useRef()
  const dotRef = useRef()
  const target = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      }
    }
    let lastInteractive = null
    const onEnter = (e) => {
      if (!ringRef.current) return
      const target = e.target?.nodeType === 1 ? e.target : null
      const isInteractive = !!target?.closest('a,button,.interactive')
      // mouseover fires for every element transition; only touch the DOM when
      // the interactive state actually flips.
      if (isInteractive === lastInteractive) return
      lastInteractive = isInteractive
      if (isInteractive) {
        ringRef.current.classList.add('hover')
        ringRef.current.style.width = '46px'
        ringRef.current.style.height = '46px'
      } else {
        ringRef.current.classList.remove('hover')
        ringRef.current.style.width = '22px'
        ringRef.current.style.height = '22px'
      }
    }
    let raf
    const tick = () => {
      ringPos.current.x += (target.current.x - ringPos.current.x) * 0.18
      ringPos.current.y += (target.current.y - ringPos.current.y) * 0.18
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  )
}
