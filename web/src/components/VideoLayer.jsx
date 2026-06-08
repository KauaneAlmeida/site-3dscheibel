import { useEffect, useRef } from 'react'

/**
 * VideoLayer — full-bleed <video> used as the Android-only replacement for the
 * heavy WebGL scenes (Saturn sphere / DNA helix). The GLB canvases are never
 * mounted on Android; this plays a pre-rendered capture of the exact same
 * motion so the user can't tell it's a video.
 *
 * Two modes:
 *   - loop  (default): autoplay + muted + loop — for the Saturn hero, which
 *     just spins on its own.
 *   - scrub: the video does NOT play on its own. `progressRef.current.value`
 *     (0..1, written by a GSAP ScrollTrigger) drives currentTime, so the helix
 *     animation is scrubbed by scroll exactly like the live DNA scene. We lerp
 *     toward the target frame each rAF so fast scrolls feel like velvet, not
 *     a hard seek.
 *
 * A poster (first frame) sits under the video so there's never an empty frame
 * if autoplay is blocked or the file is still buffering.
 */
export default function VideoLayer({
  src,
  poster,
  mode = 'loop',
  progressRef,
  className = '',
  // Fraction of the clip the scroll maps onto (0..scrubRange of duration).
  // The DNA source is a palindrome (forward then back), so we scrub ONLY the
  // forward half — otherwise the video would play its built-in return while
  // the user is still scrolling down. 0.5 = first half only.
  scrubRange = 0.5,
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (mode !== 'scrub') {
      // Loop mode — kick playback (some Androids need an explicit play()).
      const tryPlay = () => video.play().catch(() => {})
      tryPlay()
      video.addEventListener('canplay', tryPlay, { once: true })
      return () => video.removeEventListener('canplay', tryPlay)
    }

    // ── Scrub mode ──────────────────────────────────────────────────────────
    // The source is a palindrome clip (plays forward then back on its own). We
    // scrub ONLY the forward portion (0..scrubRange of duration), so scrolling
    // down always advances and scrolling up always reverses — the clip never
    // plays its built-in return on its own while the user is going down.
    let raf
    let ready = false
    let scrubEnd = 0
    const onMeta = () => {
      const dur = video.duration || 0
      scrubEnd = dur * scrubRange
      ready = dur > 0
      try { video.pause() } catch { /* ignore */ }
      video.currentTime = 0
    }
    video.addEventListener('loadedmetadata', onMeta)
    if (video.readyState >= 1) onMeta()

    const tick = () => {
      if (ready && scrubEnd > 0) {
        video.pause() // never let it play on its own — we own the playhead
        const p = Math.min(1, Math.max(0, progressRef?.current?.value ?? 0))
        const target = p * scrubEnd
        const cur = video.currentTime
        // Lerp toward the target frame — smooths abrupt scroll jumps and keeps
        // the decoder from thrashing on every tiny delta.
        const next = cur + (target - cur) * 0.22
        // Only seek when the delta is meaningful (avoids sub-frame churn).
        if (Math.abs(target - cur) > 0.01) video.currentTime = next
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      video.removeEventListener('loadedmetadata', onMeta)
    }
  }, [mode, progressRef, scrubRange])

  return (
    <video
      ref={videoRef}
      className={`video-layer ${className}`}
      src={src}
      poster={poster}
      muted
      playsInline
      // Loop (hero): the poster covers the first paint, so only fetch metadata
      // up front and let playback stream — avoids downloading + decoding the
      // whole clip during the first scroll. Scrub (DNA) needs frames buffered
      // for smooth seeking, so it keeps preload="auto".
      preload={mode === 'scrub' ? 'auto' : 'metadata'}
      loop={mode === 'loop'}
      autoPlay={mode === 'loop'}
      // Decorative — hidden from assistive tech.
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}
