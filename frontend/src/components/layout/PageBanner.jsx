import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react'

export default function PageBanner({ title, subtitle, breadcrumb, isHome, actions }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="relative flex-shrink-0">
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

      {/* Page-level actions — bottom right of banner */}
      {actions && (
        <div className="absolute bottom-4 right-5 z-10">
          {actions}
        </div>
      )}

      {/* User chip — fixed top right, always visible */}
      {user && (
        <div ref={ref} className="fixed top-3 right-5 z-50">
          <button
            onClick={() => setOpen(o => !o)}
            className="w-60 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
              {user.name?.charAt(0)}
            </div>
            <div className="leading-tight text-left min-w-0 flex-1">
              <div className="text-xs font-semibold text-gray-800 truncate">{user.name}</div>
              <div className="text-xs text-gray-500 truncate">{user.role === 'ADMIN' ? 'Admin' : user.hospitalName}</div>
            </div>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-1.5 w-full min-w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
