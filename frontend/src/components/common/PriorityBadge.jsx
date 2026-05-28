const MAP = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
}

export default function PriorityBadge({ priority }) {
  const p = priority?.toUpperCase()
  return <span className={MAP[p] ?? 'badge-low'}>{priority}</span>
}
