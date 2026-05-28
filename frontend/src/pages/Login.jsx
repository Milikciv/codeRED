import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'

const ROLES = [
  { value: 'HSA', label: 'Health Sciences Authority', icon: '🏛️' },
  { value: 'HOSPITAL_STAFF', label: 'Hospital Staff', icon: '🏥' },
]

const CREDENTIALS = {
  HSA: { email: 'winnie@hsa.gov.sg', password: 'password123' },
  HOSPITAL_STAFF: { email: 'winnieKoh@SGH.sg', password: 'password123' },
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
      navigate(user.role === 'HSA' ? '/hsa/dashboard' : '/hospital/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Decorative illustrations (CSS) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left decor */}
        <div className="absolute top-8 left-8 w-3 h-3 bg-blue-400 rotate-45 opacity-60" />
        <div className="absolute top-20 left-24 text-pink-400 text-2xl select-none">❤️</div>
        <div className="absolute top-6 right-1/3 text-blue-300 text-xl select-none">✛</div>

        {/* Singapore Flyer (top right) */}
        <div className="absolute top-6 right-48 w-28 h-28 border-4 border-blue-300/50 rounded-full" />
        {/* Gardens by the Bay supertrees */}
        <div className="absolute top-4 right-10 flex items-end gap-3">
          {[70, 90, 75].map((h, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-10 h-4 bg-pink-400/70 rounded-full -mb-1" />
              <div className="w-2 bg-pink-400/70 rounded" style={{ height: h }} />
            </div>
          ))}
        </div>

        {/* Left side illustration area */}
        <div className="absolute left-0 bottom-0 w-64 h-80 opacity-20">
          <div className="w-full h-full bg-gradient-to-tr from-red-100 to-transparent rounded-tr-full" />
        </div>

        {/* Bottom flowers */}
        <div className="absolute bottom-4 left-16 text-yellow-400 text-3xl select-none">🌸</div>
        <div className="absolute bottom-8 left-4 text-blue-300 text-2xl select-none">✛</div>
        <div className="absolute bottom-2 right-24 text-yellow-300 text-2xl select-none">🌼</div>
        <div className="absolute bottom-6 right-6 text-red-400 text-2xl select-none">❤️</div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm">
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
                <span className="text-base">{role.icon}</span>
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
                      <span>{r.icon}</span>
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
