import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import LoadingScreen, { SectionLoader } from '../../components/common/LoadingScreen'
import { MapContainer, TileLayer, Circle, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import api from '../../api/axios'
import {
  ChevronDown, X, CheckCircle, Info, CalendarDays,
  Clock, Droplets, Users, TrendingUp, ExternalLink, MapPin, RefreshCw
} from 'lucide-react'

// Fix leaflet default icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SG_CENTER = [1.3521, 103.8198]

const SEVERITY_BADGE = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-orange-100 text-orange-700',
  Medium:   'bg-yellow-100 text-yellow-700',
}

const SCORE_COLOR = (score) => {
  if (score >= 80) return '#EF4444'
  if (score >= 60) return '#F97316'
  if (score >= 40) return '#EAB308'
  return '#A3A3A3'
}

function createHotspotIcon(rank, score) {
  const color = SCORE_COLOR(score)
  return L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<div style="
      width:44px;height:44px;border-radius:50%;
      background:${color};color:white;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-weight:700;font-size:10px;line-height:1.1;
      border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
      cursor:pointer;
    ">
      <span>${rank}</span>
      <span style="font-size:9px">${score}</span>
    </div>`,
  })
}

function ConfidenceRing({ pct }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={90} height={90} viewBox="0 0 90 90">
      <circle cx={45} cy={45} r={r} fill="none" stroke="#F3F4F6" strokeWidth={8} />
      <circle
        cx={45} cy={45} r={r} fill="none"
        stroke="#C20000" strokeWidth={8}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 45 45)"
      />
      <text x={45} y={49} textAnchor="middle" fontSize={16} fontWeight={700} fill="#111827">{pct}%</text>
    </svg>
  )
}

function WhyModal({ drive, onClose, onRefresh, refreshing }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Why This Location?</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary disabled:opacity-40"
              title="Regenerate AI reasoning"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Regenerating…' : 'Regenerate'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {refreshing ? (
            <SectionLoader variant="recommendation" message="Regenerating AI reasoning…" />
          ) : (
            <>
              {drive.impact && (
                <p className="text-xs text-gray-600 leading-relaxed pb-2 border-b border-gray-100">{drive.impact}</p>
              )}
              {(drive.reasons ?? []).map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{r.label}</div>
                    <div className="text-xs text-gray-500">{r.detail}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ScoreModal({ drive, onClose }) {
  const total = (drive.scoreBreakdown ?? []).reduce((s, b) => s + b.score, 0)
  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Hotspot Score Breakdown</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          {(drive.scoreBreakdown ?? []).map((b, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700 font-medium">{b.criterion}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{b.weight}%</span>
                  <span className="font-semibold text-gray-900 w-12 text-right">{b.score}/{b.weight}</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(b.score / b.weight) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Total Score</span>
            <span className="text-lg font-bold text-primary">{total} <span className="text-gray-400 text-sm font-normal">/ 100</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

const ALL_BLOOD_TYPES = ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

function BloodTypeCheckboxes({ selected, onChange }) {
  const toggle = (type) => {
    const next = selected.includes(type) ? selected.filter(t => t !== type) : [...selected, type]
    onChange(next)
  }
  const allSelected = ALL_BLOOD_TYPES.every(t => selected.includes(t))
  const toggleAll = () => onChange(allSelected ? [] : [...ALL_BLOOD_TYPES])
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {ALL_BLOOD_TYPES.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
              selected.includes(t)
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleAll}
        className={`w-full py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
          allSelected ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
        }`}
      >
        {allSelected ? '✓ All Blood Types Selected' : 'Select All Blood Types'}
      </button>
      {selected.length === 0 && (
        <p className="text-xs text-red-500">Please select at least one blood type.</p>
      )}
    </div>
  )
}

function recommendedStaff(eligibleDonors) {
  // Roughly 1 staff per 15 expected donors (30% turnout), minimum 2
  return Math.max(2, Math.round((eligibleDonors * 0.3) / 15))
}

function PlanDriveModal({ drive, alertId, alerts, onClose, onCreated }) {
  const [bloodTypes, setBloodTypes] = useState(
    drive.bloodType ? [drive.bloodType] : ['O+']
  )
  const [form, setForm] = useState({
    date:         drive.date ?? '',
    startTime:    drive.time?.split(' – ')[0]?.trim() ?? '10:00 AM',
    endTime:      drive.time?.split(' – ')[1]?.trim() ?? '4:00 PM',
    staffAssigned: recommendedStaff(drive.eligibleDonors ?? 50),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Auto-match open alerts whose blood type is in the selected blood types.
  // Always include the current alert context even if it doesn't match (e.g. user cleared its type).
  const matchedAlerts = alerts.filter(a => bloodTypes.includes(a.bloodType))
  const linkedAlertIds = Array.from(new Set([
    ...matchedAlerts.map(a => a.id),
    ...(alertId ? [alertId] : []),
  ]))

  const handleSubmit = async () => {
    if (bloodTypes.length === 0) return
    setSaving(true)
    setError(null)
    try {
      await api.post('/drives', {
        location:      drive.location ?? '',
        address:       drive.address  ?? '',
        bloodType:     bloodTypes.join(', '),
        date:          form.date,
        startTime:     form.startTime,
        endTime:       form.endTime,
        staffAssigned: Number(form.staffAssigned) || 0,
        expectedMin:   drive.eligibleDonors ? Math.round(drive.eligibleDonors * 0.25) : 0,
        expectedMax:   drive.eligibleDonors ?? 0,
        linkedAlerts:  linkedAlertIds,
        notes:         '',
      })
      onCreated()
    } catch {
      setError('Failed to create drive. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">Plan Drive Here</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Read-only venue info */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" /> {drive.location}
            </div>
            {drive.address && (
              <div className="text-xs text-gray-400 pl-5">{drive.address}</div>
            )}
          </div>

          {/* Blood type checkboxes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Target Blood Type(s)</label>
            <BloodTypeCheckboxes selected={bloodTypes} onChange={setBloodTypes} />
          </div>

          {/* Linked alerts preview */}
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="text-xs font-medium text-blue-700 mb-1.5">
              Will be linked to {linkedAlertIds.length} alert{linkedAlertIds.length !== 1 ? 's' : ''}
            </div>
            {linkedAlertIds.length === 0 ? (
              <p className="text-xs text-blue-400">No open alerts match the selected blood types.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {linkedAlertIds.map(id => {
                  const a = alerts.find(x => x.id === id)
                  return (
                    <span key={id} className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-700 rounded-lg px-2 py-0.5 text-xs font-semibold">
                      <Droplets className="w-3 h-3" />
                      {id}{a ? ` · ${a.bloodType}` : ''}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
            <input className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} placeholder="e.g. Sat, 31 May 2026" />
          </div>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Time</label>
              <input className={inputCls} value={form.startTime} onChange={e => set('startTime', e.target.value)} placeholder="e.g. 10:00 AM" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">End Time</label>
              <input className={inputCls} value={form.endTime} onChange={e => set('endTime', e.target.value)} placeholder="e.g. 4:00 PM" />
            </div>
          </div>

          {/* Staff assigned */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Staff Assigned
              <span className="ml-1.5 text-[10px] text-primary font-normal bg-primary/10 px-1.5 py-0.5 rounded-full">
                Recommended: {recommendedStaff(drive.eligibleDonors ?? 50)}
              </span>
            </label>
            <input
              type="number" min={1}
              className={inputCls}
              value={form.staffAssigned}
              onChange={e => set('staffAssigned', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Based on ~{drive.eligibleDonors ?? '?'} eligible donors in the area (est. {Math.round((drive.eligibleDonors ?? 50) * 0.3)} turnout).
            </p>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || bloodTypes.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 btn-primary py-2 text-sm disabled:opacity-60"
          >
            <CalendarDays className="w-4 h-4" /> {saving ? 'Creating…' : 'Create Drive'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AltLocationsModal({ drive, topDrive, onSelectDrive, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Alternative Locations</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          <p className="text-xs text-gray-500 mb-3">Other suitable venues for <span className="font-semibold text-gray-800">{drive.bloodType}</span> donation drive on {drive.date}.</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 font-medium">Location</th>
                <th className="text-center font-medium">Score</th>
                <th className="text-center font-medium">Est. Donors</th>
                <th className="text-center font-medium">Success Rate</th>
                <th className="text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* Rank-1: top recommended row */}
              <tr className="bg-red-50/60 hover:bg-red-50">
                <td className="py-2.5">
                  <div className="font-semibold text-gray-900"><span className="text-yellow-400">★</span> {topDrive?.location ?? drive.location}</div>
                </td>
                <td className="text-center">
                  <span className="font-bold" style={{ color: SCORE_COLOR(topDrive?.confidenceScore ?? drive.confidenceScore) }}>{topDrive?.confidenceScore ?? drive.confidenceScore}</span>
                </td>
                <td className="text-center text-gray-600">{topDrive?.eligibleDonors ?? drive.eligibleDonors}</td>
                <td className="text-center text-gray-600">{topDrive?.pastSuccessRate ?? drive.pastSuccessRate}%</td>
                <td className="text-right">
                  <button
                    onClick={() => { onSelectDrive(1); onClose(); }}
                    className="px-2.5 py-1 border border-primary text-primary rounded text-[10px] font-semibold hover:bg-primary/5"
                  >
                    View
                  </button>
                </td>
              </tr>
              {/* Rank 2+: alternatives */}
              {(drive.alternativeLocations ?? []).map((loc, i) => { const rank = loc.rank ?? (i + 2); return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2.5 font-semibold text-gray-800">{loc.location}</td>
                  <td className="text-center">
                    <span className="font-bold" style={{ color: SCORE_COLOR(loc.confidenceScore) }}>{loc.confidenceScore}</span>
                  </td>
                  <td className="text-center text-gray-600">{loc.eligibleDonors}</td>
                  <td className="text-center text-gray-600">{loc.pastSuccessRate}%</td>
                  <td className="text-right">
                    <button
                      onClick={() => { onSelectDrive(rank); onClose(); }}
                      className="px-2.5 py-1 border border-primary text-primary rounded text-[10px] font-semibold hover:bg-primary/5"
                    >
                      View
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function DrivePlanning() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [alerts, setAlerts]             = useState([])
  const [hotspots, setHotspots]         = useState([])
  const [recommendedDrive, setRecommendedDrive] = useState(null)
  const [topDrive, setTopDrive]                 = useState(null)
  const [selectedAlertId, setSelectedAlertId]   = useState(null)
  const [selectedRank, setSelectedRank]         = useState(1)
  const [showAlertDropdown, setShowAlertDropdown] = useState(false)
  const alertBtnRef = useRef(null)
  const [selectedHotspot, setSelectedHotspot]   = useState(null)
  const [modal, setModal] = useState(null) // 'why' | 'score' | 'alt' | 'plan'
  const [regeneratingWhy, setRegeneratingWhy] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load alerts once
  useEffect(() => {
    api.get('/alerts/src').then(r => {
      setAlerts(r.data)
      const paramId = searchParams.get('alertId')
      const DEFAULT_ALERT = 'ALT-2505-001'
      const initialId = paramId ?? (r.data.find(a => a.id === DEFAULT_ALERT)?.id ?? r.data[0]?.id ?? null)
      setSelectedAlertId(initialId)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Re-fetch drive locations (hotspots) when alert changes
  useEffect(() => {
    if (!selectedAlertId) return
    api.get(`/drives/recommended/locations?alertCode=${selectedAlertId}`)
      .then(r => {
        setHotspots(r.data)
        if (r.data.length > 0) setSelectedHotspot(r.data[0])
      }).catch(() => {})
  }, [selectedAlertId])

  // Re-fetch rank-1 (top pick) whenever alert changes
  useEffect(() => {
    if (!selectedAlertId) return
    api.get(`/drives/recommended?alertCode=${selectedAlertId}&rank=1`)
      .then(r => setTopDrive(r.data))
      .catch(() => {})
  }, [selectedAlertId])

  // Re-fetch displayed drive when alert or rank changes
  useEffect(() => {
    if (!selectedAlertId) return
    api.get(`/drives/recommended?alertCode=${selectedAlertId}&rank=${selectedRank}`)
      .then(r => setRecommendedDrive(r.data))
      .catch(() => {})
  }, [selectedAlertId, selectedRank])

  // Sync with URL param changes
  useEffect(() => {
    const paramId = searchParams.get('alertId')
    if (paramId) setSelectedAlertId(paramId)
  }, [searchParams])

  const handleRegenerateWhy = () => {
    if (!selectedAlertId) return
    setRegeneratingWhy(true)
    api.post(`/drives/recommended/${selectedAlertId}/regenerate-reasoning`)
      .then(() => api.get(`/drives/recommended?alertCode=${selectedAlertId}&rank=${selectedRank}`))
      .then(r => setRecommendedDrive(r.data))
      .catch(() => {})
      .finally(() => setRegeneratingWhy(false))
  }

  if (loading) return (
    <PageLayout title="Drive Planning" subtitle="Find the best locations and plan your next blood donation drive.">
      <LoadingScreen variant="recommendation" />
    </PageLayout>
  )

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) ?? alerts[0]
  const drive = recommendedDrive

  const alertBtnRect = alertBtnRef.current?.getBoundingClientRect()
  const changeAlertButton = (
    <div>
      <button
        ref={alertBtnRef}
        onClick={() => setShowAlertDropdown(!showAlertDropdown)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-white shadow-sm"
      >
        Change Alert <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAlertDropdown ? 'rotate-180' : ''}`} />
      </button>
      {showAlertDropdown && alertBtnRect && createPortal(
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setShowAlertDropdown(false)} />
          <div
            className="fixed w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden"
            style={{ top: alertBtnRect.bottom + 6, left: alertBtnRect.right - 256 }}
          >
            {[...alerts].sort((a, b) => String(a.id).localeCompare(String(b.id))).map(a => (
              <button
                key={a.id}
                onClick={() => { setSelectedAlertId(a.id); setSelectedRank(1); setShowAlertDropdown(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-gray-50 ${a.id === selectedAlertId ? 'bg-primary/5' : ''}`}
              >
                <Droplets className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-800">{a.id}</div>
                  <div className="text-gray-500">{a.bloodType} · {a.severity}</div>
                </div>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  )

  return (
    <PageLayout
      title="Drive Planning"
      subtitle="Find the best locations and plan your next blood donation drive."
    >
      {/* Alert context bar */}
      {selectedAlert && (
        <div className="card p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">Active HSA Alert</span>
                  <span className="font-mono font-bold text-sm text-gray-900">{selectedAlert.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${SEVERITY_BADGE[selectedAlert.severity] ?? ''}`}>
                    {selectedAlert.severity?.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Blood Type</span>
                    <span className="font-bold text-gray-900 ml-1">{selectedAlert.bloodType}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Forecasted Shortage</span>
                    <span className="font-bold text-primary ml-1">{selectedAlert.forecastedShortage} units</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Shortage Window</span>
                    <span className="font-bold text-gray-900 ml-1">{selectedAlert.shortageWindow}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end sm:justify-start flex-shrink-0">
              {changeAlertButton}
            </div>
          </div>
        </div>
      )}

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left: Hotspot map */}
        <div className="lg:col-span-3 card p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-800">Hotspots</h3>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <button onClick={() => navigate('/src/hotspots')} className="text-xs text-primary font-medium hover:underline">
              View More
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Scores are calculated based on multiple factors to find the best drive locations.
          </p>

          <div className="rounded-xl overflow-hidden isolate" style={{ height: 300 }}>
            <MapContainer center={SG_CENTER} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {hotspots.filter(h => h.lat && h.lng).map((h) => (
                <Circle
                  key={h.rank}
                  center={[h.lat, h.lng]}
                  radius={2000}
                  pathOptions={{ color: 'transparent', fillColor: SCORE_COLOR(h.confidenceScore), fillOpacity: 0.25 }}
                />
              ))}
              {hotspots.filter(h => h.lat && h.lng).map((h) => (
                <Marker
                  key={h.rank}
                  position={[h.lat, h.lng]}
                  icon={createHotspotIcon(h.rank, h.confidenceScore)}
                  eventHandlers={{ click: () => { setSelectedHotspot(h); setSelectedRank(h.rank) } }}
                >
                  <Tooltip direction="top" offset={[0, -22]}>{h.location} — Score {h.confidenceScore}</Tooltip>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="font-medium text-gray-600">Hotspot Score</span>
            {[
              { label: '80–100', color: '#EF4444' },
              { label: '60–79',  color: '#F97316' },
              { label: '40–59',  color: '#EAB308' },
              { label: '20–39',  color: '#A3A3A3' },
              { label: '0–19',   color: '#E5E7EB' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {hotspots.map(h => (
              <button
                key={h.rank}
                onClick={() => { setSelectedHotspot(h); setSelectedRank(h.rank) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  selectedHotspot?.rank === h.rank
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: SCORE_COLOR(h.confidenceScore) }} />
                {h.rank}. {h.location}
                <span className="font-bold ml-0.5">Score {h.confidenceScore}</span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" /> Click on a location on the map or in the list to view details.
          </p>
        </div>

        {/* Right: Recommended drive card */}
        {drive && (
          <div className="lg:col-span-2 card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-800">Recommended Drive</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">AI</span>
            </div>

            <div className="relative">
              {selectedRank === 1
                ? <span className="absolute top-0 right-0 text-[10px] font-bold text-primary bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Top Recommendation</span>
                : <button onClick={() => setSelectedRank(1)} className="absolute top-0 right-0 text-[10px] font-medium text-gray-500 hover:text-primary underline">← Back to Top pick</button>
              }
              <div className="flex items-center gap-2 mt-1 mb-2">
                <Droplets className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-primary">{drive.bloodType}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-bold text-gray-900 text-base">{drive.location}</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" /> {drive.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> {drive.time}
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Droplets className="w-3.5 h-3.5 text-gray-400" />
                  Target: <span className="font-semibold ml-0.5">{drive.bloodType}</span>
                </div>
              </div>

              {/* Other active alerts this drive location can also address */}
              {alerts.filter(a => a.id !== selectedAlertId).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-3 mb-1">
                  <div className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Also address these active alerts
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {alerts.filter(a => a.id !== selectedAlertId).map(a => (
                      <span key={a.id} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2 py-0.5 text-[10px] font-semibold">
                        <Droplets className="w-2.5 h-2.5 text-primary" /> {a.id} · {a.bloodType}
                        <span className={`ml-0.5 px-1 rounded text-[9px] font-bold ${a.severity === 'Critical' ? 'bg-red-100 text-red-600' : a.severity === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {a.severity}
                        </span>
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-snug">
                    Add their blood types when planning to address multiple shortages in one drive.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-primary">{drive.eligibleDonors}</div>
                <div className="text-[10px] text-gray-400 leading-tight">Estimated eligible donors within 5km</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{drive.highResponseDonors}</div>
                <div className="text-[10px] text-gray-400 leading-tight">High-response donors</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{drive.pastSuccessRate}%</div>
                <div className="text-[10px] text-gray-400 leading-tight">Past drive success rate</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-0.5">
                  Confidence Score <Info className="w-3 h-3 text-gray-400" />
                </div>
                <div className="text-xs text-gray-400 leading-snug max-w-70">
                  AI confidence that this location and timing will lead to strong turnout.
                </div>
              </div>
              <div className="flex-shrink-0 ml-auto">
                <ConfidenceRing pct={drive.confidenceScore} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModal('why')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Users className="w-3.5 h-3.5" /> Why this location?
              </button>
              <button
                onClick={() => setModal('score')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Score breakdown
              </button>
            </div>

            <button
              onClick={() => setModal('plan')}
              className="w-full btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" /> Plan Drive Here
            </button>

            <button onClick={() => setModal('alt')} className="text-xs text-primary font-medium text-center hover:underline">
              View Alternative Locations →
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          Scores are updated daily using the latest data from HSA, donor database and past drive performance.
        </div>
        <span>Last updated: 30 May 2026, 08:30 AM</span>
      </div>

      {modal === 'why'   && drive && <WhyModal drive={drive} onClose={() => setModal(null)} onRefresh={handleRegenerateWhy} refreshing={regeneratingWhy} />}
      {modal === 'score' && drive && <ScoreModal drive={drive} onClose={() => setModal(null)} />}
      {modal === 'alt'   && drive && <AltLocationsModal drive={drive} topDrive={topDrive} onSelectDrive={(rank) => setSelectedRank(rank)} onClose={() => setModal(null)} />}
      {modal === 'plan'  && drive && (
        <PlanDriveModal
          drive={drive}
          alertId={selectedAlertId}
          alerts={alerts}
          onClose={() => setModal(null)}
          onCreated={() => { setModal(null); navigate('/src/donation-drives') }}
        />
      )}
    </PageLayout>
  )
}
