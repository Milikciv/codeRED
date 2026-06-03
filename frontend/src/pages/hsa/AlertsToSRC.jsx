import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageLayout from '../../components/layout/PageLayout'
import { Bell, Filter, List, ChevronDown, Send } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { alertCircleOutline } from 'ionicons/icons'
import { staggerContainer, listItem, ease } from '../../lib/motion'

const MOCK_INVENTORY = [
  { type: 'B+',  units: 700,  pct: 12 },
  { type: 'AB+', units: 900,  pct: 15 },
  { type: 'A+',  units: 1490, pct: 25 },
  { type: 'B-',  units: 500,  pct: 8  },
  { type: 'A-',  units: 400,  pct: 7  },
  { type: 'AB-', units: 250,  pct: 4  },
  { type: 'O+',  units: 1180, pct: 20 },
  { type: 'O-',  units: 580,  pct: 10 },
]

const INITIAL_ALERTS = [
  {
    id: 'ALT-2505-001',
    bloodType: 'O-',
    severity: 'Critical',
    shortage: 420,
    windowStart: '21 May 2026',
    windowEnd: '27 May 2026',
    status: 'Draft',
    safeSupplyThreshold: 1000,
    projectedSupply: 580,
    forecastConfidence: 87,
    dateGenerated: '30 May 2026, 08:15 AM',
    reason: 'Demand is projected to exceed the safe supply threshold for O- blood over the next 7 days.',
    recommendedAction: 'Organise 2 donor drives targeting O- donors.',
    recommendedDrives: 2,
    supportingText: 'This will help close the projected shortfall and maintain a safe supply.',
    defaultNotes: 'Please prioritise donor outreach and drive planning for O- donors. SRC to decide final locations based on donor hotspots and expected donor availability.',
  },
  {
    id: 'ALT-2505-002',
    bloodType: 'B+',
    severity: 'High',
    shortage: 260,
    windowStart: '28 May 2026',
    windowEnd: '3 Jun 2026',
    status: 'Sent',
    safeSupplyThreshold: 800,
    projectedSupply: 540,
    forecastConfidence: 82,
    dateGenerated: '29 May 2026, 10:30 AM',
    reason: 'Demand is projected to exceed the safe supply threshold for B+ blood over the next 7 days.',
    recommendedAction: 'Organise 1 donor drive targeting B+ donors.',
    recommendedDrives: 1,
    supportingText: 'This will help close the projected shortfall and maintain a safe supply.',
    defaultNotes: 'Please prioritise donor outreach and drive planning for B+ donors.',
  },
  {
    id: 'ALT-2505-003',
    bloodType: 'A-',
    severity: 'Medium',
    shortage: 180,
    windowStart: '4 Jun 2026',
    windowEnd: '10 Jun 2026',
    status: 'Sent',
    safeSupplyThreshold: 600,
    projectedSupply: 420,
    forecastConfidence: 79,
    dateGenerated: '28 May 2026, 02:00 PM',
    reason: 'Demand is projected to exceed the safe supply threshold for A- blood over the next 7 days.',
    recommendedAction: 'Organise 1 donor drive targeting A- donors.',
    recommendedDrives: 1,
    supportingText: 'This will help close the projected shortfall and maintain a safe supply.',
    defaultNotes: 'Please prioritise donor outreach and drive planning for A- donors.',
  },
  {
    id: 'ALT-2505-004',
    bloodType: 'AB-',
    severity: 'Medium',
    shortage: 120,
    windowStart: '11 Jun 2026',
    windowEnd: '17 Jun 2026',
    status: 'Ready',
    safeSupplyThreshold: 400,
    projectedSupply: 280,
    forecastConfidence: 75,
    dateGenerated: '27 May 2026, 09:45 AM',
    reason: 'Demand is projected to exceed the safe supply threshold for AB- blood over the next 7 days.',
    recommendedAction: 'Organise 1 donor drive targeting AB- donors.',
    recommendedDrives: 1,
    supportingText: 'This will help close the projected shortfall and maintain a safe supply.',
    defaultNotes: 'Please prioritise donor outreach and drive planning for AB- donors.',
  },
]

const STATUS_TABS = ['All', 'Draft', 'Ready', 'Sent', 'Resolved']

const PRIORITY_OPTIONS = [
  'High — Send Immediately',
  'Medium — Send Within 24 Hours',
  'Low — Send When Convenient',
]

