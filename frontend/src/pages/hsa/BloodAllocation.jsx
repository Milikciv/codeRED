import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import PriorityBadge from '../../components/common/PriorityBadge'
import Toast from '../../components/common/Toast'
import ConfirmModal from '../../components/common/ConfirmModal'
import api from '../../api/axios'
import { Filter, List, Building2, Check, X, Star, ClipboardList, AlertTriangle, ArrowRightLeft } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { informationCircleOutline, airplaneOutline, rocketOutline, starOutline, clipboardOutline } from 'ionicons/icons'
import LoadingScreen from '../../components/common/LoadingScreen'

const PRIORITY_TABS = ['All', 'Critical', 'High', 'Medium']

const STATUS_LABELS = {
  PENDING: 'Pending', APPROVED: 'Approved', PREPARING: 'Preparing',
  IN_TRANSIT: 'In Transit', DELIVERED: 'Delivered', COMPLETED: 'Completed', REJECTED: 'Rejected'
}

function getStatusColor(status) {
  if (['DELIVERED', 'COMPLETED'].includes(status)) return 'text-green-600 bg-green-50'
  if (status === 'REJECTED') return 'text-red-600 bg-red-50'
  if (status === 'PENDING') return 'text-gray-600 bg-gray-100'
  return 'text-blue-600 bg-blue-50'
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })
}

function formatBloodType(bt) {
  return bt?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') ?? bt
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const mins = Math.round((Date.now() - new Date(dateStr)) / 60000)
  return mins < 60 ? `${mins} mins ago` : `${Math.round(mins / 60)}h ago`
}

function RequestCardSkeleton() {
  return (
    <div className="card p-3 animate-pulse space-y-2">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-12" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="space-y-1">
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  )
}

