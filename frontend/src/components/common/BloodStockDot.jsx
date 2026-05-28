export default function BloodStockDot({ pct }) {
  if (pct === null || pct === undefined) return <span className="dot-none inline-block" />
  if (pct >= 70) return <span className="dot-good inline-block" title={`${pct}%`} />
  if (pct >= 40) return <span className="dot-low inline-block" title={`${pct}%`} />
  return <span className="dot-critical inline-block" title={`${pct}%`} />
}
