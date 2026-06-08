import { forwardRef } from 'react'

// The fill is updated imperatively by useScrollProgress (via ref) so the bar
// animates every frame without re-rendering React.
const Progress = forwardRef(function Progress(_props, ref) {
  return (
    <div className="progress">
      <div ref={ref} className="progress__fill" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
})

export default Progress
