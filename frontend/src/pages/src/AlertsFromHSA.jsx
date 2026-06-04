import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageLayout from '../../components/layout/PageLayout'
import LoadingScreen from '../../components/common/LoadingScreen'
import api from '../../api/axios'
import { ChevronRight, Clock, Droplets, AlertTriangle, CheckCircle, X, Map } from 'lucide-react'
import Pagination, { usePagination } from '../../components/common/Pagination'

const PAGE_SIZE = 10

const SEVERITY_CONFIG = {
  Critical: { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500',    accent: 'border-l-red-400',    icon: AlertTriangle },
  High:     { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', accent: 'border-l-orange-400', icon: AlertTriangle },
  Medium:   { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', accent: 'border-l-yellow-400', icon: AlertTriangle },
  Low:      { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',   dot: 'bg-green-500',  accent: 'border-l-green-400',  icon: CheckCircle  },
}

export default function AlertsFromHSA() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/alerts/src').then(r => setAlerts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <PageLayout title="Alerts from HSA" subtitle="Review blood shortage alerts issued by the Health Sciences Authority.">
      <LoadingScreen variant="alerts" />
    </PageLayout>
  )

  const normalizeSeverity = s => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s

  const filters  = ['All', 'Critical', 'High', 'Medium']
  const normalized = alerts.map(a => ({ ...a, severity: normalizeSeverity(a.severity) }))
  const filtered = filter === 'All' ? normalized : normalized.filter(a => a.severity === filter)
  const { totalItems, totalPages, slice } = usePagination(filtered, PAGE_SIZE)
  const pageItems = slice(page)

  const handleFilterChange = (f) => { setFilter(f); setPage(1) }
  const handlePlanDrive    = (alertId) => navigate(`/src/drive-planning?alertId=${alertId}`)

  return (
    <PageLayout
      title="Alerts from HSA"
      subtitle="Review blood shortage alerts issued by the Health Sciences Authority."
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSelected(null)}
      />

      {/* Slide-in drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${selected ? 'translate-x-0' : 'translate-x-full'}`}>
        {selected && (() => {
          const cfg = SEVERITY_CONFIG[selected.severity] ?? SEVERITY_CONFIG.Medium
          return (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Alert Details</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-primary">{selected.id}</span>
                  <button onClick={() => setSelected(null)} aria-label="Close alert details">
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className={`rounded-lg px-3 py-2 mb-5 text-xs font-medium ${cfg.badge}`}>
                  {selected.severity} severity — action required within the shortage window
                </div>
                <div className="space-y-3 text-xs mb-6">
                  <h4 className="font-semibold text-gray-700 text-sm">Alert Overview</h4>
                  {[
                    ['Alert ID',            <span className="font-mono font-semibold">{selected.id}</span>],
                    ['Severity',            <span className={`px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>{selected.severity}</span>],
                    ['Blood Type',          <span className="flex items-center gap-1 font-semibold text-primary justify-end"><Droplets className="w-3 h-3" />{selected.bloodType}</span>],
                    ['Forecasted Shortage', `${selected.forecastedShortage.toLocaleString()} units`],
                    ['Shortage Window',     selected.shortageWindow],
                    ['Received At',         selected.receivedAt],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2 py-2 border-b border-gray-50">
                      <span className="text-gray-500 flex-shrink-0">{k}</span>
                      <span className="font-medium text-gray-800 text-right">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">Recommended Action</h4>
                  <div className="bg-gray-50 rounded-lg px-3 py-3 text-xs text-gray-700 leading-relaxed">
                    {selected.recommendedAction}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={() => handlePlanDrive(selected.id)}
                  className="w-full flex items-center justify-center gap-2 btn-primary py-2.5 text-sm font-semibold"
                >
                  <Map className="w-4 h-4" /> Plan Drive for This Alert
                </button>
              </div>
            </>
          )
        })()}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{totalItems} alert{totalItems !== 1 ? 's' : ''}</span>
      </div>

      {/* Mobile card list */}
      <motion.div
        key={`cards-${filter}-${page}`}
        className="sm:hidden space-y-3"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {pageItems.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.Medium
          return (
            <motion.div
              key={alert.id}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
              onClick={() => setSelected(alert)}
              className="card p-4 cursor-pointer hover:shadow-md transition-shadow space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-gray-900 font-mono">{alert.id}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{alert.receivedAt}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.badge}`}>{alert.severity}</span>
              </div>

              {/* Data grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <div className="text-[10px] text-gray-400 font-medium mb-1">Blood Type</div>
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <Droplets className="w-3 h-3" /> {alert.bloodType}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-medium mb-1">Forecasted Shortage</div>
                  <div className="font-semibold text-gray-800">{alert.forecastedShortage.toLocaleString()} units</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-400 font-medium mb-1">Shortage Window</div>
                  <div className="font-medium text-gray-700">{alert.shortageWindow}</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end pt-1 border-t border-gray-100">
                <button
                  onClick={e => { e.stopPropagation(); handlePlanDrive(alert.id) }}
                  className="flex items-center gap-1.5 btn-primary px-3 py-1.5 text-xs font-semibold"
                >
                  <Map className="w-3.5 h-3.5" /> Plan Drive
                </button>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Desktop table */}
      <div className="hidden sm:block card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium">Alert ID</th>
              <th className="text-left px-4 py-3 font-medium">Severity</th>
              <th className="text-left px-4 py-3 font-medium">Blood Type</th>
              <th className="text-left px-4 py-3 font-medium">Forecasted Shortage</th>
              <th className="text-left px-4 py-3 font-medium">Shortage Window</th>
              <th className="text-left px-4 py-3 font-medium">Recommended Action</th>
              <th className="text-left px-4 py-3 font-medium">Received</th>
              <th className="text-left px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <motion.tbody
            key={`${filter}-${page}`}
            className="divide-y divide-gray-50"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
          >
            {pageItems.map((alert) => {
              const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.Medium
              return (
                <motion.tr
                  key={alert.id}
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }}
                  onClick={() => setSelected(alert)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="font-mono font-semibold text-gray-900">{alert.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>{alert.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      <Droplets className="w-3 h-3" /> {alert.bloodType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{alert.forecastedShortage.toLocaleString()} units</td>
                  <td className="px-4 py-3 text-gray-700">{alert.shortageWindow}</td>
                  <td className="px-4 py-3 text-gray-700">{alert.recommendedAction}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.receivedAt}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handlePlanDrive(alert.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      Plan Drive <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </PageLayout>
  )
}
