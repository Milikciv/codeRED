import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../../components/layout/PageLayout'
import Toast from '../../../components/common/Toast'
import ConfirmModal from '../../../components/common/ConfirmModal'
import LoadingScreen from '../../../components/common/LoadingScreen'
import { AlertTriangle, X, ArrowRight, Info } from 'lucide-react'

const INITIAL_ALERTS = [
  {
    id: 1,
    title: 'O- Shortage Predicted in 3 days',
    subtitle: 'At Singapore General Hospital',
    risk: 'High Risk',
    riskColor: 'bg-red-100 text-red-700 border-red-200',
    iconColor: 'text-red-500',
    bg: 'bg-red-50 border-red-200',
    predictedShortage: '20-30 units',
    estimatedDate: '24 May 2025',
  },
  {
    id: 2,
    title: 'O- Shortage Predicted in 3 days',
    subtitle: 'At Tan Tock Seng Hospital',
    risk: 'Medium Risk',
    riskColor: 'bg-orange-100 text-orange-700 border-orange-200',
    iconColor: 'text-orange-400',
    bg: 'bg-orange-50 border-orange-200',
    predictedShortage: '20-30 units',
    estimatedDate: '24 May 2025',
  },
  {
    id: 3,
    title: 'A+ Shortage Predicted in 3 days',
    subtitle: 'At Tan Tock Seng Hospital',
    risk: 'Medium Risk',
    riskColor: 'bg-orange-100 text-orange-700 border-orange-200',
    iconColor: 'text-orange-400',
    bg: 'bg-yellow-50 border-yellow-200',
    predictedShortage: '20-30 units',
    estimatedDate: '24 May 2025',
  },
]

const ACTIONS = [
  {
    id: 1,
    label: 'Send Push Notifications to eligible O- donors',
    priority: 'Critical',
    priorityClass: 'bg-red-600 text-white',
    confidence: 82,
    reason: 'Rising demand and Low inventory in 3 days',
    actionLabel: 'Send Notifications',
    type: 'notification',
  },
  {
    id: 2,
    label: 'Allocate O- Blood to High Needs Hospitals',
    priority: 'Critical',
    priorityClass: 'bg-red-600 text-white',
    confidence: 82,
    reason: 'Rising demand and Low inventory in 3 days',
    actionLabel: 'Go to Blood Allocation',
    type: 'allocation',
  },
  {
    id: 3,
    label: 'Allocate A- Blood to High Needs Hospitals',
    priority: 'Medium',
    priorityClass: 'bg-yellow-500 text-white',
    confidence: 82,
    reason: 'Rising demand and Low inventory in 3 days',
    actionLabel: 'Go to Blood Allocation',
    type: 'allocation',
  },
]

export default function Recommendations() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [completedActions, setCompletedActions] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [dismissTarget, setDismissTarget] = useState(null)
  const [notifyConfirm, setNotifyConfirm] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(t)
  }, [])

  const confirmDismiss = () => {
    setAlerts(prev => prev.filter(a => a.id !== dismissTarget))
    setDismissTarget(null)
  }

  const confirmNotify = () => {
    setNotifyConfirm(false)
    setCompletedActions(prev => [...prev, 1])
    setToast({ type: 'success', title: 'Success!', message: 'Notification has been sent out Successfully!' })
  }

  const handleAction = (action) => {
    if (action.type === 'notification') {
      setNotifyConfirm(true)
    } else {
      navigate('/hsa/allocation')
    }
  }

  if (loading) return (
    <PageLayout title="Recommendations" subtitle="AI powered recommendations to prevent blood shortages">
      <LoadingScreen variant="recommendation" />
    </PageLayout>
  )

  return (
    <PageLayout
      title="Recommendations"
      subtitle="AI-powered recommendations to help manage blood supply and prevent shortages"
      breadcrumb={['Forecasting', 'Recommendations']}
    >
      {toast && (
        <Toast {...toast} onClose={() => setToast(null)} />
      )}

      {dismissTarget && (
        <ConfirmModal
          icon="warning"
          title="Confirm Dismissal of Alert?"
          onCancel={() => setDismissTarget(null)}
          onConfirm={confirmDismiss}
          confirmLabel="Confirm"
          confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
        />
      )}

      {notifyConfirm && (
        <ConfirmModal
          icon="info"
          title="Send Push Notification?"
          message="This will send notification to 30 donors. Do you want to continue?"
          confirmLabel="Send"
          confirmClass="bg-blue-500 hover:bg-blue-600 text-white"
          onCancel={() => setNotifyConfirm(false)}
          onConfirm={confirmNotify}
        />
      )}

      {/* Warning banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <div className="font-bold text-red-700 text-base">Possible Shortage of O- Blood in 3 days</div>
            <div className="text-sm text-red-600">Confidence: 87%</div>
          </div>
        </div>
        <div className="text-center px-8 border-l border-red-200">
          <div className="text-xs text-gray-500 mb-0.5">Estimated Shortage</div>
          <div className="text-xl font-bold text-gray-800">20-30 units</div>
        </div>
        <div className="text-center px-8 border-l border-red-200">
          <div className="text-xs text-gray-500 mb-0.5">Impacted Hospitals</div>
          <div className="text-xl font-bold text-gray-800">2 Hospitals</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Alerts list */}
        <div>
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Alerts ({alerts.length})</h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`border rounded-xl p-4 ${alert.bg}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.iconColor}`} />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{alert.title}</div>
                      <div className="text-xs text-gray-600">{alert.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${alert.riskColor}`}>
                      {alert.risk}
                    </span>
                    <button
                      onClick={() => setDismissTarget(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-500">Predicted Shortage</div>
                    <div className="font-semibold text-gray-800">{alert.predictedShortage}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Estimated Date</div>
                    <div className="font-semibold text-gray-800">{alert.estimatedDate}</div>
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-10 card">All alerts dismissed</div>
            )}
          </div>
        </div>

        {/* Recommended actions */}
        <div>
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-0.5">Recommended Actions</h3>
            <p className="text-xs text-gray-400 mb-4">Based on current inventory, demand forecast and historical trends</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Recommended Action</th>
                  <th className="text-center pb-2 font-medium">Priority</th>
                  <th className="text-center pb-2 font-medium">Confidence</th>
                  <th className="text-right pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {ACTIONS.map(action => {
                  const done = completedActions.includes(action.id)
                  return (
                    <tr key={action.id} className={`border-b border-gray-50 ${done ? 'opacity-50' : ''}`}>
                      <td className="py-3 pr-2">
                        <div className="flex items-start gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                          <span className="text-gray-800 leading-tight">{action.label}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${action.priorityClass}`}>
                          {action.priority}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-purple-600">{action.confidence}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${action.confidence}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleAction(action)}
                          disabled={done}
                          className="text-primary text-xs font-semibold hover:underline flex items-center gap-0.5 ml-auto disabled:opacity-40"
                        >
                          {action.actionLabel} <ArrowRight className="w-3 h-3" />
                        </button>
                        <div className="text-xs text-gray-400 mt-0.5">{action.reason}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* How AI Recommendations work */}
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-blue-800">How AI Recommendations work?</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Our AI analyzes the inventory level, historical data and external factors to provide actionable recommendations. The recommendations are suggestions only
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
