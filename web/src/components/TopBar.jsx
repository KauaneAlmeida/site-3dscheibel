import { useEffect, useState } from 'react'

const NAV = [
  { label: 'INÍCIO',      target: '[data-section="hero"]' },
  { label: 'O APP',       target: '[data-section="app"]' },
  { label: 'EXPERIÊNCIA', target: '[data-section="screens"]' },
  { label: 'ACESSO',      target: '[data-section="cta"]' },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)

  // Lock body scroll while the menu is open so background doesn't drift.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Close on Escape — small UX fix that's expected on overlays.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const goTo = (selector) => {
    const el = document.querySelector(selector)
    if (!el) return
    setOpen(false)
    // Sections inside pinned containers (Science, App) sit inside .pin-spacer
    // wrappers added by ScrollTrigger. Use the wrapper if present so we land
    // at the right scroll position respecting the pin height.
    const wrapper = el.closest('.pin-spacer') || el
    const top = wrapper.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <>
      <header className="topbar topbar--minimal">
        <div className="topbar__left">
          <a href="#home" className="topbar__brand">
            <span className="topbar__logo-text">Scheibel</span>
          </a>
        </div>

        <div className="topbar__right">
          <button
            className="topbar__menu-btn"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <nav className={`nav-overlay ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <button
          className="nav-overlay__close"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        >
          <span aria-hidden="true">✕</span>
        </button>

        <ul className="nav-overlay__list">
          {NAV.map((item, i) => (
            <li key={item.label} className="nav-overlay__item" style={{ '--i': i }}>
              <button
                className="nav-overlay__link"
                onClick={() => goTo(item.target)}
                tabIndex={open ? 0 : -1}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-overlay__foot">
          <div className="nav-overlay__brand">
            <div className="nav-overlay__brand-name">SCHEIBEL</div>
            <div className="nav-overlay__brand-tag">comece agora</div>
          </div>
          <div className="nav-overlay__social">
            <div className="nav-overlay__social-label">REDES</div>
            <div className="nav-overlay__social-row">
              <button className="nav-overlay__pill" onClick={() => goTo('[data-section="cta"]')}>
                {'{ SOLICITAR ACESSO }'}
              </button>
              <a className="nav-overlay__pill" href="mailto:contato@scheibel.com">
                {'{ FALE CONOSCO }'}
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
