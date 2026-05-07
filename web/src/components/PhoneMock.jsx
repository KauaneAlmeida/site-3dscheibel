/**
 * Pure CSS/SVG iPhone-style mockup placeholder.
 * Three variants matching app screens: dashboard, journal, protocol.
 * Optional `image` prop overrides the synthetic content with a real screenshot.
 * Optional `video` prop overrides with a looping muted video.
 */
export default function PhoneMock({ variant = 'dashboard', label = '', image, imageAlt = '', video }) {
  return (
    <div className={`phone phone--${variant}`}>
      <div className="phone__notch" />
      <div className="phone__screen">
        {video ? (
          <video
            className="phone__video"
            src={video}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : image ? (
          <img src={image} alt={imageAlt} className="phone__image" />
        ) : (
          <>
            {variant === 'dashboard' && <ScreenDashboard />}
            {variant === 'journal' && <ScreenJournal />}
            {variant === 'protocol' && <ScreenProtocol />}
          </>
        )}
      </div>
      {label && <div className="phone__label">{label}</div>}
    </div>
  )
}

function ScreenDashboard() {
  return (
    <div className="ph-screen">
      <div className="ph-row ph-row--header">
        <div>
          <div className="ph-greet">Bom dia,</div>
          <div className="ph-name">Helena</div>
        </div>
        <div className="ph-avatar" />
      </div>
      <div className="ph-card ph-card--hero">
        <div className="ph-card__label">RITMO DE HOJE</div>
        <div className="ph-card__big">Calmo</div>
        <svg viewBox="0 0 200 40" className="ph-wave">
          <path d="M0 20 Q 25 5, 50 20 T 100 20 T 150 20 T 200 20" stroke="currentColor" fill="none" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="ph-grid">
        <div className="ph-stat"><span className="ph-stat__num">7h 12m</span><span className="ph-stat__lbl">Sono</span></div>
        <div className="ph-stat"><span className="ph-stat__num">3 / 4</span><span className="ph-stat__lbl">Doses</span></div>
      </div>
      <div className="ph-list">
        <div className="ph-list__item"><span className="dot" /> Diário matinal</div>
        <div className="ph-list__item"><span className="dot" /> Caminhada leve</div>
      </div>
    </div>
  )
}

function ScreenJournal() {
  return (
    <div className="ph-screen">
      <div className="ph-row ph-row--header">
        <div className="ph-name">Diário</div>
        <div className="ph-pill">Hoje</div>
      </div>
      <div className="ph-question">Como você está se sentindo?</div>
      <div className="ph-mood-row">
        {['😊','🙂','😐','😔','😢'].map((e,i) => (
          <div key={i} className={`ph-mood ${i===1 ? 'is-active' : ''}`}>{e}</div>
        ))}
      </div>
      <div className="ph-card ph-card--quote">
        “Hoje me senti mais leve. A respiração ajuda.”
      </div>
      <div className="ph-tag-row">
        <span className="ph-tag">Sono bom</span>
        <span className="ph-tag">Energia</span>
        <span className="ph-tag">Esperança</span>
      </div>
    </div>
  )
}

function ScreenProtocol() {
  return (
    <div className="ph-screen">
      <div className="ph-row ph-row--header">
        <div className="ph-name">Protocolo</div>
        <div className="ph-pill">Semana 3</div>
      </div>
      <div className="ph-progress">
        <div className="ph-progress__bar"><div className="ph-progress__fill" /></div>
        <div className="ph-progress__txt">42% concluído</div>
      </div>
      <div className="ph-step done">
        <span className="ph-step__check">✓</span>
        <div><div className="ph-step__title">Avaliação inicial</div><div className="ph-step__sub">Concluído</div></div>
      </div>
      <div className="ph-step active">
        <span className="ph-step__check">●</span>
        <div><div className="ph-step__title">Adaptação medicação</div><div className="ph-step__sub">Em curso</div></div>
      </div>
      <div className="ph-step">
        <span className="ph-step__check">○</span>
        <div><div className="ph-step__title">Reavaliação</div><div className="ph-step__sub">14 dias</div></div>
      </div>
    </div>
  )
}
