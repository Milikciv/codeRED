import { AlertTriangle, X } from 'lucide-react'

const COLORS = {
  CRITICAL: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-600 text-white' },
  HIGH:     { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-400', badge: 'bg-orange-500 text-white' },
  MEDIUM:   { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-500', badge: 'bg-yellow-500 text-white' },
}

export default function AlertCard({ alert, onDismiss }) {
  const c = COLORS[alert.priority?.toUpperCase()] ?? COLORS.MEDIUM
  return (
    <div className={`${c.bg} ${c.border} border rounded-lg p-3 flex gap-3 items-start`}>
      <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${c.icon}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
            {alert.priority?.charAt(0) + alert.priority?.slice(1).toLowerCase()} Risk
          </span>
          <span className="text-sm font-semibold text-gray-800 truncate">{alert.title}</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
      </div>
      {onDismiss && (
        <button onClick={() => onDismiss(alert.id)} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
