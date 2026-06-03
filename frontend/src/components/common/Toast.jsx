import { useEffect } from 'react'
import { Check, AlertTriangle, X, Info } from 'lucide-react'

const TYPES = {
  success: { bg: 'bg-white border-green-200', icon: <Check className="w-5 h-5 text-green-500" />, title: 'text-green-800' },
  warning: { bg: 'bg-white border-yellow-200', icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, title: 'text-yellow-800' },
  error:   { bg: 'bg-white border-red-200',   icon: <X className="w-5 h-5 text-red-500" />,           title: 'text-red-800' },
  info:    { bg: 'bg-white border-blue-200',  icon: <Info className="w-5 h-5 text-blue-500" />,        title: 'text-blue-800' },
}

export default function Toast({ type = 'success', title, message, onClose, duration = 4000 }) {
  const s = TYPES[type]

  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div className={`fixed top-5 right-5 z-50 border shadow-lg rounded-xl p-4 flex items-start gap-3 max-w-sm toast-enter ${s.bg}`}>
      <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
      <div className="flex-1">
        <div className={`font-semibold text-sm ${s.title}`}>{title}</div>
        {message && <div className="text-xs text-gray-500 mt-0.5">{message}</div>}
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
