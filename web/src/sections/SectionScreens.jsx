import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PhoneMock from '../components/PhoneMock.jsx'
gsap.registerPlugin(ScrollTrigger)

/**
 * Section 05 — "Cada gesto importa"
 * Desktop: three phone mockups arranged in a fan, converge to centre on scroll.
 * Mobile: horizontal swipe carousel (CSS scroll-snap, no GSAP transforms).
 */
const SCREENS = [
  { variant: 'journal',   label: 'DIÁRIO',   tilt: -10, dx: -22, video: '/frame-01.mp4' },
  { variant: 'dashboard', label: 'HOJE',     tilt: 0,   dx: 0,   video: '/frame-02.mp4' },
  { variant: 'protocol',  label: 'PROTOCOLO',tilt: 10,  dx: 22,  video: '/frame-03.mp4' },
]

export default function SectionScreens() {
  const root = useRef()

  useEffect(() => {
    // Decide once at mount whether we're on a touch / narrow device. The
    // ScrollTrigger refresh on resize handles ordinary breakpoint changes.
    const isMobile = window.matchMedia('(max-width: 880px)').matches

    const ctx = gsap.context(() => {
      // Title fade-in — use fromTo with immediateRender:false so a stale
      // `once: true` trigger never leaves the title invisible.
      gsap.fromTo('.screens-title',
        { y: 24, opacity: 0 },
        {
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          immediateRender: false,
        }
      )

      // Closing wedge — rises only on the way out of the section. Trigger
      // window is moved past the carousel so the wedge never covers the mocks
      // while they're still being viewed.
      gsap.fromTo('.screens-wedge',
        { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
        {
          scrollTrigger: {
            trigger: root.current,
            start: 'bottom 80%',
            end: 'bottom 20%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
          clipPath: 'polygon(0% 30%, 100% 5%, 100% 100%, 0% 100%)',
          ease: 'none',
        }
      )

      // Mobile uses native scroll-snap carousel — skip the desktop fan-out
      // GSAP transforms entirely so they don't fight the carousel layout.
      if (isMobile) return

      // Desktop only — each phone enters with its tilt, then on scroll
      // converges toward centre.
      const items = root.current?.querySelectorAll('.screens-item') ?? []
      items.forEach((item) => {
        const dx = +item.dataset.dx
        const tilt = +item.dataset.tilt
        gsap.fromTo(item,
          { x: `${dx * 1.6}vw`, opacity: 0, rotate: tilt * 1.5 },
          {
            scrollTrigger: {
              trigger: root.current,
              start: 'top 80%',
              end: 'top 10%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
            x: `${dx * 0.6}vw`, opacity: 1, rotate: tilt * 0.5, ease: 'power2.out',
          }
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section-screens" data-section="screens">
      <div className="screens-wedge" aria-hidden="true" />
      <div className="screens-head">
        <h2 className="screens-title">
          Três telas. Uma <em>relação</em>.
        </h2>
      </div>
      <div className="screens-stage">
        {SCREENS.map((s) => (
          <div
            key={s.variant}
            className="screens-item"
            data-dx={s.dx}
            data-tilt={s.tilt}
            style={{ '--tilt': `${s.tilt}deg` }}
          >
            <PhoneMock variant={s.variant} label={s.label} video={s.video} />
          </div>
        ))}
      </div>
      <div className="screens-swipe-hint" aria-hidden="true">
        ← deslize para ver →
      </div>
    </section>
  )
}