export default function BloodAllocation() {
  const [requests, setRequests]         = useState([])
  const [selected, setSelected]         = useState(null)
  const [requestTransfers, setRequestTransfers] = useState([])
  const [inventory, setInventory]       = useState(null)
  const [assessment, setAssessment]     = useState(null)
  const [hsaAlloc, setHsaAlloc]         = useState(0)
  const [allocations, setAllocations]   = useState({})
  const [tab, setTab]                   = useState('All')
  const [toast, setToast]               = useState(null)
  const [showAiModal, setShowAiModal]   = useState(false)
  const [showConfirmApprove, setShowConfirmApprove] = useState(false)
  const [showConfirmAppeal, setShowConfirmAppeal]   = useState(false)
  const [aiRecommended, setAiRecommended] = useState(false)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/requests').then(r => setRequests(r.data)),
      api.get('/allocation/inventory').then(r => setInventory(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  const selectRequest = async (req) => {
    setSelected(req)
    setAssessment(null)
    setAllocations({})
    setHsaAlloc(0)
    setAiRecommended(false)
    setRequestTransfers([])

    if (req.status !== 'PENDING') {
      api.get(`/transfers/by-request/${req.id}`)
        .then(r => setRequestTransfers(r.data ?? []))
        .catch(() => setRequestTransfers([]))
      return
    }
    try {
      const { data } = await api.get(`/allocation/assess/${req.id}`)
      setAssessment(data)
      if (data.recommendedSource === 'HSA') {
        setHsaAlloc(Math.min(data.hsaUnitsAvailable, req.unitsRequested))
      }
    } catch (err) {
      setAssessment({ error: err?.response?.data?.message || 'Failed to load assessment' })
    }
  }

  const setUnits = (hospitalId, value) => {
    setAllocations(prev => ({ ...prev, [hospitalId]: Math.max(0, value) }))
  }

  const hospitalAllocTotal = Object.values(allocations).reduce((a, b) => a + (b || 0), 0)
  const totalAllocated = hsaAlloc + hospitalAllocTotal
  const needed = selected?.unitsRequested ?? 0
  const donorHospitals = assessment?.hospitalOptions ?? []

  const buildAiAlloc = () => {
    let remaining = needed - hsaAlloc
    const newAlloc = {}
    const safe = donorHospitals.filter(h => h.safeToTransfer === 'Yes')
    for (const h of safe) {
      if (remaining <= 0) break
      const give = Math.min(h.maxSafeTransfer, remaining)
      newAlloc[h.hospitalId] = give
      remaining -= give
    }
    return newAlloc
  }

  const handleRecommend = () => setShowAiModal(true)
  const applyAiAndClose = () => {
    setAllocations(buildAiAlloc())
    setAiRecommended(true)
    setShowAiModal(false)
  }

  const handleApprove = () => setShowConfirmApprove(true)

  const confirmApprove = async () => {
    setShowConfirmApprove(false)
    const payload = { requestId: selected.id, hsaUnits: hsaAlloc, allocations }
    const { data } = await api.post('/allocation/approve', payload)
    setToast({ type: 'success', title: 'Success!', message: data.message })
    const newStatus = hsaAlloc > 0 && hospitalAllocTotal === 0 ? 'IN_TRANSIT' : 'APPROVED'
    setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, status: newStatus } : r))
    setSelected(null)
    setAssessment(null)
  }

  const confirmAppeal = async () => {
    setShowConfirmAppeal(false)
    const { data } = await api.post('/allocation/trigger-appeal', { requestId: selected.id })
    setToast({ type: 'success', title: 'Appeal Triggered', message: data.message })
  }

  const filteredRequests = requests.filter(r => {
    const matchesPriority = tab === 'All' || r.priority?.toLowerCase() === tab.toLowerCase()
    return r.status?.toUpperCase() === 'PENDING' && matchesPriority
  })

  const safeColor = (s) => {
    if (s === 'Yes') return 'text-green-600 bg-green-50'
    if (s === 'Caution') return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const canApprove = totalAllocated > 0

  if (loading) return (
    <PageLayout title="Blood Allocation" subtitle="Real time insights and alerts to help manage blood demand and supply">
      <LoadingScreen variant="allocation" />
    </PageLayout>
  )

  return (
    <PageLayout title="Blood Allocation" subtitle="Real time insights and alerts to help manage blood demand and supply">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {showConfirmApprove && (
        <ConfirmModal
          icon="warning"
          title={hsaAlloc > 0 && hospitalAllocTotal === 0 ? 'Dispatch HSA delivery?' : 'Confirm inter-hospital transfer?'}
          message={hsaAlloc > 0 && hospitalAllocTotal === 0
            ? `HSA Blood Services will dispatch ${needed} units to ${selected?.requestingHospital?.name}.`
            : 'Donor hospitals will be notified to prepare and ship the allocated units.'}
          confirmLabel="Confirm"
          confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
          onCancel={() => setShowConfirmApprove(false)}
          onConfirm={confirmApprove}
        />
      )}

      {showConfirmAppeal && (
        <ConfirmModal
          icon="warning"
          title="Trigger national donor appeal?"
          message={`This will broadcast a critical appeal for ${formatBloodType(selected?.bloodType)} donors nationally.`}
          confirmLabel="Trigger Appeal"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onCancel={() => setShowConfirmAppeal(false)}
          onConfirm={confirmAppeal}
        />
      )}

      {/* AI Recommendation Modal */}
      {showAiModal && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-gray-900">Recommend Allocation</h2>
              <span className="text-xs text-gray-400 ml-1">AI powered recommendation based on inventory, demand and location</span>
              <button onClick={() => setShowAiModal(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4 text-xs text-blue-700">
                <IonIcon icon={informationCircleOutline} style={{ fontSize: '1rem', flexShrink: 0 }} />
                <span className="font-semibold">AI Recommended Allocation</span>
                <span className="text-gray-500">— Allocation ensures safe stock levels and timely availability</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary">{selected.requestId}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-700 font-medium truncate">{selected.requestingHospital?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-black text-primary">{formatBloodType(selected.bloodType)}</span>
                    <div>
                      <div className="text-xs text-gray-500">{selected.unitsRequested} units</div>
                      <PriorityBadge priority={selected.priority} />
                    </div>
                  </div>
                  {selected.reason && <p className="text-xs text-gray-500 mt-2 leading-tight">{selected.reason}</p>}
                </div>

                <div className="col-span-2">
                  <table className="w-full text-xs mb-3">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="text-left pb-2 font-medium">Source</th>
                        <th className="text-center pb-2 font-medium">Units</th>
                        <th className="text-center pb-2 font-medium">ETA</th>
                        <th className="text-center pb-2 font-medium">Transport</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donorHospitals.filter(h => h.safeToTransfer === 'Yes').slice(0, 3).map((h, i) => {
                        const units = [10, 5, 5][i] ?? 0
                        return (
                          <tr key={h.hospitalId} className="border-b border-gray-50">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                                  {h.hospitalCode?.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-800">{h.hospitalName}</span>
                              </div>
                            </td>
                            <td className="py-2 text-center font-bold text-gray-800">{units} units</td>
                            <td className="py-2 text-center text-gray-600">20 min</td>
                            <td className="py-2 text-center">
                              <span className="text-primary text-xs font-semibold flex items-center gap-1">
                                <IonIcon icon={airplaneOutline} style={{ fontSize: '0.875rem' }} /> Priority
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center gap-1 text-green-700 font-semibold">
                      <Check className="w-4 h-4" /> Total Allocated {needed}/{needed} units
                    </div>
                    <div className="flex items-center gap-1 text-green-700 font-semibold">
                      Meets Requirements <Check className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={applyAiAndClose} className="flex-1 btn-outline text-sm">Review and Edit</button>
              <button onClick={() => { applyAiAndClose(); setShowConfirmApprove(true) }}
                className="flex-1 btn-primary text-sm flex items-center justify-center gap-2">
                <IonIcon icon={rocketOutline} style={{ fontSize: '1rem' }} /> Approve &amp; Allocate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 h-full">
        {/* Left: Requests */}
        <div className="w-72 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-800">Requests</h3>
            <div className="flex gap-1">
              <button className="p-1 text-gray-400 hover:text-gray-600"><Filter className="w-4 h-4" /></button>
              <button className="p-1 text-gray-400 hover:text-gray-600"><List className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Priority filter */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {PRIORITY_TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  tab === t
                    ? t === 'All' ? 'bg-gray-600 text-white' : t === 'Critical' ? 'bg-red-600 text-white' : t === 'High' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {loading ? (
              [...Array(4)].map((_, i) => <RequestCardSkeleton key={i} />)
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <ClipboardList className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">No requests</p>
                <p className="text-xs text-gray-400 mt-1">No pending requests at this time.</p>
              </div>
            ) : (
              filteredRequests.map(req => (
                <div
                  key={req.id}
                  onClick={() => selectRequest(req)}
                  className={`card p-3 cursor-pointer transition-all hover:border-primary/30 ${selected?.id === req.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-primary">{req.requestId}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getStatusColor(req.status)}`}>
                      {STATUS_LABELS[req.status] ?? req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-700 font-medium truncate">{req.requestingHospital?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-primary">{formatBloodType(req.bloodType)}</span>
                    <div>
                      <div className="text-xs text-gray-500">{req.unitsRequested} units</div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Priority</span>
                        <PriorityBadge priority={req.priority} />
                      </div>
                    </div>
                    <div className="ml-auto text-xs text-right">
                      <div className="text-gray-400">{timeAgo(req.requestedAt)}</div>
                    </div>
                  </div>
                  {req.reason && <p className="text-xs text-gray-500 mt-1 leading-tight">{req.reason}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Allocation Workbench */}
        <div className="flex-1 flex flex-col gap-4">
          {/* HSA National inventory */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-700">HSA Blood Services — National Inventory</h4>
              <span className="text-xs text-gray-500">Total: {inventory?.totalStock?.toLocaleString()} units</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {inventory && Object.entries(inventory.byType ?? {}).map(([type, units]) => {
                const total = inventory.totalStock
                const pct = total ? Math.round(units / total * 100) : 0
                const highlighted = selected && type === formatBloodType(selected.bloodType)
                return (
                  <div key={type} className={`rounded-lg p-2 ${highlighted ? 'bg-primary text-white' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-bold ${highlighted ? 'text-white' : 'text-gray-800'}`}>{type}</div>
                    <div className={`text-sm font-black ${highlighted ? 'text-white' : 'text-gray-900'}`}>{units} <span className="text-xs font-normal">units</span></div>
                    <div className={`w-full rounded-full h-1 mt-1 ${highlighted ? 'bg-white/30' : 'bg-gray-200'}`}>
                      <div className={`h-1 rounded-full ${highlighted ? 'bg-white' : pct > 60 ? 'bg-green-400' : pct > 30 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className={`text-xs mt-0.5 ${highlighted ? 'text-white/80' : 'text-gray-500'}`}>{pct}%</div>
                  </div>
                )
              })}
              {!inventory && <div className="col-span-4 text-xs text-gray-400 text-center py-4">Inventory data unavailable</div>}
            </div>
          </div>

          {!selected ? (
            <div className="card flex-1 flex flex-col items-center justify-center text-center p-8">
              <IonIcon icon={clipboardOutline} style={{ fontSize: '3.75rem', marginBottom: '1rem', opacity: 0.2 }} />
              <h3 className="text-lg font-semibold text-gray-600">Select a request to view details</h3>
              <p className="text-sm text-gray-400 mt-2">Blood will be sourced from HSA national inventory first. Select a request to begin allocation.</p>
            </div>
          ) : selected.status !== 'PENDING' ? (
            <div className="card p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-sm text-gray-800">Request Details</h3>
                <span className="text-xs font-bold text-primary bg-primary-100 px-2 py-0.5 rounded">{selected.requestId}</span>
                <PriorityBadge priority={selected.priority} />
                <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded ${getStatusColor(selected.status)}`}>
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="card p-3 bg-gray-50">
                  <div className="text-gray-500 mb-1">Blood Type</div>
                  <div className="text-2xl font-black text-primary">{formatBloodType(selected.bloodType)}</div>
                </div>
                <div className="card p-3 bg-gray-50">
                  <div className="text-gray-500 mb-1">Units Requested</div>
                  <div className="text-2xl font-black text-gray-800">{selected.unitsRequested}</div>
                </div>
              </div>
              <div className="space-y-2 text-xs mb-5">
                {[
                  ['Hospital', selected.requestingHospital?.name],
                  ['Requested By', selected.requestedByName],
                  ['Designation', selected.requestedByDesignation],
                  ['Requested On', selected.requestedAt ? `${formatDate(selected.requestedAt)}, ${formatTime(selected.requestedAt)}` : '—'],
                  ['Needed By', selected.neededBy ? `${formatDate(selected.neededBy)}, ${formatTime(selected.neededBy)}` : '—'],
                  ...(selected.remarks ? [['Remarks', selected.remarks]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">{k}</span>
                    <span className="font-medium text-gray-800 text-right">{v ?? '—'}</span>
                  </div>
                ))}
              </div>

              {/* Child transfers */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-xs text-gray-700 mb-3 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Transfers ({requestTransfers.length})
                </h4>
                {requestTransfers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No transfers created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {requestTransfers.map(t => {
                      const isDel = t.donorHospital?.code === 'HSA' || t.transferId?.startsWith('DEL')
                      const tStatusColor = ['RECEIVED', 'DELIVERED'].includes(t.status) ? 'text-green-600'
                        : t.status === 'PENDING' ? 'text-gray-500' : 'text-blue-600'
                      const tStatusLabel = {
                        PENDING: 'Pending', ACKNOWLEDGED: 'Acknowledged', PREPARING: 'Preparing',
                        READY_FOR_PICKUP: 'Ready for Pickup', IN_TRANSIT: 'In Transit', RECEIVED: 'Received',
                      }[t.status] ?? t.status
                      return (
                        <div key={t.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-primary font-semibold">{t.transferId}</span>
                            <div className={`flex items-center gap-1 font-medium ${tStatusColor}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {tStatusLabel}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600 flex-wrap">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${isDel ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                              {isDel ? 'HSA Delivery' : 'Inter-hospital'}
                            </span>
                            <span className="font-bold text-red-600">{formatBloodType(t.bloodType)}</span>
                            <span className="text-gray-300">·</span>
                            <span>{t.units} units</span>
                            <span className="text-gray-300">·</span>
                            <span>{t.donorHospital?.name ?? t.donorHospital?.code} → {t.receivingHospital?.name ?? t.receivingHospital?.code}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Close Request — available once all transfers are received */}
                {requestTransfers.length > 0 &&
                  requestTransfers.every(t => ['RECEIVED', 'DELIVERED'].includes(t.status)) &&
                  selected.status !== 'COMPLETED' && (
                  <button
                    onClick={async () => {
                      await api.patch(`/requests/${selected.id}/status`, { status: 'COMPLETED' })
                      setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, status: 'COMPLETED' } : r))
                      setSelected(prev => ({ ...prev, status: 'COMPLETED' }))
                      setToast({ type: 'success', title: 'Request closed', message: `${selected.requestId} marked as completed.` })
                    }}
                    className="mt-3 w-full bg-green-50 border border-green-300 text-green-800 rounded-lg py-2 text-sm font-semibold hover:bg-green-100"
                  >
                    ✓ Close Request
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-sm text-gray-800">Allocation Workbench</h3>
                <span className="text-xs font-bold text-primary bg-primary-100 px-2 py-0.5 rounded">{selected.requestId}</span>
                <PriorityBadge priority={selected.priority} />
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-500">Blood Type</div>
                  <div className="text-xl font-black text-primary">{formatBloodType(selected.bloodType)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Units Requested</div>
                  <div className="text-xl font-black text-gray-800">{selected.unitsRequested}</div>
                </div>
              </div>

              {!assessment ? (
                <div className="text-xs text-gray-400 text-center py-8">Loading assessment...</div>
              ) : assessment.error ? (
                <div className="text-xs text-red-500 text-center py-8">{assessment.error}</div>
              ) : (
                <>
                  {/* National donor appeal warning */}
                  {assessment.nationallyLow && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-xs text-red-700">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold">National stock critically low</span> for {formatBloodType(selected.bloodType)}.
                        Consider triggering a public donor appeal.
                      </div>
                      <button onClick={() => setShowConfirmAppeal(true)} className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 flex-shrink-0">
                        Trigger Appeal
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3 text-xs text-blue-700">
                    <IonIcon icon={informationCircleOutline} style={{ fontSize: '1rem', flexShrink: 0 }} />
                    Allocate from HSA, hospitals, or both. Keep donors above safe stock thresholds.
                    <span className="flex items-center gap-1 ml-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Safe
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block ml-1" /> Caution
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block ml-1" /> Unsafe
                    </span>
                  </div>

                  {/* Unified allocation table — HSA row first, then hospitals */}
                  <table className="w-full text-xs mb-3">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="text-left pb-1.5 font-medium">Source</th>
                        <th className="text-center pb-1.5 font-medium">{formatBloodType(selected.bloodType)} Stock</th>
                        <th className="text-center pb-1.5 font-medium">Safe to Transfer</th>
                        <th className="text-center pb-1.5 font-medium">Max Safe</th>
                        <th className="text-center pb-1.5 font-medium">Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* HSA row */}
                      <tr className="border-b border-gray-100 bg-blue-50/40">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">H</div>
                            <span className="font-semibold text-gray-800">HSA Blood Services</span>
                            <span className="text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">National</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="font-semibold text-gray-800">{assessment.hsaUnitsAvailable}</span>
                          <span className="text-gray-400"> units</span>
                        </td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${assessment.hsaCanFulfill ? 'text-green-600 bg-green-50' : assessment.hsaUnitsAvailable > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'}`}>
                            {assessment.hsaCanFulfill ? 'Yes' : assessment.hsaUnitsAvailable > 0 ? 'Partial' : 'No'}
                          </span>
                        </td>
                        <td className="text-center text-gray-600">{assessment.hsaUnitsAvailable}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setHsaAlloc(v => Math.max(0, v - 1))} className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">−</button>
                            <input
                              type="number"
                              min={0}
                              max={assessment.hsaUnitsAvailable}
                              value={hsaAlloc}
                              onChange={e => setHsaAlloc(Math.min(assessment.hsaUnitsAvailable, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-12 text-center font-medium border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-primary"
                            />
                            <button onClick={() => setHsaAlloc(v => Math.min(assessment.hsaUnitsAvailable, v + 1))} className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
                          </div>
                        </td>
                      </tr>
                      {/* Hospital rows */}
                      {donorHospitals.map(h => (
                        <tr key={h.hospitalId} className="border-b border-gray-50">
                          <td className="py-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!(allocations[h.hospitalId])}
                                onChange={e => setUnits(h.hospitalId, e.target.checked ? Math.min(h.maxSafeTransfer, needed - totalAllocated + (allocations[h.hospitalId] || 0)) : 0)}
                                className="accent-primary"
                              />
                              <span className="font-medium text-gray-800">{h.hospitalName}</span>
                            </label>
                          </td>
                          <td className="text-center">
                            <span className="text-gray-800 font-semibold">{h.stock}</span>
                            <span className="text-gray-400"> ({h.stockPct}%)</span>
                          </td>
                          <td className="text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${safeColor(h.safeToTransfer)}`}>{h.safeToTransfer}</span>
                          </td>
                          <td className="text-center text-gray-600">{h.maxSafeTransfer}</td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setUnits(h.hospitalId, (allocations[h.hospitalId] || 0) - 1)} className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">−</button>
                              <input
                                type="number"
                                min={0}
                                max={h.maxSafeTransfer}
                                value={allocations[h.hospitalId] || 0}
                                onChange={e => setUnits(h.hospitalId, Math.min(h.maxSafeTransfer, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="w-12 text-center font-medium border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-primary"
                              />
                              <button onClick={() => setUnits(h.hospitalId, (allocations[h.hospitalId] || 0) + 1)} className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-end gap-2 text-sm font-semibold mb-4">
                    {hsaAlloc > 0 && hospitalAllocTotal > 0 && (
                      <span className="text-xs font-normal text-gray-500">({hsaAlloc} HSA + {hospitalAllocTotal} hospitals)</span>
                    )}
                    <span className={totalAllocated > needed ? 'text-red-600' : totalAllocated === needed ? 'text-green-600' : 'text-gray-600'}>
                      Total Allocated {totalAllocated} / {needed} units
                    </span>
                    {totalAllocated > needed
                      ? <X className="w-4 h-4 text-red-600" />
                      : totalAllocated === needed
                        ? <Check className="w-4 h-4 text-green-600" />
                        : <span className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0" />}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={handleRecommend} className="flex items-center justify-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">
                      <IonIcon icon={starOutline} style={{ fontSize: '1rem' }} /> Recommend
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={!canApprove}
                      className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <IonIcon icon={rocketOutline} style={{ fontSize: '1rem' }} /> Approve &amp; Allocate
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
