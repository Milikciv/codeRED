import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, Info } from 'lucide-react'
import { modalBackdrop, modalPanel, reducedTransition } from '../../lib/motion'

export default function ConfirmModal({
  icon = 'warning',
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  confirmClass = 'bg-amber-500 hover:bg-amber-600 text-white',
  onCancel,
  onConfirm,
}) {
  const Icon = icon === 'info' ? Info : AlertTriangle
  const iconColor = icon === 'info' ? 'text-blue-500' : 'text-amber-500'
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      exit={prefersReducedMotion ? undefined : 'exit'}
      variants={prefersReducedMotion ? { visible: { opacity: 1, transition: reducedTransition } } : modalBackdrop}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        variants={prefersReducedMotion ? { visible: { opacity: 1, transition: reducedTransition } } : modalPanel}
      >
        <div className="flex items-start gap-3 mb-4">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            {message && <p className="text-xs text-gray-500 mt-1">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm rounded-lg font-medium ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
