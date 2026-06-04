import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageLayout from '../../components/layout/PageLayout'
import AlertCard from '../../components/common/AlertCard'
import BloodStockDot from '../../components/common/BloodStockDot'
import api from '../../api/axios'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell
} from 'recharts'
import { Droplets, Clock, AlertTriangle, Bell, ChevronRight } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { waterOutline, medkitOutline } from 'ionicons/icons'
import LoadingScreen from '../../components/common/LoadingScreen'
import ConfirmModal from '../../components/common/ConfirmModal'
import { listItem, listItemX } from '../../lib/motion'

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

export default function HsaDashboard() {
  const [stock, setStock]       = useState({})
  const [alerts, setAlerts]     = useState([])
  const [summary, setSummary]   = useState({ percentage: 85, criticalTypeCount: 3, totalUnits: 0 })
  const [showAlerts, setShowAlerts] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [dismissTarget, setDismissTarget] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      api.get('/blood-stock').then(r => setStock(r.data)),
      api.get('/alerts').then(r => setAlerts(r.data)),
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
  const expiringTotal = 1081
  const criticalAlert = alerts.find(a => a.priority?.toUpperCase() === 'CRITICAL')

  if (loading) return (
    <PageLayout title="Home" subtitle="Real-time insights and alerts to help manage blood demand and supply">
      <LoadingScreen variant="general" />
    </PageLayout>
  )

  return (
    <PageLayout
      title="Home"
      subtitle="Real-time insights and alerts to help manage blood demand and supply"
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 modal-backdrop-enter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col modal-content-enter">
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

      {/* Critical alert banner */}
      {criticalAlert && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold text-red-700 uppercase">Critical alert active</span>
              </div>
              <p className="text-sm font-medium text-red-800">{criticalAlert.message}</p>
              <p className="text-xs text-red-400 mt-0.5">{criticalAlert.title}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/hsa/alerts')}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors sm:flex-shrink-0"
          >
            View Alerts <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI row */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        <motion.div
          variants={listItem}
          onClick={() => navigate('/hsa/forecasting/blood-type-analytics')}
          className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Blood Units</span>
            <Droplets className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{summary.percentage}%</div>
          <div className="text-xs text-gray-400">of ideal capacity</div>
        </motion.div>

        <motion.div variants={listItem} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Critical Blood Types</span>
            <IonIcon icon={waterOutline} style={{ fontSize: '1rem', color: '#C20000' }} />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{summary.criticalTypeCount}</div>
          <div className="text-xs text-gray-400">{criticalTypes.join(', ')}</div>
        </motion.div>

        <motion.div
          variants={listItem}
          onClick={() => navigate('/hsa/forecasting/blood-type-analytics')}
          className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Hospitals Critical</span>
            <IonIcon icon={medkitOutline} style={{ fontSize: '1rem', color: '#6366f1' }} />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">2</div>
          <div className="text-xs text-gray-400">of {HOSPITALS.length} hospitals</div>
        </motion.div>

        <motion.div variants={listItem} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Expiring Soon</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{expiringTotal.toLocaleString()}</div>
          <div className="text-xs text-gray-400">units within 7 days</div>
        </motion.div>

        <motion.div
          variants={listItem}
          onClick={() => setShowAlerts(true)}
          className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">Active Alerts</span>
            <Bell className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{alerts.length}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {alerts.filter(a => a.priority?.toUpperCase() === 'CRITICAL').length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                {alerts.filter(a => a.priority?.toUpperCase() === 'CRITICAL').length} Critical
              </span>
            )}
            {alerts.filter(a => a.priority?.toUpperCase() === 'HIGH').length > 0 && (
              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">
                {alerts.filter(a => a.priority?.toUpperCase() === 'HIGH').length} High
              </span>
            )}
            {alerts.length === 0 && <span className="text-xs text-gray-400">No active alerts</span>}
          </div>
        </motion.div>

      </motion.div>

      {/* Main row: blood stock + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Blood stock by type */}
        <div className="lg:col-span-3 card p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-semibold text-sm text-gray-800">Blood Stock by Type</h3>
              <p className="text-xs text-gray-400 mt-0.5">Current stock levels across all hospitals</p>
            </div>
          </div>
          <div className="overflow-x-auto mt-3">
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

        {/* Active alerts */}
        <div className="lg:col-span-2 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Active Alerts</h3>
            <button onClick={() => setShowAlerts(true)} className="text-xs text-primary font-medium hover:underline">
              View all
            </button>
          </div>
          <motion.div
            className="space-y-2 flex-1"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
          >
            {alerts.slice(0, 4).map(a => (
              <motion.div key={a.id} variants={listItemX}>
                <AlertCard alert={a} onDismiss={setDismissTarget} />
              </motion.div>
            ))}
            {alerts.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-8">No active alerts</p>
            )}
          </motion.div>
          <button
            onClick={() => setShowAlerts(true)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" /> Manage All Alerts
          </button>
        </div>

      </div>

      {/* Bottom row: demand forecast + expiring units */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Demand forecast */}
        <div className="lg:col-span-3 card p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-semibold text-sm text-gray-800">Demand Forecast</h3>
              <p className="text-xs text-gray-400 mt-0.5">Projected blood demand — next 7 days</p>
            </div>
            <button
              onClick={() => navigate('/hsa/forecasting')}
              className="text-xs text-primary font-medium hover:underline"
            >
              View all
            </button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={FORECAST_DATA} margin={{ top: 8, right: 5, left: -30, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <ReferenceLine y={1000} stroke="#EF4444" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="actual" stroke="#C20000" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="predicted" stroke="#C20000" strokeWidth={2} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-2 pt-2 border-t border-gray-50 text-[10px] text-gray-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="block w-6 h-0.5 bg-primary rounded" />
              Actual
            </div>
            <div className="flex items-center gap-1.5">
              <span className="block w-6 h-0.5 bg-primary rounded" style={{ borderTop: '2px dashed #C20000', background: 'none' }} />
              Predicted
            </div>
            <div className="flex items-center gap-1.5">
              <span className="block w-4 h-0.5 bg-red-400 rounded" style={{ borderTop: '2px dashed #EF4444', background: 'none' }} />
              Threshold
            </div>
          </div>
        </div>

        {/* Expiring units */}
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm text-gray-800">Expiring Units</h3>
              <p className="text-xs text-gray-400 mt-0.5">Blood units expiring within 7 days</p>
            </div>
            <span className="text-xs text-gray-400">{expiringTotal.toLocaleString()} total</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <PieChart width={96} height={96}>
                <Pie data={EXPIRING} cx={44} cy={44} innerRadius={26} outerRadius={44} dataKey="value" startAngle={90} endAngle={-270}>
                  {EXPIRING.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{expiringTotal.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400">units</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {EXPIRING.map(e => (
                <div key={e.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <span className="text-xs text-gray-600 flex-1">{e.name}</span>
                  <span className="text-xs font-semibold text-gray-700">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </PageLayout>
  )
}
