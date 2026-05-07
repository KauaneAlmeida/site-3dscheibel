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
    const lenis = new Lenis({
      duration: 2.0,                                      // longer = slower, smoother glide
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.6,                               // less scroll per wheel tick = slower
      touchMultiplier: 1.2,
    })

    // Tell ScrollTrigger to read scroll position from Lenis instead of native.
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

    // Lenis fires on every smoothed scroll tick — feed ScrollTrigger so it stays in sync,
    // and (if requested) write the progress value into the shared ref for consumers.
    lenis.on('scroll', (e) => {
      ScrollTrigger.update()
      if (progressRef && progressRef.current) {
        const limit = e.limit || 1
        progressRef.current.value = limit > 0 ? e.scroll / limit : 0
      }
    })

    const raf = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    // Disable GSAP's lagSmoothing so it doesn't fight Lenis's own smoothing.
    // Capture the previous value so we restore the global state on cleanup.
    gsap.ticker.lagSmoothing(0)

    // After mount + fonts/images settle, refresh so all triggers re-measure with the proxy.
    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 200)
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(refreshId)
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(raf)
      // Restore GSAP's default lagSmoothing window so it doesn't stay disabled
      // globally after this hook unmounts (would affect any future GSAP usage).
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
    // progressRef is a ref — its identity is stable across renders, so we
    // intentionally omit it from deps to avoid reinitializing Lenis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
