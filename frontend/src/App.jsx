import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'

// HSA pages
import HsaDashboard from './pages/hsa/Dashboard'
import Forecasting from './pages/hsa/Forecasting'
import BloodTypeAnalytics from './pages/hsa/forecasting/BloodTypeAnalytics'
import AlertsToSRC from './pages/hsa/AlertsToSRC'

// SRC hotspot pages
import Hotspots from './pages/src/hotspots/Hotspots'
import HotspotInsights from './pages/src/hotspots/Insights'
import BloodbankPerformance from './pages/src/hotspots/BloodbankPerformance'
import DonorMap from './pages/src/hotspots/DonorMap'

// SRC pages
import SRCHome from './pages/src/SRCHome'
import AlertsFromHSA from './pages/src/AlertsFromHSA'
import DonorInformation from './pages/src/DonorInformation'
import DrivePlanning from './pages/src/DrivePlanning'
import DonationDrives from './pages/src/DonationDrives'
import DriveEdit from './pages/src/DriveEdit'
import DonorOutreach from './pages/src/DonorOutreach'
import UserManagement from './pages/UserManagement'

function ProtectedRoute({ children, requiredRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (requiredRoles && !requiredRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin/users" replace />
  if (user.role === 'HSA') return <Navigate to="/hsa/dashboard" replace />
  if (user.role === 'SRC_STAFF') return <Navigate to="/src/home" replace />
  return <Navigate to="/login" replace />
}

function Admin({ children }) {
  return <ProtectedRoute requiredRoles={['ADMIN']}>{children}</ProtectedRoute>
}

function HSA({ children }) {
  return <ProtectedRoute requiredRoles={['HSA']}>{children}</ProtectedRoute>
}

function SRC({ children }) {
  return <ProtectedRoute requiredRoles={['SRC_STAFF']}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin routes */}
          <Route path="/admin/users" element={<Admin><UserManagement /></Admin>} />

          {/* HSA routes */}
          <Route path="/hsa/dashboard"   element={<HSA><HsaDashboard /></HSA>} />
          <Route path="/hsa/forecasting" element={<HSA><Forecasting /></HSA>} />
          <Route path="/hsa/forecasting/blood-type-analytics" element={<HSA><BloodTypeAnalytics /></HSA>} />
          <Route path="/hsa/alerts"      element={<HSA><AlertsToSRC /></HSA>} />

          {/* SRC routes */}
          <Route path="/src/home"              element={<SRC><SRCHome /></SRC>} />
          <Route path="/src/alerts"            element={<SRC><AlertsFromHSA /></SRC>} />
          <Route path="/src/donor-information" element={<SRC><DonorInformation /></SRC>} />
          <Route path="/src/drive-planning"    element={<SRC><DrivePlanning /></SRC>} />
          <Route path="/src/donation-drives"   element={<SRC><DonationDrives /></SRC>} />
          <Route path="/src/edit-drive"         element={<SRC><DriveEdit /></SRC>} />
          <Route path="/src/donor-outreach"    element={<SRC><DonorOutreach /></SRC>} />
          <Route path="/src/hotspots"                        element={<SRC><Hotspots /></SRC>} />
          <Route path="/src/hotspots/map"                   element={<SRC><DonorMap /></SRC>} />
          <Route path="/src/hotspots/insights"              element={<SRC><HotspotInsights /></SRC>} />
          <Route path="/src/hotspots/bloodbank-performance" element={<SRC><BloodbankPerformance /></SRC>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
