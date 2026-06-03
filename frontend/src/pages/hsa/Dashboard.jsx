import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import StatCard from '../../components/common/StatCard'
import AlertCard from '../../components/common/AlertCard'
import BloodStockDot from '../../components/common/BloodStockDot'
import api from '../../api/axios'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell
} from 'recharts'
import { Droplets, Clock, AlertTriangle, Users } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { waterOutline, medkitOutline, checkmarkCircleOutline } from 'ionicons/icons'
import LoadingScreen from '../../components/common/LoadingScreen'
import ConfirmModal from '../../components/common/ConfirmModal'

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const HOSPITALS = ['SGH', 'NUH', 'KKH', 'CGH', 'NGH', 'TTSH']

const FORECAST_DATA = [
  { date: 'May 21', actual: 1050 }, { date: 'May 22', actual: 1100 },
  { date: 'May 23', predicted: 1200 }, { date: 'May 24', predicted: 1350 },
  { date: 'May 25', predicted: 1300 }, { date: 'May 26', predicted: 1100 },
  { date: 'May 27', predicted: 900 },
]

const EXPIRING = [
  { name: '0-2 days', value: 40, color: '#EF4444' },
  { name: '3-5 days', value: 47, color: '#F59E0B' },
  { name: '6-7 days', value: 13, color: '#22C55E' },
]

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="h-3 bg-red-100 rounded w-3/4" />
            <div className="h-8 bg-red-100 rounded w-1/2" />
            <div className="h-3 bg-red-100 rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="space-y-4">
          <div className="card p-4">
            <div className="h-4 bg-red-100 rounded w-24 mb-3" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-red-50 rounded mb-2" />)}
          </div>
          <div className="card p-4 h-28" />
          <div className="card p-4">
            <div className="h-4 bg-red-100 rounded w-32 mb-2" />
            {[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-red-50 rounded mb-2" />)}
          </div>
        </div>
        <div className="card p-4 lg:col-span-2">
          <div className="h-4 bg-red-100 rounded w-40 mb-3" />
          {[...Array(6)].map((_, i) => <div key={i} className="h-7 bg-red-50 rounded mb-1.5" />)}
          <div className="h-5 bg-red-50 rounded mt-3 w-3/4" />
        </div>
        <div className="space-y-4">
          <div className="card p-4">
            <div className="h-4 bg-red-100 rounded w-40 mb-2" />
            <div className="h-28 bg-red-50 rounded" />
          </div>
          <div className="card p-4 h-28" />
        </div>
      </div>
    </div>
  )
}

