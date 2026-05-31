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
import { Droplets, Clock, Users, AlertTriangle } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { waterOutline, checkmarkCircleOutline, warningOutline } from 'ionicons/icons'
import LoadingScreen from '../../components/common/LoadingScreen'
import ConfirmModal from '../../components/common/ConfirmModal'

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

const FORECAST_DATA = [
  { date: 'May 21', actual: 850 }, { date: 'May 22', actual: 900 },
  { date: 'May 23', predicted: 1000 }, { date: 'May 24', predicted: 1200 },
  { date: 'May 25', predicted: 1500 }, { date: 'May 26', predicted: 1300 },
  { date: 'May 27', predicted: 1000 },
]

const EXPIRING = [
  { name: '0-2 Days', value: 16, color: '#EF4444' },
  { name: '3-5 Days', value: 47, color: '#F59E0B' },
  { name: '6-7 Days', value: 37, color: '#22C55E' },
]

function formatBloodType(bt) {
  return bt?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') ?? bt
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="h-3 bg-red-100 rounded w-3/4" />
            <div className="h-8 bg-red-100 rounded w-1/2" />
            <div className="h-3 bg-red-100 rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="card p-4">
            <div className="h-4 bg-red-100 rounded w-48 mb-3" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-red-50 rounded mb-2" />)}
          </div>
          <div className="card p-4">
            <div className="h-4 bg-red-100 rounded w-48 mb-2" />
            <div className="h-32 bg-red-50 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-4">
            <div className="h-4 bg-red-100 rounded w-24 mb-3" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-red-50 rounded mb-2" />)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 h-32" />
            <div className="card p-4 h-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HospitalDashboard() {
  const [stock, setStock]       = useState([])
  const [alerts, setAlerts]     = useState([])
  const [requests, setRequests] = useState([])
  const [summary, setSummary]   = useState({ percentage: 65, criticalTypeCount: 3 })
  const [showAlerts, setShowAlerts] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [dismissTarget, setDismissTarget] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      api.get('/blood-stock').then(r => setStock(Array.isArray(r.data) ? r.data : [])),
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

  const getPct = (bloodTypeLabel) => {
    const entry = stock.find(s => {
      const label = s.bloodType?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('AB_', 'AB')
      return label === bloodTypeLabel
    })
    if (!entry) return null
    return Math.round((entry.currentUnits / entry.idealUnits) * 100)
  }

  const navigate = useNavigate()
  const criticalTypes = stock.filter(s => s.currentUnits / s.idealUnits < 0.4)
    .map(s => formatBloodType(s.bloodType)).slice(0, 3).join(', ') || 'A-, B+, B-'

  const activeRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'IN_TRANSIT').length
  const expiringTotal = 231

  if (loading) return (
    <PageLayout title="Home" subtitle="Real time insights and alerts to help manage blood demand and supply" isHome>
      <LoadingScreen variant="general" />
    </PageLayout>
  )

  return (
    <PageLayout title="Home" subtitle="Real time insights and alerts to help manage blood demand and supply" isHome>
      {dismissTarget && (
        <ConfirmModal
          icon="warning"
          title="Dismiss this alert?"
          onCancel={() => setDismissTarget(null)}
          onConfirm={confirmDismiss}
          confirmLabel="Dismiss"
          confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
        />
      )}
      {/* Alert modal */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Alerts</h2>
                <p className="text-xs text-gray-500">Stay informed about important updates and actions</p>
              </div>
              <button onClick={() => setShowAlerts(false)} className="ml-auto text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              {alerts.map(a => <AlertCard key={a.id} alert={a} onDismiss={setDismissTarget} />)}
              {alerts.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No active alerts</p>}
            </div>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={<Droplets className="w-5 h-5 text-primary" />}
          label="Blood Units"
          value={`${summary.percentage}%`}
          sub="Of Ideal"
          linkText="View Details"
          onLink={() => navigate('/hospital/request')}
          highlight
        />
        <StatCard
          icon={<IonIcon icon={waterOutline} style={{ fontSize: '1.5rem', color: '#C41230' }} />}
          label="Critical Blood Types"
          value={summary.criticalTypeCount}
          sub={criticalTypes}
          highlight
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-400" />}
          label="Units Expiring Soon"
          value={expiringTotal}
          sub="Within 7 Days"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-yellow-500" />}
          label="Active Requests"
          value={activeRequests || 1}
          linkText="View Requests"
          onLink={() => navigate('/hospital/my-requests')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {/* Blood stock table */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Blood Stock by Type (Current vs Ideal)</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-1 pr-2 font-medium">Type</th>
                  {BLOOD_TYPES.map(t => (
                    <th key={t} className="text-center px-1 font-medium">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Blood', 'Platelets'].map(type => (
                  <tr key={type} className="border-t border-gray-50">
                    <td className="py-1.5 pr-2 font-medium text-gray-700">{type}</td>
                    {BLOOD_TYPES.map(bt => (
                      <td key={bt} className="text-center px-1">
                        <div className="flex justify-center">
                          <BloodStockDot pct={getPct(bt)} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100 flex-wrap">
              {[['dot-good', 'Good (70%-100%)'], ['dot-low', 'Low (40%-69%)'], ['dot-critical', 'Critical (0%-39%)'], ['dot-none', 'No Data']].map(([cls, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <span className={`${cls} inline-block`} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
            {stock.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">No stock data available</p>
            )}
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mt-2 text-xs text-yellow-700">
              <IonIcon icon={warningOutline} style={{ fontSize: '1rem', flexShrink: 0 }} /> 2 Blood types are currently below the safety threshold! Total Deficit: 46 Units
            </div>
            <button className="mt-2 w-full btn-primary text-xs py-2">Request for stock</button>
          </div>

          {/* Demand forecast */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">Demand Forecast (Next 7 Days)</h3>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={FORECAST_DATA} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <ReferenceLine y={1000} stroke="#EF4444" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="actual" stroke="#C41230" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="#C41230" strokeWidth={2} strokeDasharray="5 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">Alerts</h3>
              <button onClick={() => setShowAlerts(true)} className="text-xs text-primary font-medium">View All</button>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map(a => (
                <AlertCard key={a.id} alert={a} onDismiss={setDismissTarget} />
              ))}
              {alerts.length === 0 && (
                <div className="flex flex-col items-center py-6 text-center">
                  <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1.5rem', color: '#22c55e', marginBottom: '0.25rem' }} />
                  <p className="text-xs text-gray-500">No active alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Expiring + Recent */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-2">Expiring Blood Units</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <PieChart width={70} height={70}>
                    <Pie data={EXPIRING} cx={30} cy={30} innerRadius={18} outerRadius={32} dataKey="value" startAngle={90} endAngle={-270}>
                      {EXPIRING.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{expiringTotal}</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  {EXPIRING.map(e => (
                    <div key={e.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
                      <span className="text-gray-600">{e.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-gray-800">Recent Requests</h3>
                <button onClick={() => navigate('/hospital/my-requests')} className="text-xs text-primary font-medium">View All</button>
              </div>
              {requests.length > 0 ? (
                requests.slice(0, 1).map(r => (
                  <div key={r.id} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Droplets className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold">{formatBloodType(r.bloodType)} Blood Needed</span>
                    </div>
                    <div className="text-xs text-gray-500">{r.requestingHospital?.name}</div>
                    <div className="text-xs text-gray-400">{r.unitsRequested} Units • 5 mins ago</div>
                    <button className="mt-1 text-xs btn-primary px-2 py-1">Respond</button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No recent requests</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
