import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { businessOutline, heartOutline } from 'ionicons/icons'

const ROLES = [
  { value: 'ADMIN',         label: 'Admin',                  icon: businessOutline },
  { value: 'SRC_STAFF',     label: 'Singapore Red Cross',    icon: heartOutline   },
  { value: 'HSA',           label: 'Health Sciences Authority', icon: businessOutline },
]

const CREDENTIALS = {
  ADMIN:         { email: 'admin@codered.sg',        password: 'password123' },
  SRC_STAFF:     { email: 'winnie@redcross.org.sg', password: 'password123' },
  HSA:           { email: 'winnie@hsa.gov.sg',      password: 'password123' },
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState(ROLES[0])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showRoles, setShowRoles] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = (r) => {
    setRole(r)
    setShowRoles(false)
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'ADMIN') navigate('/admin/users')
      else navigate(user.role === 'HSA' ? '/hsa/dashboard' : '/src/home')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Full-screen background image */}
      <img
        src="/login-page.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        draggable={false}
      />
      {/* Subtle centre overlay so the form stands out */}
      <div className="absolute inset-0 bg-white/30" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Select your role</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoles(!showRoles)}
                className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-800 hover:border-gray-400 transition-colors"
              >
                <IonIcon icon={role.icon} style={{ fontSize: '1rem' }} />
                <span className="flex-1 text-left">{role.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showRoles && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <IonIcon icon={r.icon} style={{ fontSize: '1rem' }} />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={CREDENTIALS[role.value].email}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right mt-1">
              <a href="#" className="text-xs text-primary hover:underline">Forgot Password?</a>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-bold tracking-widest uppercase disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Enter'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          <a href="#" className="hover:underline">I'm not sure if I have an account</a>
        </p>

        {/* Dev hint */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500">
          <strong>Demo:</strong> Select a role above then use<br/>
          <span className="font-mono">{CREDENTIALS[role.value].email}</span> / <span className="font-mono">password123</span>
        </div>
      </div>
    </div>
  )
}
