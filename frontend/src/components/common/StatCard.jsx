export default function StatCard({ icon, label, value, sub, linkText, onLink, highlight }) {
  return (
    <div className="card p-4 flex gap-3">
      {icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-red-100' : 'bg-orange-50'}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xs text-gray-500 font-medium">{label}</div>
        <div className={`text-xl sm:text-2xl font-bold mt-0.5 ${highlight ? 'text-primary' : 'text-gray-900'}`}>{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
        {linkText && (
          <button onClick={onLink} className="text-xs text-primary font-medium mt-1 hover:underline flex items-center gap-0.5">
            {linkText} →
          </button>
        )}
      </div>
    </div>
  )
}
