import { useAuth } from '../../context/AuthContext'
import { ChevronDown } from 'lucide-react'

export default function PageBanner({ title, subtitle }) {
  const { user } = useAuth()

  return (
    <div className="relative bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-gray-100 overflow-hidden"
         style={{ minHeight: 130 }}>

      {/* Singapore skyline illustration strip (CSS art) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/60 to-white/0" />
        {/* MBS silhouette */}
        <div className="absolute bottom-0 left-1/3 w-32 h-16 flex items-end gap-1 opacity-20">
          <div className="w-4 h-10 bg-blue-400 rounded-t" />
          <div className="w-4 h-14 bg-blue-400 rounded-t" />
          <div className="w-4 h-12 bg-blue-400 rounded-t" />
          <div className="absolute top-0 left-0 right-0 h-3 bg-blue-300 rounded" style={{top: '-6px'}} />
        </div>
        {/* Gardens by the Bay supertrees */}
        <div className="absolute bottom-0 right-48 flex items-end gap-2 opacity-20">
          {[28, 34, 30].map((h, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-8 h-3 bg-pink-400 rounded-full -mb-1" />
              <div className="w-1.5 bg-pink-300 rounded" style={{ height: h }} />
            </div>
          ))}
        </div>
        {/* Singapore Flyer */}
        <div className="absolute bottom-4 right-72 w-16 h-16 border-4 border-blue-300/40 rounded-full opacity-30" />
      </div>

      {/* Content */}
      <div className="relative px-6 pt-4 pb-3">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>

      {/* User chip — top right */}
      {user && (
        <div className="absolute top-4 right-5 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary text-xs font-bold">
            {user.name?.charAt(0)}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">{user.hospitalName}</div>
          </div>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      )}
    </div>
  )
}
