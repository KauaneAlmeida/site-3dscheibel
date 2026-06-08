import { useEffect, useRef, lazy, Suspense } from 'react'

import Cursor from './components/Cursor.jsx'
import TopBar from './components/TopBar.jsx'
import Loader from './components/Loader.jsx'
import Progress from './components/Progress.jsx'

import SectionHero from './sections/SectionHero.jsx'
import SectionSilence from './sections/SectionSilence.jsx'
import SectionApp from './sections/SectionApp.jsx'
import SectionScience from './sections/SectionScience.jsx'
import SectionScreens from './sections/SectionScreens.jsx'
import SectionPartners from './sections/SectionPartners.jsx'
import SectionCTA from './sections/SectionCTA.jsx'
import Marquee from './sections/Marquee.jsx'

import { useScrollProgress } from './hooks/useScrollProgress.js'
import { useLenis } from './hooks/useLenis.js'
import { IS_ANDROID } from './lib/isAndroid.js'

// Lazy so the orb's Three.js + drei Environment code splits into a chunk that
// Android (which doesn't render the orb) never downloads or parses.
const JourneyOrb = lazy(() => import('./components/JourneyOrb.jsx'))

export default function App() {
  const progressRef = useRef({ value: 0 })
  const { progress } = useScrollProgress()
  const scrolledRef = useRef(false)

  // Lenis writes smooth scroll progress directly into progressRef (zero React state, zero lag).
  useLenis(progressRef)

  // Only toggle the body class when crossing the threshold, not on every
  // re-render — avoids hitting the DOM each time `progress` updates.
  useEffect(() => {
    const shouldScroll = progress > 0.04
    if (shouldScroll === scrolledRef.current) return
    scrolledRef.current = shouldScroll
    document.body.classList.toggle('scrolled', shouldScroll)
  }, [progress])

  return (
    <>
      <Loader />
      <TopBar />
      <Progress value={progress} />
      {/* JourneyOrb is a 2nd WebGL context that fetches a remote HDR, builds a
          PMREM and renders at 60fps continuously. On Android it competes with
          the hero video for the GPU and was the main cause of the hero freeze,
          so it's desktop/iOS only. */}
      {IS_ANDROID ? null : (
        <Suspense fallback={null}>
          <JourneyOrb />
        </Suspense>
      )}

      <main className="scroll-stack">
        <SectionHero />
        <Marquee words={['recuperação','escuta','evidência','tempo','cuidado']} />
        <SectionSilence />
        <SectionScience />
        <SectionApp />
        <SectionScreens />
        <SectionPartners />
        <SectionCTA />
      </main>

      <Cursor />
    </>
  )
}
