import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Home, TrendingUp, Droplets, MapPin,
  Settings, HelpCircle, LogOut
} from 'lucide-react'

const HSA_NAV = [
  { to: '/hsa/dashboard',   icon: Home,       label: 'Home' },
  { to: '/hsa/forecasting', icon: TrendingUp,  label: 'Forecasting' },
  { to: '/hsa/allocation',  icon: Droplets,    label: 'Blood Allocation' },
  { to: '/hsa/hotspots',    icon: MapPin,      label: 'Hotspots' },
]

const HOSPITAL_NAV = [
  { to: '/hospital/dashboard', icon: Home,     label: 'Home' },
  { to: '/hospital/request',   icon: Droplets, label: 'Request Blood' },
  { to: '/hospital/my-requests', icon: TrendingUp, label: 'My Requests' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = user?.role === 'HSA' ? HSA_NAV : HOSPITAL_NAV

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-44 min-h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2">
        <div className="w-7 h-7 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
            <path d="M12 2C12 2 4 10 4 15a8 8 0 0016 0C20 10 12 2 12 2Z"
                  fill="#C41230" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight">
          <span className="text-gray-800">code</span>
          <span className="text-primary">RED</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-500'}`}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-gray-100 pt-2">
        <NavLink
          to={user?.role === 'HSA' ? '/hsa/settings' : '/hospital/settings'}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          Settings
        </NavLink>
        <NavLink
          to={user?.role === 'HSA' ? '/hsa/help' : '/hospital/help'}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <HelpCircle className="w-4 h-4 text-gray-500" />
          Help &amp; Support
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 text-gray-500" />
          Logout
        </button>
      </div>
    </aside>
  )
}
