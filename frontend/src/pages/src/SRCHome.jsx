import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import LoadingScreen from '../../components/common/LoadingScreen'
import api from '../../api/axios'
import {
  Bell, Droplets, CalendarDays, Users, Map, Send,
  ChevronRight, AlertTriangle, ExternalLink, TrendingUp,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

const SEVERITY_CONFIG = {
  Critical: { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500',    bar: '#EF4444' },
  High:     { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', bar: '#F97316' },
  Medium:   { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400', bar: '#EAB308' },
  Low:      { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',   dot: 'bg-green-500',  bar: '#22C55E' },
}

const BLOOD_TYPE_COLORS = {
  'O+': '#EF4444',
  'A+': '#F97316',
  'B+': '#EAB308',
  'O-': '#22C55E',
  'A-': '#3B82F6',
  'AB+': '#8B5CF6',
  'B-': '#EC4899',
  'AB-': '#14B8A6',
}

function getBloodTypeColor(type) {
  return BLOOD_TYPE_COLORS[type] ?? '#9CA3AF'
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const cfg = SEVERITY_CONFIG[d.severity] ?? SEVERITY_CONFIG.Medium
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className="font-bold text-gray-800">{d.type}</span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cfg.badge}`}>{d.severity}</span>
      </div>
      <div className="text-gray-700 font-semibold">{d.units.toLocaleString()} units</div>
      <div className="text-gray-400">{d.window}</div>
    </div>
  )
}

export default function SRCHome() {
  const navigate = useNavigate()
  const [alerts, setAlerts]         = useState([])
  const [drives, setDrives]         = useState([])
  const [donorStats, setDonorStats] = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/src-alerts').then(r => setAlerts(r.data)).catch(() => {}),
      api.get('/drives').then(r => setDrives(r.data)).catch(() => {}),
      api.get('/donors/stats').then(r => setDonorStats(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <PageLayout title="Home" subtitle="Overview of your blood donation operations.">
      <LoadingScreen variant="general" />
    </PageLayout>
  )

  const upcomingDrives = drives.filter(d => d.status !== 'Completed')
  const forecastData   = alerts.map(a => ({
    type: a.bloodType, units: a.forecastedShortage,
    severity: a.severity, window: a.shortageWindow, id: a.id,
  }))
  const totalShortage  = alerts.reduce((s, a) => s + (a.forecastedShortage ?? 0), 0)
  const criticalCount  = alerts.filter(a => a.severity === 'Critical').length
  const highCount      = alerts.filter(a => a.severity === 'High').length
  const criticalAlert  = alerts.find(a => a.severity === 'Critical')
  const byBloodType    = donorStats?.byBloodType ?? []
  const summary        = donorStats?.summary ?? {}

  return (
    <PageLayout title="Home" subtitle="Overview of your blood donation operations.">

      {/* ── Critical alert urgency banner ─────────────────────────── */}
      {criticalAlert && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold text-red-700 uppercase">Critical alert active</span>
                <span className="font-mono text-xs font-semibold text-red-500">{criticalAlert.id}</span>
              </div>
              <p className="text-sm font-medium text-red-800">{criticalAlert.recommendedAction}</p>
              <p className="text-xs text-red-400 mt-0.5">
                Shortage window: {criticalAlert.shortageWindow} · {criticalAlert.forecastedShortage} units of {criticalAlert.bloodType}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/src/drive-planning?alertId=${criticalAlert.id}`)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors sm:flex-shrink-0"
          >
            Plan Drive <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── KPI row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <div
          onClick={() => navigate('/src/alerts')}
          className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Active Alerts</span>
            <Bell className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{alerts.length}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">{criticalCount} Critical</span>
            )}
            {highCount > 0 && (
              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">{highCount} High</span>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Total Forecasted Shortage</span>
            <Droplets className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{totalShortage.toLocaleString()}</div>
          <div className="text-xs text-gray-400">units across {alerts.length} blood types</div>
        </div>

        <div
          onClick={() => navigate('/src/donation-drives')}
          className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Upcoming Drives</span>
            <CalendarDays className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{upcomingDrives.length}</div>
          <div className="text-xs text-gray-400">
            {upcomingDrives.filter(d => d.status === 'Confirmed').length} confirmed ·{' '}
            {upcomingDrives.filter(d => d.status === 'Planned').length} planned
          </div>
        </div>

        <div
          onClick={() => navigate('/src/donor-information')}
          className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Donor Response Rate</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{summary.responseRate ?? '—'}%</div>
          <div className="text-xs text-gray-400">{(summary.activeDonors ?? 0).toLocaleString()} active donors</div>
        </div>
      </div>

      {/* ── Main row: forecasting + alert list ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Demand forecasting summary */}
        <div className="lg:col-span-3 card p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-semibold text-sm text-gray-800">Demand Forecasting Summary</h3>
              <p className="text-xs text-gray-400 mt-0.5">Forecasted blood shortage by type — next 30 days</p>
            </div>
            <button
              onClick={() => navigate('/src/alerts')}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              View alerts <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={forecastData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <ReferenceLine y={0} stroke="#E5E7EB" />
              <Bar dataKey="units" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {forecastData.map((d, i) => (
                  <Cell key={i} fill={SEVERITY_CONFIG[d.severity]?.bar ?? '#A3A3A3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 divide-y divide-gray-50">
            {forecastData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SEVERITY_CONFIG[d.severity]?.bar ?? '#A3A3A3' }} />
                <span className="font-bold text-gray-800 w-7">{d.type}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${SEVERITY_CONFIG[d.severity]?.badge ?? ''}`}>
                  {d.severity}
                </span>
                <span className="text-gray-400 flex-1 truncate">{d.window}</span>
                <span className="font-semibold text-gray-700 flex-shrink-0">{d.units.toLocaleString()} units</span>
                <button
                  onClick={() => navigate(`/src/drive-planning?alertId=${d.id}`)}
                  className="flex-shrink-0 text-[10px] text-primary font-semibold hover:underline"
                >
                  Plan →
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-400">
            {['Critical', 'High', 'Medium'].map(s => (
              <div key={s} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: SEVERITY_CONFIG[s].bar }} />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Active alerts */}
        <div className="lg:col-span-2 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Active HSA Alerts</h3>
            <button onClick={() => navigate('/src/alerts')} className="text-xs text-primary font-medium hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2 flex-1">
            {alerts.map(a => {
              const cfg = SEVERITY_CONFIG[a.severity] ?? SEVERITY_CONFIG.Medium
              return (
                <div key={a.id} className={`rounded-lg border px-3 py-2.5 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="font-mono text-xs font-bold text-gray-800">{a.id}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cfg.badge}`}>
                      {a.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-bold text-primary">
                      <Droplets className="w-3 h-3" />{a.bloodType}
                    </span>
                    <span className="font-semibold text-gray-700">{a.forecastedShortage} units</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{a.shortageWindow}</div>
                </div>
              )
            })}
          </div>
          <button
            onClick={() => navigate('/src/alerts')}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" /> Manage All Alerts
          </button>
        </div>
      </div>

      {/* ── Bottom row: upcoming drives + donor pool + quick actions ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Upcoming drives */}
        <div className="lg:col-span-3 card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm text-gray-800">Upcoming Drives</h3>
              <p className="text-xs text-gray-400 mt-0.5">Scheduled donation drives</p>
            </div>
            <button onClick={() => navigate('/src/donation-drives')} className="text-xs text-primary font-medium hover:underline">
              Manage all
            </button>
          </div>
          <div className="space-y-2">
            {upcomingDrives.map(d => {
              const filled = Math.round((d.confirmedDonors / d.expectedDonorsMax) * 100)
              return (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-800 truncate">{d.location}</span>
                      <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{d.date} · {d.time}</span>
                      <span className="flex items-center gap-0.5 text-primary font-medium">
                        <Droplets className="w-3 h-3" />{d.bloodType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(filled, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {d.confirmedDonors}/{d.expectedDonorsMax} confirmed
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Donor pool */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-800">Donor Pool</h3>
              <button onClick={() => navigate('/src/donor-information')} className="text-xs text-primary font-medium hover:underline">
                View details
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <div className="text-xl font-bold text-gray-800">{((summary.activeDonors ?? 0) / 1000).toFixed(0)}k</div>
                <div className="text-[10px] text-gray-400">Active donors</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <div className="text-xl font-bold text-gray-800">{((summary.eligibleRepeat ?? 0) / 1000).toFixed(0)}k</div>
                <div className="text-[10px] text-gray-400">Eligible repeat</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {byBloodType.slice(0, 3).map(t => (
                <div key={t.type} className="flex items-center gap-2 text-xs">
                  <span className="w-7 font-bold text-gray-700">{t.type}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: getBloodTypeColor(t.type) }} />
                  </div>
                  <span className="text-gray-400 w-8 text-right">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">Quick Actions</h3>
            <div className="space-y-0.5">
              {[
                { label: 'View HSA Alerts',  icon: Bell,         to: '/src/alerts' },
                { label: 'Plan a Drive',      icon: Map,          to: '/src/drive-planning' },
                { label: 'Donor Outreach',    icon: Send,         to: '/src/donor-outreach' },
                { label: 'Donation Drives',   icon: CalendarDays, to: '/src/donation-drives' },
                { label: 'Donor Information', icon: TrendingUp,   to: '/src/donor-information' },
              ].map(({ label, icon: Icon, to }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {label}
                  <ChevronRight className="w-3 h-3 text-gray-300 ml-auto" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

    </PageLayout>
  )
}