export default function HsaDashboard() {
  const [stock, setStock]       = useState({})
  const [alerts, setAlerts]     = useState([])
  const [requests, setRequests] = useState([])
  const [summary, setSummary]   = useState({ percentage: 85, criticalTypeCount: 3, totalUnits: 0 })
  const [showAlerts, setShowAlerts] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [dismissTarget, setDismissTarget] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      api.get('/blood-stock').then(r => setStock(r.data)),
      api.get('/alerts').then(r => setAlerts(r.data)),
      api.get('/requests').then(r => setRequests(r.data)),
      api.get('/blood-stock/summary').then(r => setSummary(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  const confirmDismiss = async () => {
    await api.patch(`/alerts/${dismissTarget}/dismiss`)
    setAlerts(alerts.filter(a => a.id !== dismissTarget))
    setDismissTarget(null)
  }

  const getPct = (hospitalCode, bloodTypeLabel) => {
    const hospitalStock = stock[hospitalCode]
    if (!Array.isArray(hospitalStock)) return null
    const entry = hospitalStock.find(s =>
      s.bloodType?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '') === bloodTypeLabel
      || s.bloodType?.label === bloodTypeLabel
    )
    if (!entry) return null
    return Math.round((entry.currentUnits / entry.idealUnits) * 100)
  }

  const navigate = useNavigate()
  const criticalTypes = ['A-', 'B+', 'B-']
  const activeRequests = requests.filter(r => r.status === 'PENDING').length
  const expiringTotal = 1081

  if (loading) return (
    <PageLayout title="Home" subtitle="Real-time insights and alerts to help manage blood demand and supply" isHome>
      <LoadingScreen variant="general" />
    </PageLayout>
  )

  return (
    <PageLayout
      title="Home"
      subtitle="Real-time insights and alerts to help manage blood demand and supply"
      isHome
    >
      {dismissTarget && (
        <ConfirmModal
          icon="warning"
          title="Dismiss this alert?"
          onCancel={() => setDismissTarget(null)}
          onConfirm={confirmDismiss}
          confirmLabel="Dismiss alert"
          confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
        />
      )}

      {/* Alerts modal */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Alerts</h2>
                <p className="text-xs text-gray-500">Active alerts requiring attention</p>
              </div>
              <button
                onClick={() => setShowAlerts(false)}
                aria-label="Close alerts panel"
                className="ml-auto text-gray-400 hover:text-gray-600 text-xl leading-none"
              >✕</button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              {alerts.map(a => <AlertCard key={a.id} alert={a} onDismiss={setDismissTarget} />)}
              {alerts.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No active alerts</p>}
            </div>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <StatCard
          icon={<Droplets className="w-5 h-5 text-primary" />}
          label="Blood Units"
          value={`${summary.percentage}%`}
          sub="of ideal"
          linkText="View details"
          onLink={() => navigate('/hsa/forecasting/blood-type-analytics')}
          highlight
        />
        <StatCard
          icon={<IonIcon icon={waterOutline} style={{ fontSize: '1.5rem', color: '#C20000' }} />}
          label="Critical Blood Types"
          value={summary.criticalTypeCount}
          sub={criticalTypes.join(', ')}
          highlight
        />
        <StatCard
          icon={<IonIcon icon={medkitOutline} style={{ fontSize: '1.5rem', color: '#6366f1' }} />}
          label="Hospitals Critical"
          value="2"
          linkText="View hospitals"
          onLink={() => navigate('/hsa/forecasting/blood-type-analytics')}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-400" />}
          label="Expiring Soon"
          value={expiringTotal.toLocaleString()}
          sub="within 7 days"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-yellow-500" />}
          label="Active Requests"
          value={activeRequests || 2}
          linkText="View requests"
          onLink={() => navigate('/hsa/alerts')}
        />
      </div>

      {/* Main grid
          Desktop priority: urgent actions → current state → future context
          Mobile priority:  alerts first (order-1), then stock, then forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Column 1 (desktop): Alerts + Expiring + Recent Requests */}
        <div className="col-span-1 space-y-4 order-1 lg:order-1">

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">Alerts</h3>
              <button onClick={() => setShowAlerts(true)} className="text-xs text-primary font-medium">View all</button>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map(a => (
                <AlertCard key={a.id} alert={a} onDismiss={setDismissTarget} />
              ))}
              {alerts.length === 0 && (
                <div className="flex flex-col items-center py-5 text-center">
                  <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1.5rem', color: '#22c55e', marginBottom: '0.25rem' }} />
                  <p className="text-xs text-gray-500">No active alerts</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">Expiring Units</h3>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <PieChart width={80} height={80}>
                  <Pie data={EXPIRING} cx={35} cy={35} innerRadius={22} outerRadius={36} dataKey="value" startAngle={90} endAngle={-270}>
                    {EXPIRING.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">{expiringTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                {EXPIRING.map(e => (
                  <div key={e.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                    <span className="text-gray-600">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">Recent Requests</h3>
              <button onClick={() => navigate('/hsa/alerts')} className="text-xs text-primary font-medium">View all</button>
            </div>
            {requests.length > 0 ? (
              <div className="space-y-2">
                {requests.slice(0, 2).map(r => (
                  <div key={r.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Droplets className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">
                        {r.bloodType?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')} blood needed
                      </div>
                      <div className="text-xs text-gray-600 truncate">{r.requestingHospital?.name}</div>
                      <div className="text-xs text-gray-500">{r.unitsRequested} units · 5 min ago</div>
                    </div>
                    <button className="btn-primary text-xs px-2 py-1 flex-shrink-0">Respond</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">No pending requests</p>
            )}
          </div>

        </div>

        {/* Columns 2-3 (desktop): Blood Stock by Type — wider for the 8-type matrix */}
        <div className="card p-4 order-2 lg:order-2 lg:col-span-2">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Blood Stock by Type</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-600">
                  <th className="text-left py-1 pr-3 font-medium">Hospital</th>
                  {BLOOD_TYPES.map(t => (
                    <th key={t} className="text-center px-2 font-medium">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOSPITALS.map(code => (
                  <tr key={code} className="border-t border-gray-50">
                    <td className="py-2 pr-3 font-medium text-gray-700">{code}</td>
                    {BLOOD_TYPES.map(type => {
                      const pct = getPct(code, type)
                      return (
                        <td key={type} className="text-center px-2">
                          <div className="flex justify-center">
                            <BloodStockDot pct={pct} />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {Object.keys(stock).length === 0 && (
            <p className="text-xs text-gray-500 text-center py-3">No stock data available</p>
          )}
          <div className="flex items-center gap-5 mt-3 pt-2 border-t border-gray-100 flex-wrap">
            {[
              ['dot-good',     'Good (70–100%)'],
              ['dot-low',      'Low (40–69%)'],
              ['dot-critical', 'Critical (0–39%)'],
              ['dot-none',     'No data'],
            ].map(([cls, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`${cls} inline-block`} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4 (desktop): Demand Forecast */}
        <div className="col-span-1 space-y-4 order-3 lg:order-3">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-gray-800">Demand Forecast</h3>
              <button onClick={() => navigate('/hsa/forecasting')} className="text-xs text-primary font-medium">View all</button>
            </div>
            <p className="text-xs text-gray-500 mb-2">Next 7 days</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={FORECAST_DATA} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <ReferenceLine y={1000} stroke="#EF4444" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="actual" stroke="#C20000" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="#C20000" strokeWidth={2} strokeDasharray="5 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </PageLayout>
  )
}
