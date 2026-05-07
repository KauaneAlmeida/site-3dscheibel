import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis ↔ GSAP ScrollTrigger integration.
 *
 * Critical: Lenis virtualises the scroll, so ScrollTrigger needs a `scrollerProxy`
 * pointing at document.documentElement, otherwise pin offsets / pin-spacing get
 * miscalculated and pinned sections collapse mid-scroll (the "next section bleeds
 * up while the pinned one is still active" bug).
 *
 * `progressRef` (optional): when provided, we write the smooth scroll progress
 * (0..1) directly into `progressRef.current.value` on every Lenis tick. This is
 * the FAST path consumers (like JourneyOrb) should use — it bypasses React state
 * entirely so the orb gets sub-frame-accurate scroll progress with zero re-renders.
 */
export function useLenis(progressRef) {
  useEffect(() => {
    // Mobile/touch devices: skip Lenis entirely and use the browser's native
    // scroll. iOS Safari's WebKit scroll engine + Three.js OrbitControls play
    // nicely together at the OS level (different gesture layers), but Lenis's
    // virtualised scroll fights Three.js for pointer events and ends up
    // breaking either the scroll OR the rotation. Native scroll on touch
    // restores both at once. Desktop keeps the smooth-scroll experience.
    const isTouch = matchMedia('(hover: none)').matches
      || matchMedia('(pointer: coarse)').matches

    if (isTouch) {
      // Native scroll path. Still feed progressRef for any consumers that
      // expect it, and force a ScrollTrigger.refresh after mount so any
      // triggers that were created before this hook ran (or against pin
      // measurements that changed when sphere.glb finished loading) get
      // their offsets recomputed against the real scroll engine.
      const onScroll = () => {
        if (progressRef && progressRef.current) {
          const h = document.documentElement.scrollHeight - window.innerHeight
          progressRef.current.value = h > 0 ? window.scrollY / h : 0
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
      const refreshId = setTimeout(() => ScrollTrigger.refresh(), 200)
      const onResize = () => ScrollTrigger.refresh()
      window.addEventListener('resize', onResize)
      window.addEventListener('orientationchange', onResize)
      return () => {
        clearTimeout(refreshId)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('orientationchange', onResize)
      }
    }

    // Desktop: full Lenis smooth scroll integrated with ScrollTrigger.
    const lenis = new Lenis({
      duration: 2.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.6,
      touchMultiplier: 1.2,
    })

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) lenis.scrollTo(value, { immediate: true })
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
      pinType: 'transform',
    })

    lenis.on('scroll', (e) => {
      ScrollTrigger.update()
      if (progressRef && progressRef.current) {
        const limit = e.limit || 1
        progressRef.current.value = limit > 0 ? e.scroll / limit : 0
      }
    })

    const raf = (time) => { lenis.raf(time * 1000) }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 200)
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(refreshId)
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
