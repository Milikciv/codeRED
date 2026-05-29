import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function PageError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertTriangle className="w-10 h-10 text-red-300 mb-3" />
      <p className="font-medium text-gray-700">Failed to load data</p>
      <p className="text-sm text-gray-400 mt-1 mb-4">The server could not be reached. Please try again.</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      )}
    </div>
  )
}
