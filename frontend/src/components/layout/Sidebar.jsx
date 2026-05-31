import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Home, TrendingUp, Droplets, MapPin, ArrowRightLeft,
  Settings, HelpCircle, LogOut, Users
} from 'lucide-react'

const HSA_NAV = [
  { to: '/hsa/dashboard',   icon: Home,             label: 'Home' },
  { to: '/hsa/forecasting', icon: TrendingUp,        label: 'Forecasting' },
  { to: '/hsa/allocation',  icon: Droplets,          label: 'Blood Allocation' },
  { to: '/hsa/requests',    icon: ArrowRightLeft,    label: 'Transfers' },
  { to: '/hsa/hotspots',    icon: MapPin,            label: 'Hotspots' },
  { to: '/hsa/users',       icon: Users,             label: 'Users' },
]

const HOSPITAL_NAV = [
  { to: '/hospital/dashboard',   icon: Home,       label: 'Home' },
  { to: '/hospital/request',     icon: Droplets,   label: 'Request Blood' },
  { to: '/hospital/my-requests', icon: TrendingUp, label: 'My Requests' },
]

const HOSPITAL_ADMIN_NAV = [
  { to: '/hospital/dashboard',   icon: Home,       label: 'Home' },
  { to: '/hospital/request',     icon: Droplets,   label: 'Request Blood' },
  { to: '/hospital/my-requests', icon: TrendingUp, label: 'My Requests' },
  { to: '/hospital/users',       icon: Users,      label: 'Users' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = user?.role === 'HSA'
    ? HSA_NAV
    : user?.role === 'HOSPITAL_ADMIN'
    ? HOSPITAL_ADMIN_NAV
    : HOSPITAL_NAV

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-44 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 flex-shrink-0">
        <img src="/logo.jpg" alt="codeRED" className="h-10 w-auto object-contain" draggable={false} />
      </div>

      {/* Main nav */}
      <nav className="flex-shrink-0 px-2 space-y-0.5">
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
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-gray-100 flex-shrink-0" />

      {/* Settings / Help */}
      <div className="flex-shrink-0 px-2 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Settings className="w-4 h-4 text-gray-500" /> Settings
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          <HelpCircle className="w-4 h-4 text-gray-500" /> Help &amp; Support
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 text-gray-500" /> Logout
        </button>
      </div>

      {/* Spacer pushes image to bottom */}
      <div className="flex-1" />

      {/* Bottom illustration — flush, no padding */}
      <img
        src="/sidebar.jpg"
        alt=""
        className="w-full object-cover object-top block flex-shrink-0"
        draggable={false}
      />
    </aside>
  )
}
