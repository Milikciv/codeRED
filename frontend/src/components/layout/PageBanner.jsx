import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { ChevronDown, ChevronRight, LogOut, Menu } from 'lucide-react'
import { buttonTap, dropdownMenu, reducedTransition } from '../../lib/motion'

export default function PageBanner({ title, subtitle, breadcrumb, isHome, actions, onMenuToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
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
    <div className="flex-shrink-0">
      {/* Banner image + title overlay */}
      <div className="relative">
        {/* Mobile banner (hidden on sm+) */}
        {!isHome && (
          <img
            src="/mobile-banner.png"
            alt=""
            className="w-full block object-cover h-[140px] sm:hidden"
            draggable={false}
          />
        )}
        {/* Desktop/tablet banner (hidden on mobile for non-home; home always shows) */}
        <img
          src={isHome ? '/banner-home.jpg' : '/banner-page.png'}
          alt=""
          className={`w-full block object-cover ${
            isHome
              ? 'h-[130px] sm:h-[150px] lg:h-auto'
              : 'hidden sm:block sm:h-[100px] lg:h-auto'
          }`}
          draggable={false}
        />

        {/* Mobile hamburger — top-left of the banner */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="absolute top-2.5 left-3 z-20 lg:hidden p-2.5 bg-white/90 rounded-lg shadow-sm backdrop-blur-sm"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Content overlay */}
        <div className={`absolute inset-0 z-10 flex flex-col ${
          isHome
            ? 'justify-end pb-5 pl-4 sm:pl-[25%]'
            : 'justify-center pl-14 pr-16 sm:pl-8 sm:pr-48'
        }`}>
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="hidden sm:block text-sm text-gray-500 mt-0.5 max-w-md">{subtitle}</p>
          )}
          <div className="w-10 h-0.5 bg-primary mt-2 rounded" />
        </div>

        {/* User chip — fixed, avatar-only on mobile, full chip on sm+ */}
        {user && (
          <div ref={ref} className="fixed top-2.5 right-3 sm:top-3 sm:right-5 z-50">
            <motion.button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2 sm:px-3 py-1.5 shadow-md hover:shadow-lg transition-shadow"
              whileTap={prefersReducedMotion ? undefined : buttonTap}
            >
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                {user.name?.charAt(0)}
              </div>
              <div className="hidden sm:block leading-tight text-left min-w-0">
                <div className="text-xs font-semibold text-gray-800 truncate max-w-[130px]">{user.name}</div>
                <div className="text-xs text-gray-500 truncate max-w-[130px]">{user.role === 'ADMIN' ? 'Admin' : user.hospitalName}</div>
              </div>
              <ChevronDown className={`hidden sm:block w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {open && (
              <motion.div
                className="absolute right-0 mt-1.5 min-w-[10rem] bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden origin-top-right"
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                exit={prefersReducedMotion ? undefined : 'exit'}
                variants={prefersReducedMotion ? { visible: { opacity: 1, transition: reducedTransition } } : dropdownMenu}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Page-level actions — always below the banner */}
      {actions && (
        <div className="px-4 py-2 border-b border-gray-100 bg-white flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  )
}
