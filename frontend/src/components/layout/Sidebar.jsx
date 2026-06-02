import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Home, TrendingUp, Droplets, MapPin, ArrowRightLeft,
  Settings, HelpCircle, LogOut, Users, Bell, CalendarDays, Send, Map,
  ChevronsLeft, ChevronsRight
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

const SRC_NAV = [
  { to: '/src/home',              icon: Home,        label: 'Home' },
  { to: '/src/alerts',            icon: Bell,        label: 'Alerts from HSA', badge: 4 },
  { to: '/src/donor-information', icon: Users,       label: 'Donor Information' },
  { to: '/src/drive-planning',    icon: Map,         label: 'Drive Planning' },
  { to: '/src/donation-drives',   icon: CalendarDays, label: 'Donation Drives' },
  { to: '/src/donor-outreach',    icon: Send,        label: 'Donor Outreach' },
]

export default function Sidebar({ open = true, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = user?.role === 'SRC_STAFF'
    ? SRC_NAV
    : user?.role === 'HSA'
    ? HSA_NAV
    : user?.role === 'HOSPITAL_ADMIN'
    ? HOSPITAL_ADMIN_NAV
    : HOSPITAL_NAV

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 overflow-hidden transition-all duration-200 ${open ? 'w-52' : 'w-14'}`}
    >
      {/* Logo + toggle */}
      <div className="px-4 py-4 flex-shrink-0 flex items-center justify-between min-w-0">
        {open && (
          <img src="/logo.jpg" alt="codeRED" className="h-10 w-auto object-contain" draggable={false} />
        )}
        <button
          onClick={onToggle}
          className={`p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0 ${!open ? 'mx-auto' : ''}`}
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {open ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-shrink-0 px-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            title={!open ? label : undefined}
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
                {open && <span className="flex-1 whitespace-nowrap">{label}</span>}
                {open && badge != null && (
                  <span className="ml-auto min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-gray-100 flex-shrink-0" />

      {/* Settings / Help */}
      <div className="flex-shrink-0 px-2 space-y-0.5">
        <button title={!open ? 'Settings' : undefined} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Settings className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {open && 'Settings'}
        </button>
        <button title={!open ? 'Help & Support' : undefined} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          <HelpCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {open && 'Help & Support'}
        </button>
        <button
          onClick={handleLogout}
          title={!open ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {open && 'Logout'}
        </button>
      </div>

      {/* Spacer pushes image to bottom */}
      <div className="flex-1" />

      {/* Bottom illustration — only shown when expanded */}
      {open && (
        <img
          src="/sidebar.jpg"
          alt=""
          className="w-full object-cover object-top block flex-shrink-0"
          draggable={false}
        />
      )}
    </aside>
  )
}
