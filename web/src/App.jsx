import { useEffect, useRef } from 'react'

import Cursor from './components/Cursor.jsx'
import TopBar from './components/TopBar.jsx'
import Loader from './components/Loader.jsx'
import JourneyOrb from './components/JourneyOrb.jsx'
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

// TEMP DIAGNOSTIC: skip the JourneyOrb (Three.js Canvas + GSAP ticker every
// frame) on Android. If scroll becomes fluid only after this, the orb is a
// contributor and we'll need a lighter mobile variant.
const IS_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

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
      {IS_ANDROID ? null : <JourneyOrb />}

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
