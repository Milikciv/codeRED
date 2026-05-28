import { useAuth } from '../../context/AuthContext'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function PageBanner({ title, subtitle, breadcrumb, isHome }) {
  const { user } = useAuth()

  return (
    <div className="relative overflow-hidden flex-shrink-0">
      {/* Banner image — natural height, no cropping */}
      <img
        src={isHome ? '/banner-home.jpg' : '/banner-page.png'}
        alt=""
        className="w-full block"
        draggable={false}
      />


      {/* Content */}
      <div className={`absolute inset-0 z-10 flex flex-col ${isHome ? 'justify-end pb-6 pl-[25%]' : 'justify-center px-8'}`}>
        {breadcrumb && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === breadcrumb.length - 1 ? 'text-gray-500' : 'text-gray-400'}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5 max-w-md">{subtitle}</p>
        )}
        <div className="w-10 h-0.5 bg-primary mt-2 rounded" />
      </div>

      {/* User chip — fixed top right, always visible */}
      {user && (
        <div className="fixed top-3 right-5 z-50 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-md">
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
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
