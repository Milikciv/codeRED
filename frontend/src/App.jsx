import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'

// HSA pages
import HsaDashboard from './pages/hsa/Dashboard'
import Forecasting from './pages/hsa/Forecasting'
import BloodAllocation from './pages/hsa/BloodAllocation'
import Hotspots from './pages/hsa/Hotspots'

// Hospital pages
import HospitalDashboard from './pages/hospital/Dashboard'
import RequestBlood from './pages/hospital/RequestBlood'
import MyRequests from './pages/hospital/MyRequests'

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'HSA'
    ? <Navigate to="/hsa/dashboard" replace />
    : <Navigate to="/hospital/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* HSA routes */}
          <Route path="/hsa/dashboard" element={
            <ProtectedRoute requiredRole="HSA"><HsaDashboard /></ProtectedRoute>
          } />
          <Route path="/hsa/forecasting" element={
            <ProtectedRoute requiredRole="HSA"><Forecasting /></ProtectedRoute>
          } />
          <Route path="/hsa/allocation" element={
            <ProtectedRoute requiredRole="HSA"><BloodAllocation /></ProtectedRoute>
          } />
          <Route path="/hsa/hotspots" element={
            <ProtectedRoute requiredRole="HSA"><Hotspots /></ProtectedRoute>
          } />

          {/* Hospital routes */}
          <Route path="/hospital/dashboard" element={
            <ProtectedRoute requiredRole="HOSPITAL_STAFF"><HospitalDashboard /></ProtectedRoute>
          } />
          <Route path="/hospital/request" element={
            <ProtectedRoute requiredRole="HOSPITAL_STAFF"><RequestBlood /></ProtectedRoute>
          } />
          <Route path="/hospital/my-requests" element={
            <ProtectedRoute requiredRole="HOSPITAL_STAFF"><MyRequests /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
