import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'

// HSA pages
import HsaDashboard from './pages/hsa/Dashboard'
import Forecasting from './pages/hsa/Forecasting'
import BloodTypeAnalytics from './pages/hsa/forecasting/BloodTypeAnalytics'
import Recommendations from './pages/hsa/forecasting/Recommendations'
import BloodAllocation from './pages/hsa/BloodAllocation'
import Hotspots from './pages/hsa/Hotspots'
import HotspotInsights from './pages/hsa/hotspots/Insights'
import BloodbankPerformance from './pages/hsa/hotspots/BloodbankPerformance'
import DonorMap from './pages/hsa/hotspots/DonorMap'
import HsaRequests from './pages/hsa/Requests'

// Hospital pages
import HospitalDashboard from './pages/hospital/Dashboard'
import RequestBlood from './pages/hospital/RequestBlood'
import MyRequests from './pages/hospital/MyRequests'

// Shared pages
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
  if (user.role === 'HSA') return <Navigate to="/hsa/dashboard" replace />
  return <Navigate to="/hospital/dashboard" replace />
}

function HSA({ children }) {
  return <ProtectedRoute requiredRoles={['HSA']}>{children}</ProtectedRoute>
}

function Hospital({ children }) {
  return <ProtectedRoute requiredRoles={['HOSPITAL_STAFF', 'HOSPITAL_ADMIN']}>{children}</ProtectedRoute>
}

function AdminOnly({ children }) {
  return <ProtectedRoute requiredRoles={['HSA', 'HOSPITAL_ADMIN']}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* HSA routes */}
          <Route path="/hsa/dashboard"   element={<HSA><HsaDashboard /></HSA>} />
          <Route path="/hsa/forecasting" element={<HSA><Forecasting /></HSA>} />
          <Route path="/hsa/forecasting/blood-type-analytics" element={<HSA><BloodTypeAnalytics /></HSA>} />
          <Route path="/hsa/forecasting/recommendations"      element={<HSA><Recommendations /></HSA>} />
          <Route path="/hsa/allocation"  element={<HSA><BloodAllocation /></HSA>} />
          <Route path="/hsa/requests"    element={<HSA><HsaRequests /></HSA>} />
          <Route path="/hsa/hotspots"    element={<HSA><Hotspots /></HSA>} />
          <Route path="/hsa/hotspots/insights"              element={<HSA><HotspotInsights /></HSA>} />
          <Route path="/hsa/hotspots/bloodbank-performance" element={<HSA><BloodbankPerformance /></HSA>} />
          <Route path="/hsa/hotspots/map"                   element={<HSA><DonorMap /></HSA>} />

          {/* Hospital routes */}
          <Route path="/hospital/dashboard"   element={<Hospital><HospitalDashboard /></Hospital>} />
          <Route path="/hospital/request"     element={<Hospital><RequestBlood /></Hospital>} />
          <Route path="/hospital/my-requests" element={<Hospital><MyRequests /></Hospital>} />

          {/* User management */}
          <Route path="/hsa/users"      element={<HSA><UserManagement /></HSA>} />
          <Route path="/hospital/users" element={<AdminOnly><UserManagement /></AdminOnly>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
