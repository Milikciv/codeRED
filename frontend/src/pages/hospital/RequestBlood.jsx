import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Send, Droplets, AlertTriangle } from 'lucide-react'

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
const NEEDED_BY_OPTIONS = [
  '21 May 2025, 1800hrs', '21 May 2025, 2000hrs',
  '22 May 2025, 0800hrs', '22 May 2025, 1200hrs',
]

export default function RequestBlood() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedTypes, setSelectedTypes] = useState([])
  const [units, setUnits] = useState({})
  const [priority, setPriority] = useState('Critical')
  const [neededBy, setNeededBy] = useState(NEEDED_BY_OPTIONS[0])
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
    setUnits(prev => ({ ...prev, [type]: prev[type] ?? 10 }))
  }

  const totalUnits = selectedTypes.reduce((sum, t) => sum + (units[t] || 0), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedTypes.length === 0) return
    setSubmitting(true)
    try {
      await api.post('/requests', {
        bloodTypes: selectedTypes,
        units: totalUnits,
        priority: priority.toUpperCase(),
        neededBy: new Date().toISOString(),
        remarks,
      })
      setSubmitted(true)
      setTimeout(() => navigate('/hospital/my-requests'), 2000)
    } catch {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <PageLayout title="Request Blood" subtitle="Submit a blood request during crisis.">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✅</div>
          <h2 className="text-xl font-bold text-gray-800">Request Submitted!</h2>
          <p className="text-sm text-gray-500">Redirecting to your requests…</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Request Blood" subtitle="Submit a blood request during crisis.">
      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="col-span-2 space-y-5">
          {/* Step 1: Blood type */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">1. Select Blood Type &amp; Units</h3>
            <p className="text-xs text-gray-500 mb-3">Select one or more blood types</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {BLOOD_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    selectedTypes.includes(type)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary/50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {selectedTypes.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Units needed (for selected blood types)</p>
                {selectedTypes.map(type => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary w-8">{type}</span>
                    <button type="button" onClick={() => setUnits(p => ({ ...p, [type]: Math.max(1, (p[type] || 10) - 1) }))}
                      className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100">−</button>
                    <span className="w-10 text-center font-semibold">{units[type] || 10}</span>
                    <button type="button" onClick={() => setUnits(p => ({ ...p, [type]: (p[type] || 10) + 1 }))}
                      className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100">+</button>
                  </div>
                ))}
              </div>
            )}

            {selectedTypes.length === 0 && (
              <p className="text-xs text-red-500">Please select at least one blood type</p>
            )}
            <div className="mt-3 text-sm font-semibold text-primary">Total units requested: {totalUnits} units</div>
          </div>

          {/* Step 2: Request Details */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">2. Request Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Needed by</label>
                <select
                  value={neededBy}
                  onChange={e => setNeededBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  {NEEDED_BY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                maxLength={2500}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="Optional: add context for this request…"
              />
              <div className="text-right text-xs text-gray-400">{remarks.length}/2500 characters</div>
            </div>
          </div>

          {/* Step 3: Contact */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">3. Contact Details</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="font-medium text-gray-800">{user?.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Designation</div>
                <div className="font-medium text-gray-800">{user?.designation}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Contact Number</div>
                <div className="font-medium text-gray-800">+65 9627 6354</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || selectedTypes.length === 0}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>

        {/* Request Summary sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-800">Request Summary</h3>
              <span className="text-xs font-mono text-gray-500">REQ-2025-1001</span>
            </div>

            <div className="text-center mb-4">
              <Droplets className="w-8 h-8 text-primary mx-auto mb-1" />
              <div className="text-3xl font-black text-primary">{totalUnits}</div>
              <div className="text-xs text-gray-500">Total Requested</div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-gray-700">Request overview</h4>
              <div className="flex justify-between">
                <span className="text-gray-500">Priority</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-white text-xs ${priority === 'Critical' ? 'bg-red-600' : priority === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`}>{priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Blood Type &amp; Units</span>
                <span className="font-medium">{selectedTypes.map(t => `${t}(${units[t] || 10})`).join(', ') || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Units</span>
                <span className="font-medium">{totalUnits} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Requested on</span>
                <span className="font-medium">{new Date().toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Requested By</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hospital</span>
                <span className="font-medium">{user?.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Needed By</span>
                <span className="font-medium">{neededBy}</span>
              </div>
            </div>

            {priority === 'Critical' && (
              <div className="flex items-start gap-2 mt-3 bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                This is a critical request. Our system will notify available hospitals and blood banks immediately.
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="card p-5">
            <h4 className="font-semibold text-sm text-gray-800 mb-3">How It Works</h4>
            <div className="space-y-3">
              {[
                { icon: '📧', label: '1. Submit Request' },
                { icon: '🔔', label: '2. System Alerts' },
                { icon: '✅', label: '3. System Alerts' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-lg">{s.icon}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
