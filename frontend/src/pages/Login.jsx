import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { businessOutline, heartOutline } from 'ionicons/icons'
import { motion, useReducedMotion } from 'framer-motion'

const ROLES = [
  { value: 'ADMIN',     label: 'Admin',                     icon: businessOutline },
  { value: 'SRC_STAFF', label: 'Singapore Red Cross',       icon: heartOutline   },
  { value: 'HSA',       label: 'Health Sciences Authority', icon: businessOutline },
]

const CREDENTIALS = {
  ADMIN:     { email: 'admin@codered.sg',       password: 'password123' },
  SRC_STAFF: { email: 'winnie@redcross.org.sg', password: 'password123' },
  HSA:       { email: 'winnie@hsa.gov.sg',      password: 'password123' },
}

const HEARTS = [
  { id: 0, left: '5%',  top: '15%', size: 22, color: '#C20000', opacity: 0.55, delay: 0,   dur: 6.0 },
  { id: 1, left: '12%', top: '55%', size: 14, color: '#e87878', opacity: 0.40, delay: 1.2, dur: 8.5 },
  { id: 2, left: '88%', top: '20%', size: 18, color: '#C20000', opacity: 0.50, delay: 2.4, dur: 7.2 },
  { id: 3, left: '93%', top: '60%', size: 12, color: '#f0a0a0', opacity: 0.45, delay: 0.7, dur: 9.0 },
  { id: 4, left: '7%',  top: '80%', size: 16, color: '#C20000', opacity: 0.35, delay: 3.1, dur: 7.8 },
  { id: 5, left: '85%', top: '78%', size: 20, color: '#e87878', opacity: 0.45, delay: 1.8, dur: 6.5 },
  { id: 6, left: '20%', top: '88%', size: 10, color: '#C20000', opacity: 0.30, delay: 4.0, dur: 10  },
  { id: 7, left: '78%', top: '8%',  size: 13, color: '#f0a0a0', opacity: 0.40, delay: 2.9, dur: 8.0 },
]

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const reduced    = useReducedMotion()

  const [role, setRole]           = useState(ROLES[0])
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showRoles, setShowRoles] = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [pwFocused, setPwFocused]       = useState(false)

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
      if (user.role !== role.value) {
        const actualLabel = ROLES.find(r => r.value === user.role)?.label ?? user.role
        throw Object.assign(new Error('role_mismatch'), { actualLabel })
      }
      if (user.role === 'ADMIN') navigate('/admin/users')
      else navigate(user.role === 'HSA' ? '/hsa/dashboard' : '/src/home')
    } catch (err) {
      if (err.message === 'role_mismatch') setError(`Please sign in as ${err.actualLabel}.`)
      else setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (focused) => ({
    transition: 'border-color 150ms, box-shadow 150ms, transform 150ms',
    transform: focused ? 'scale(1.01)' : 'scale(1)',
    boxShadow: focused ? '0 0 0 3px rgba(194,0,0,0.10)' : 'none',
  })

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* Background illustration */}
      <img
        src="/login-page.jpg"
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        style={{ opacity: 0.85 }}
      />

      {/* White wash */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.20)' }} />

      {/* Floating hearts */}
      {HEARTS.map((h) => (
        <motion.span
          key={h.id}
          className="absolute pointer-events-none select-none"
          style={{ left: h.left, top: h.top, fontSize: h.size, color: h.color, opacity: h.opacity }}
          animate={reduced ? {} : { y: [0, -14, 0] }}
          transition={{ duration: h.dur, delay: h.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          ♥
        </motion.span>
      ))}

      {/* Birds */}
      {[0, 1, 2].map((i) => (
        <motion.svg
          key={`bird-${i}`}
          className="absolute pointer-events-none"
          style={{ top: `${6 + i * 3.2}%` }}
          width={50 + i * 10}
          height={25 + i * 5}
          viewBox="0 0 40 20"
          fill="none"
          initial={{ x: '-6vw', opacity: 0 }}
          animate={reduced ? {} : { x: '108vw', opacity: [0, 0.7, 0.7, 0] }}
          transition={{
            duration: 26 + i * 9,
            delay: i * 9 + 3,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 18 + i * 6,
          }}
        >
          <path d="M0,10 Q10,0 20,10 Q30,0 40,10" stroke="#444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </motion.svg>
      ))}

      {/* AI glow orb behind card */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,60,60,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={reduced ? {} : { scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-sm mx-4 sm:mx-auto bg-white/90 backdrop-blur-md rounded-2xl px-5 py-7 sm:px-8 sm:py-8"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.13), 0 8px 24px rgba(194,0,0,0.10)' }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-7 sm:mb-8">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Select your role</label>
            <div className="relative">
              <motion.button
                type="button"
                onClick={() => setShowRoles(!showRoles)}
                whileHover={reduced ? {} : { y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
                whileTap={reduced ? {} : { scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                className="w-full flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg bg-white text-base sm:text-sm font-medium text-gray-800 hover:border-gray-400 transition-colors"
              >
                <IonIcon icon={role.icon} style={{ fontSize: '1rem' }} />
                <span className="flex-1 text-left">{role.label}</span>
                <motion.span
                  animate={{ rotate: showRoles ? 180 : 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex' }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.span>
              </motion.button>

              {showRoles && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                >
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className="w-full flex items-center gap-2 px-3 py-3 text-base sm:text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      <IonIcon icon={r.icon} style={{ fontSize: '1rem' }} />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </motion.div>
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
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder={CREDENTIALS[role.value].email}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base sm:text-sm focus:outline-none focus:border-primary"
              style={inputStyle(emailFocused)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <div
              className="relative"
              style={{ ...inputStyle(pwFocused), borderRadius: 8 }}
            >
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base sm:text-sm focus:outline-none focus:border-primary pr-10"
                style={{ transition: 'border-color 150ms' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right mt-1">
              <a href="#" className="text-xs text-primary hover:underline">Forgot Password?</a>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={reduced ? {} : { y: -2, boxShadow: '0 8px 28px rgba(194,0,0,0.28)' }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="w-full btn-primary py-3 text-base sm:text-sm font-semibold disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Signing in…
              </span>
            ) : 'Sign in'}
          </motion.button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          <a href="#" className="hover:underline">I'm not sure if I have an account</a>
        </p>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500">
          <strong>Demo:</strong> Select a role above then use<br />
          <span className="font-mono">{CREDENTIALS[role.value].email}</span> / <span className="font-mono">password123</span>
        </div>
      </motion.div>
    </div>
  )
}
