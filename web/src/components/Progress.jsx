export default function Progress({ value }) {
  return (
    <div className="progress">
      <div className="progress__fill" style={{ transform: `scaleX(${value})` }} />
    </div>
  )
}