function getSeverityColor(severity) {
  if (severity === 'Critical') return 'text-red-700 bg-red-50 border-red-200'
  if (severity === 'High')     return 'text-orange-700 bg-orange-50 border-orange-200'
  return 'text-yellow-700 bg-yellow-50 border-yellow-200'
}

function getStatusBadge(status) {
  if (status === 'Sent')     return 'text-green-700 bg-green-50'
  if (status === 'Draft')    return 'text-red-700 bg-red-50'
  if (status === 'Ready')    return 'text-blue-700 bg-blue-100'
  if (status === 'Resolved') return 'text-gray-600 bg-gray-100'
  return 'text-gray-600 bg-gray-100'
}

const TOTAL_INVENTORY = MOCK_INVENTORY.reduce((a, b) => a + b.units, 0)

export default function AlertsToSRC() {
  const [tab, setTab]       = useState('All')
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [selectedId, setSelectedId] = useState(null)
  const [notes, setNotes]   = useState({})
  const [priority, setPriority] = useState({})

  const filteredAlerts = alerts.filter(a => tab === 'All' || a.status === tab)
  const selectedAlert  = alerts.find(a => a.id === selectedId) ?? null

  const currentNotes    = notes[selectedId]    ?? selectedAlert?.defaultNotes ?? ''
  const currentPriority = priority[selectedId] ?? PRIORITY_OPTIONS[0]

  const handleSend = () => {
    if (!selectedAlert || selectedAlert.status === 'Sent') return
    setAlerts(prev => prev.map(a => a.id === selectedId ? { ...a, status: 'Sent' } : a))
  }

  const handleSaveDraft = () => {
    if (!selectedAlert) return
    setAlerts(prev => prev.map(a => a.id === selectedId ? { ...a, status: 'Draft' } : a))
  }

  return (
    <PageLayout
      title="Alerts"
      subtitle="Review shortage alerts generated from demand forecasting and send them to Singapore Red Cross for action."
    >
      <div className="flex flex-col lg:flex-row gap-4 h-full">

        {/* ── Left panel ── */}
        <div className="w-full lg:w-72 lg:flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-800">Alerts</h3>
            <div className="flex gap-1">
              <button aria-label="Filter alerts" className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><Filter className="w-4 h-4" /></button>
              <button aria-label="List view" className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><List className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Status filter tabs — sliding indicator via layoutId */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {STATUS_TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-2 py-0.5 rounded-full text-xs font-medium z-0 ${
                  tab === t ? 'text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="alert-tab-indicator"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ duration: 0.2, ease }}
                  />
                )}
                {t}
              </button>
            ))}
          </div>

          {/* Alert list — stagger on tab change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              className="space-y-2"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              variants={staggerContainer}
            >
              {filteredAlerts.length === 0 ? (
                <motion.div
                  variants={listItem}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <Bell className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-500">No alerts</p>
                  <p className="text-xs text-gray-400 mt-1">No alerts match this filter.</p>
                </motion.div>
              ) : (
                filteredAlerts.map(alert => (
                  <motion.button
                    key={alert.id}
                    variants={listItem}
                    onClick={() => setSelectedId(alert.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left card p-3 cursor-pointer transition-all hover:border-primary/30 ${
                      selectedId === alert.id ? 'border-primary ring-1 ring-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-primary">{alert.id}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getStatusBadge(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xl font-black text-primary">{alert.bloodType}</span>
                      <div>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border inline-block ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">{alert.shortage} units shortage</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{alert.windowStart} – {alert.windowEnd}</p>
                  </motion.button>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right: main content ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* National inventory strip — always visible */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-700">HSA Blood Services — National Inventory</h4>
              <span className="text-xs text-gray-500">Total: {TOTAL_INVENTORY.toLocaleString()} units</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {MOCK_INVENTORY.map(({ type, units, pct }) => {
                const highlighted = selectedAlert?.bloodType === type
                return (
                  <div key={type} className={`rounded-lg p-2 transition-colors duration-200 ${highlighted ? 'bg-primary text-white' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-bold ${highlighted ? 'text-white' : 'text-gray-800'}`}>{type}</div>
                    <div className={`text-sm font-black ${highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {units} <span className="text-xs font-normal">units</span>
                    </div>
                    <div className={`w-full rounded-full h-1 mt-1 ${highlighted ? 'bg-white/30' : 'bg-gray-200'}`}>
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${highlighted ? 'bg-white' : pct > 15 ? 'bg-green-400' : pct > 8 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className={`text-xs mt-0.5 ${highlighted ? 'text-white/80' : 'text-gray-500'}`}>{pct}%</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detail panel — animates when selection changes */}
          <AnimatePresence mode="wait">
            {!selectedAlert ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="card flex-1 flex flex-col items-center justify-center text-center p-8"
              >
                <IonIcon icon={alertCircleOutline} style={{ fontSize: '3.75rem', marginBottom: '1rem', opacity: 0.2 }} />
                <h3 className="text-lg font-semibold text-gray-600">Select an alert to view details</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Alerts are generated from demand forecasting. Select one to review and send to SRC.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.22, ease }}
                className="flex flex-col gap-4"
              >
                {/* Selected alert header bar */}
                <div className="card p-3 flex items-center gap-3 flex-wrap">
                  <Bell className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-bold text-primary">{selectedAlert.id}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm font-black text-gray-800">{selectedAlert.bloodType}</span>
                  <span className="text-gray-300">|</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-600">{selectedAlert.windowStart} – {selectedAlert.windowEnd}</span>
                  <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded ${getStatusBadge(selectedAlert.status)}`}>
                    {selectedAlert.status}
                  </span>
                </div>

                {/* Alert details card */}
                <div className="card p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Alert Details</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-0 text-xs">
                    {[
                      ['Alert ID',              selectedAlert.id],
                      ['Blood Type Needed',     selectedAlert.bloodType],
                      ['Severity',              selectedAlert.severity],
                      ['Forecasted Shortage',   `${selectedAlert.shortage} units`],
                      ['Safe Supply Threshold', `${selectedAlert.safeSupplyThreshold.toLocaleString()} units`],
                      ['Projected Supply',      `${selectedAlert.projectedSupply} units`],
                      ['Shortage Window',       `${selectedAlert.windowStart} – ${selectedAlert.windowEnd}`],
                      ['Forecast Confidence',   `${selectedAlert.forecastConfidence}%`],
                      ['Date Generated',        selectedAlert.dateGenerated],
                      ['Status',                selectedAlert.status],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-800 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3 text-xs text-amber-800">
                    <span className="font-semibold">Reason for Alert: </span>{selectedAlert.reason}
                  </div>
                </div>

                {/* Recommendation to SRC card */}
                <div className="card p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Recommendation to SRC</h4>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 mb-4">
                    <div className="text-xs font-semibold text-blue-800 mb-0.5">Recommended Action</div>
                    <div className="text-sm text-blue-900">{selectedAlert.recommendedAction}</div>
                    <div className="text-xs text-blue-600 mt-1">{selectedAlert.supportingText}</div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                    <div className="relative">
                      <select
                        value={currentPriority}
                        onChange={e => setPriority(prev => ({ ...prev, [selectedId]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-primary appearance-none"
                      >
                        {PRIORITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Notes to SRC</label>
                    <textarea
                      rows={3}
                      value={currentNotes}
                      onChange={e => setNotes(prev => ({ ...prev, [selectedId]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>

                {/* Alert summary card */}
                <div className="card p-4 bg-gray-50">
                  <h4 className="text-xs font-semibold text-gray-700 mb-3">Alert Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      ['Blood Type',          selectedAlert.bloodType],
                      ['Severity',            selectedAlert.severity],
                      ['Forecasted Shortage', `${selectedAlert.shortage} units`],
                      ['Shortage Window',     `${selectedAlert.windowStart} – ${selectedAlert.windowEnd}`],
                      ['Recommended Drives',  selectedAlert.recommendedDrives],
                      ['Forecast Confidence', `${selectedAlert.forecastConfidence}%`],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white rounded-lg p-2.5 border border-gray-100">
                        <div className="text-xs text-gray-500 mb-0.5">{k}</div>
                        <div className="text-sm font-bold text-gray-800">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="flex gap-3 pb-4">
                  <motion.button
                    onClick={handleSaveDraft}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 border border-gray-300 bg-white text-gray-700 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Save as Draft
                  </motion.button>
                  <motion.button
                    onClick={handleSend}
                    disabled={selectedAlert.status === 'Sent'}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 btn-primary py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {selectedAlert.status === 'Sent' ? 'Alert Sent' : 'Send Alert to SRC'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  )
}
