import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PhoneMock from '../components/PhoneMock.jsx'
import { IS_ANDROID } from '../lib/isAndroid.js'
gsap.registerPlugin(ScrollTrigger)

/**
 * Section 04 — "O Aplicativo" (revelação)
 * Pinned section: phone mockup centralized + tilts in 3D as you scroll.
 * Levitates with infinite float.
 */
export default function SectionApp() {
  const root = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Android skips ONLY the pin (the long pin was the scroll-jank culprit),
      // but still runs the reveal/float animations so the phone enters with the
      // same motion as everywhere else instead of popping in static.
      const isMobile = window.innerWidth <= 768
      if (!IS_ANDROID) {
        // Pin the section while user scrolls through the reveal.
        // anticipatePin + invalidateOnRefresh prevent layout flicker on resize
        // and on Lenis smooth-scroll edge cases.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: isMobile ? '+=120%' : '+=100%',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      }

      // Phone enters from below, tilts during scroll. On Android (no pin) the
      // trigger window is anchored to the section scrolling past the viewport.
      gsap.fromTo('.app-phone', {
        y: 200, opacity: 0, rotateX: 25, scale: 0.85,
      }, {
        scrollTrigger: {
          trigger: root.current,
          start: IS_ANDROID ? 'top 85%' : 'top top',
          end: IS_ANDROID ? 'top 25%' : '+=80%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        y: 0, opacity: 1, rotateX: -8, scale: 1, ease: 'power2.out',
      })

      // Eyebrow + titles fade in early — they sit BEHIND the phone (z-index:2 vs phone's 5),
      // so as the phone rises into the centre it covers them, creating the
      // "the app emerges through the words" effect.
      gsap.fromTo('.app-title-top, .app-title-bottom',
        { y: 24, opacity: 0 },
        {
          scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
          y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: 'power3.out',
          immediateRender: false,
        }
      )

      // Fade the surrounding texts AS the phone rises — synced to the same
      // scroll range as the phone reveal. The texts are gone by the time the
      // phone reaches centre, so the device has the spotlight alone.
      gsap.to('.app-title-top, .app-title-bottom', {
        scrollTrigger: {
          trigger: root.current,
          start: IS_ANDROID ? 'top 55%' : 'top top',
          end: IS_ANDROID ? 'top 15%' : 'top -30%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        opacity: 0,
        ease: 'power2.in',
      })

      // Continuous float (infinite, separate from scroll).
      // Targeting via root.current.querySelector keeps the reference scoped to
      // this section, so cleanup on unmount can't leave stale animations.
      const inner = root.current?.querySelector('.app-phone-inner')
      if (inner) {
        gsap.to(inner, {
          y: -12,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section section-app" data-section="app">
      {/* Decorative fragment dust at the top — bridges the visual seam with the DNA section */}
      <div className="app-fragments" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className={`app-frag app-frag--${i}`} />
        ))}
      </div>
      {/* Right-side accent cluster */}
      <div className="app-fragments-right" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={`app-frag-r app-frag-r--${i}`} />
        ))}
      </div>
      <h2 className="app-title-top">Aqui está.</h2>

      <div className="app-phone">
        <div className="app-phone-inner">
          <PhoneMock variant="dashboard" image="/login.jpeg" />
        </div>
      </div>

      <h3 className="app-title-bottom">
        O cuidado<br/><em>que vive com você.</em>
      </h3>
    </section>
  )
}
