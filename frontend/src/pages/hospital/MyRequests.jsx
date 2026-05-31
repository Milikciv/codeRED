import { useState, useEffect, Fragment } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import PriorityBadge from '../../components/common/PriorityBadge'
import api from '../../api/axios'
import { ChevronDown, X, ClipboardList, ArrowRightLeft } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { clipboardOutline, refreshOutline, checkmarkOutline, cogOutline, cubeOutline, sendOutline } from 'ionicons/icons'
import LoadingScreen from '../../components/common/LoadingScreen'

const STATUS_INDEX = {
  PENDING: 0, APPROVED: 1, PREPARING: 2, IN_TRANSIT: 3, DELIVERED: 4, COMPLETED: 4, REJECTED: 0,
}

const TRANSFER_TIMELINE_ACTIVE = {
  PENDING: 1, ACKNOWLEDGED: 2, PREPARING: 3, READY_FOR_PICKUP: 4, IN_TRANSIT: 5, RECEIVED: 7,
}

const STATUS_LABELS = {
  PENDING: 'Pending', APPROVED: 'Approved', PREPARING: 'Preparing',
  IN_TRANSIT: 'In Transit', DELIVERED: 'Delivered', COMPLETED: 'Completed',
  REJECTED: 'Rejected', ACKNOWLEDGED: 'Acknowledged', READY: 'Ready',
  READY_FOR_PICKUP: 'Ready for Pickup', RECEIVED: 'Received',
}

const REQUEST_STATUS_NOTES = {
  PENDING: 'Awaiting HSA review',
  APPROVED: 'Request approved, preparing for dispatch',
  PREPARING: 'Blood is being prepared for dispatch',
  IN_TRANSIT: 'Your request is on the way!',
  DELIVERED: 'Blood has been delivered successfully',
  COMPLETED: 'Request completed',
  REJECTED: 'Request has been rejected',
}

const TRANSFER_STATUS_NOTES = {
  PENDING: 'HSA has requested a blood transfer. Please acknowledge to proceed.',
  ACKNOWLEDGED: 'Transfer acknowledged — preparing blood units for pickup.',
  PREPARING: 'Preparing blood units for pickup.',
  READY_FOR_PICKUP: 'Blood is ready and awaiting collection.',
  IN_TRANSIT: 'Blood is on its way to the receiving hospital.',
  RECEIVED: 'Blood has been received successfully.',
}

function getLinkedRequestId(transfer) {
  return transfer.bloodRequest?.id ?? transfer.requestId
}

function formatBloodType(bt) {
  return bt?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') ?? bt
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(dt) {
  if (!dt) return '—'
  return `${formatDate(dt)}, ${formatTime(dt)}`
}

function getStatusColor(status) {
  if (['DELIVERED', 'COMPLETED', 'RECEIVED'].includes(status)) return 'text-green-600'
  if (status === 'REJECTED') return 'text-red-500'
  if (status === 'PENDING') return 'text-gray-500'
  return 'text-blue-600'
}

function buildTransferTimeline(transfer) {
  const activeIdx = TRANSFER_TIMELINE_ACTIVE[transfer.status] ?? 1
  return [
    { label: 'Requested by HSA', note: formatDateTime(transfer.createdAt) },
    { label: 'Pending Acknowledgment', note: 'Awaiting acknowledgement from donor' },
    { label: 'Acknowledged', note: 'Transfer acknowledged by donor hospital' },
    { label: 'Preparing', note: 'Preparing blood units for dispatch' },
    { label: 'Ready for Pickup', note: 'Blood is ready and awaiting collection' },
    { label: 'In Transit', note: 'Blood is on its way' },
    { label: 'Delivered', note: 'Transfer completed' },
  ].map((step, i) => ({ ...step, done: i < activeIdx, active: i === activeIdx }))
}

function getBloodItems(row) {
  if (row.bloodItems?.length) return row.bloodItems
  if (row.bloodType) return [{ bloodType: row.bloodType, units: row.unitsRequested }]
  return []
}

function matchesFilter(row, filter, tab) {
  if (filter === 'All') return true
  const s = row.status?.toUpperCase() ?? ''
  if (tab === 'requests') {
    if (filter === 'Active')    return ['APPROVED', 'PREPARING', 'IN_TRANSIT'].includes(s)
    if (filter === 'Pending')   return s === 'PENDING'
    if (filter === 'Fulfilled') return ['DELIVERED', 'COMPLETED'].includes(s)
    if (filter === 'Rejected')  return s === 'REJECTED'
  } else {
    if (filter === 'Pending')      return s === 'PENDING'
    if (filter === 'Acknowledged') return ['ACKNOWLEDGED', 'PREPARING'].includes(s)
    if (filter === 'Ready')        return ['READY', 'READY_FOR_PICKUP'].includes(s)
    if (filter === 'In Transit')   return s === 'IN_TRANSIT'
    if (filter === 'Completed')    return ['DELIVERED', 'RECEIVED', 'COMPLETED'].includes(s)
  }
  return false
}


export default function MyRequests() {
  const [tab, setTab]                             = useState('requests')
  const [filter, setFilter]                       = useState('All')
  const [sortBy, setSortBy]                       = useState('Latest')
  const [selected, setSelected]                   = useState(null)
  const [expandedRows, setExpandedRows]           = useState(new Set())
  const [requests, setRequests]                   = useState([])
  const [transfers, setTransfers]                 = useState([])
  const [outboundTransfers, setOutboundTransfers] = useState([])
  const [loading, setLoading]                     = useState(true)
  const [actionLoading, setActionLoading]         = useState(false)

  function toggleExpand(id, e) {
    e.stopPropagation()
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    Promise.allSettled([
      api.get('/requests').then(r => { if (r.data?.length) setRequests(r.data) }),
      api.get('/transfers').then(r => { if (r.data?.length) setTransfers(r.data) }),
      api.get('/transfers/outbound').then(r => { if (r.data?.length) setOutboundTransfers(r.data) }),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <PageLayout title="My Requests" subtitle="Track all requests and transfers in real time">
      <LoadingScreen variant="general" />
    </PageLayout>
  )

  function applyTransferUpdate(id, newStatus) {
    const patch = t => t.id === id ? { ...t, status: newStatus } : t
    setTransfers(prev => prev.map(patch))
    setOutboundTransfers(prev => prev.map(patch))
    setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev)
  }

  async function handleAction(endpoint, id, newStatus) {
    setActionLoading(true)
    try {
      await api.patch(`/transfers/${id}/${endpoint}`)
      applyTransferUpdate(id, newStatus)
    } finally {
      setActionLoading(false)
    }
  }

  const REQUEST_FILTERS  = ['All', 'Active', 'Pending', 'Fulfilled', 'Rejected']
  const TRANSFER_FILTERS = ['All', 'Pending', 'Acknowledged', 'Ready', 'In Transit', 'Completed']

  const filters      = tab === 'requests' ? REQUEST_FILTERS : TRANSFER_FILTERS
  const rows         = tab === 'requests' ? requests : outboundTransfers
  const displayedRows = rows.filter(r => matchesFilter(r, filter, tab))
  const idField      = tab === 'requests' ? 'requestId' : 'transferId'

  return (
    <PageLayout title="My Requests" subtitle="Track all requests and transfers in real time">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSelected(null)}
      />

      {/* Slide-in drawer */}
      <div className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${selected ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {tab === 'requests' ? 'Request Details' : 'Transfer Details'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-primary">{selected?.[idField]}</span>
            <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {selected && (tab === 'requests' ? (
            /* === REQUEST DRAWER (requester hospital) === */
            <>
              <div className={`rounded-lg px-3 py-2 mb-4 text-xs font-medium ${
                selected.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                ['DELIVERED', 'COMPLETED'].includes(selected.status) ? 'bg-green-50 text-green-700' :
                'bg-primary-100 text-primary'
              }`}>
                {STATUS_LABELS[selected.status]} — {REQUEST_STATUS_NOTES[selected.status]}
              </div>

              <div className="space-y-2 text-xs mb-5">
                <h4 className="font-semibold text-gray-700">Request overview</h4>
                {[
                  ['Priority', <PriorityBadge priority={selected.priority} />],
                  ['Blood Types', (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {getBloodItems(selected).map(({ bloodType, units }) => (
                        <span key={bloodType} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                          {formatBloodType(bloodType)} <span className="text-gray-500 font-normal">{units}</span>
                        </span>
                      ))}
                    </div>
                  )],
                  ['Total Units', `${getBloodItems(selected).reduce((s, i) => s + i.units, 0)} units`],
                  ['Requested On', formatDateTime(selected.requestedAt)],
                  ['Requested By', selected.requestedByName],
                  ['Designation', selected.requestedByDesignation],
                  ['Hospital', selected.requestingHospital?.name],
                  ['Needed By', formatDateTime(selected.neededBy)],
                  ...(selected.remarks ? [['Remarks', selected.remarks]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">{k}</span>
                    <span className="font-medium text-gray-800 text-right">{v}</span>
                  </div>
                ))}
              </div>

              {/* Child transfers */}
              {(() => {
                const linked = transfers.filter(t => getLinkedRequestId(t) === selected.id)
                return (
                  <div>
                    <h4 className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Transfers ({linked.length})
                    </h4>
                    {linked.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No transfers created yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {linked.map(t => (
                          <div key={t.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-mono text-primary font-semibold">{t.transferId}</span>
                              <div className={`flex items-center gap-1 font-medium ${getStatusColor(t.status)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {STATUS_LABELS[t.status] ?? t.status}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600 flex-wrap">
                              <span className="font-bold text-red-600">{formatBloodType(t.bloodType)}</span>
                              <span className="text-gray-300">·</span>
                              <span>{t.units} units</span>
                              <span className="text-gray-300">·</span>
                              <span>from {t.donorHospital?.name ?? t.donorHospital?.code}</span>
                            </div>
                            <div className="text-gray-400 mt-1">ETA: {formatDateTime(t.estimatedDelivery)}</div>
                            {t.status === 'IN_TRANSIT' && (
                              <button
                                onClick={() => handleAction('confirm-delivered', t.id, 'RECEIVED')}
                                disabled={actionLoading}
                                className="mt-2 w-full bg-green-50 border border-green-300 text-green-800 rounded-lg py-1.5 text-xs font-semibold hover:bg-green-100 disabled:opacity-50"
                              >
                                {actionLoading ? 'Confirming...' : <><IonIcon icon={checkmarkOutline} style={{ fontSize: '0.9rem', verticalAlign: 'middle' }} /> Confirm Receipt</>}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </>
          ) : (
            /* === TRANSFER DRAWER (supplier hospital — Transfers Out) === */
            <>
              <div className={`rounded-lg px-3 py-2 mb-3 text-xs font-medium border ${
                selected.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                ['RECEIVED', 'DELIVERED'].includes(selected.status) ? 'bg-green-50 border-green-200 text-green-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                {STATUS_LABELS[selected.status] ?? selected.status} — {TRANSFER_STATUS_NOTES[selected.status] ?? ''}
              </div>

              <div className="space-y-1.5 text-xs mb-3">
                <h4 className="font-semibold text-gray-700">Transfer overview</h4>
                {[
                  ['Priority', <PriorityBadge priority={selected.priority} />],
                  ['Blood Type', formatBloodType(selected.bloodType)],
                  ['Units', `${selected.units} units`],
                  ['From', selected.donorHospital?.name],
                  ['To', selected.receivingHospital?.name],
                  ['Requested Pickup', formatDateTime(selected.requestedPickupDate)],
                  ['Expected Delivery', formatDateTime(selected.estimatedDelivery)],
                  ...(selected.purposeNotes ? [['Purpose/Notes', selected.purposeNotes]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">{k}</span>
                    <span className="font-medium text-gray-800 text-right">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-xs text-gray-700 mb-2">Transfer timeline</h4>
                <div className="space-y-2">
                  {buildTransferTimeline(selected).map((step, i, arr) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500' : step.active ? 'border-2 border-primary' : 'border-2 border-gray-200'}`}>
                          {step.done ? <IonIcon icon={checkmarkOutline} style={{ fontSize: '0.7rem', color: 'white' }} /> : <span className="w-2 h-2 rounded-full bg-gray-200" />}
                        </div>
                        {i < arr.length - 1 && <div className="w-0.5 h-5 bg-gray-200 mt-0.5" />}
                      </div>
                      <div className="pb-2">
                        <div className="text-xs font-medium text-gray-800">{step.label}</div>
                        <div className="text-xs text-gray-400">{step.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplier action buttons — one visible at a time based on status */}
              {selected.status === 'PENDING' && (
                <button
                  onClick={() => handleAction('acknowledge', selected.id, 'ACKNOWLEDGED')}
                  disabled={actionLoading}
                  className="w-full bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg py-2.5 text-sm font-semibold hover:bg-yellow-100 disabled:opacity-50"
                >
                  {actionLoading ? 'Acknowledging...' : <><IonIcon icon={checkmarkOutline} style={{ fontSize: '0.9rem', verticalAlign: 'middle' }} /> Acknowledge Transfer</>}
                </button>
              )}
              {selected.status === 'ACKNOWLEDGED' && (
                <button
                  onClick={() => handleAction('prepare', selected.id, 'PREPARING')}
                  disabled={actionLoading}
                  className="w-full bg-blue-50 border border-blue-300 text-blue-800 rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-100 disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : <><IonIcon icon={cogOutline} style={{ fontSize: '0.9rem', verticalAlign: 'middle' }} /> Mark as Preparing</>}
                </button>
              )}
              {selected.status === 'PREPARING' && (
                <button
                  onClick={() => handleAction('ready-for-pickup', selected.id, 'READY_FOR_PICKUP')}
                  disabled={actionLoading}
                  className="w-full bg-blue-50 border border-blue-300 text-blue-800 rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-100 disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : <><IonIcon icon={cubeOutline} style={{ fontSize: '0.9rem', verticalAlign: 'middle' }} /> Mark Ready for Pickup</>}
                </button>
              )}
              {selected.status === 'READY_FOR_PICKUP' && (
                <button
                  onClick={() => handleAction('dispatch', selected.id, 'IN_TRANSIT')}
                  disabled={actionLoading}
                  className="w-full bg-primary/10 border border-primary/30 text-primary rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/20 disabled:opacity-50"
                >
                  {actionLoading ? 'Dispatching...' : <><IonIcon icon={sendOutline} style={{ fontSize: '0.9rem', verticalAlign: 'middle' }} /> Dispatch</>}
                </button>
              )}
            </>
          ))}
        </div>
      </div>

      <div>
        <div>
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => { setTab('requests'); setFilter('All'); setSelected(null) }}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <IonIcon icon={clipboardOutline} style={{ fontSize: '1rem' }} /> My Requests
            </button>
            <button
              onClick={() => { setTab('transfers'); setFilter('All'); setSelected(null) }}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === 'transfers' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <IonIcon icon={refreshOutline} style={{ fontSize: '1rem' }} /> Transfers Out
            </button>
          </div>

          {/* Sub-filters */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5 flex-wrap">
              {filters.map(f => {
                const count = f === 'All' ? rows.length : rows.filter(r => matchesFilter(r, f, tab)).length
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {f} {count > 0 && count}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              Sort by: <span className="font-medium text-gray-700">{sortBy}</span>
              <span className="text-gray-400">▾</span>
            </div>
          </div>

          {/* Table */}
          {displayedRows.length === 0 ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center">
              <ClipboardList className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-medium text-gray-500">No {tab === 'requests' ? 'requests' : 'transfers'} found</p>
              <p className="text-sm text-gray-400 mt-1">
                {tab === 'requests'
                  ? 'You have not made any blood requests yet.'
                  : 'No outbound transfers assigned to your hospital.'}
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    {tab === 'requests' ? (
                      <>
                        <th className="text-left px-4 py-3 font-medium">Request ID</th>
                        <th className="text-left px-4 py-3 font-medium">Priority</th>
                        <th className="text-left px-4 py-3 font-medium">Blood Types Requested</th>
                        <th className="text-left px-4 py-3 font-medium">Total Units</th>
                        <th className="text-left px-4 py-3 font-medium">Transfers</th>
                        <th className="text-left px-4 py-3 font-medium">Requested On</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left px-4 py-3 font-medium">Transfer ID</th>
                        <th className="text-left px-4 py-3 font-medium">Priority</th>
                        <th className="text-left px-4 py-3 font-medium">Sending To</th>
                        <th className="text-left px-4 py-3 font-medium">Blood Type</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-left px-4 py-3 font-medium">ETA</th>
                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map(row => {
                    if (tab === 'requests') {
                      const isExpanded = expandedRows.has(row.id)
                      const linkedTransfers = transfers.filter(t => getLinkedRequestId(t) === row.id)
                      const bloodItems = getBloodItems(row)
                      const totalUnits = bloodItems.reduce((s, i) => s + i.units, 0)
                      return (
                        <Fragment key={row.id}>
                          <tr className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-800">{row.requestId}</div>
                              <div className="text-gray-400">{formatDate(row.requestedAt)}</div>
                            </td>
                            <td className="px-4 py-3"><PriorityBadge priority={row.priority} /></td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {bloodItems.map(({ bloodType, units }) => (
                                  <span key={bloodType} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 font-semibold">
                                    {formatBloodType(bloodType)}
                                    <span className="text-gray-500 font-normal">{units}</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-gray-800 text-sm">{totalUnits}</span>
                              <span className="text-gray-500 ml-1">units</span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{linkedTransfers.length}</td>
                            <td className="px-4 py-3">
                              <div className="text-gray-700">{formatDate(row.requestedAt)}</div>
                              <div className="text-gray-400">{formatTime(row.requestedAt)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`flex items-center gap-1 font-medium ${getStatusColor(row.status)}`}>
                                <span className="w-2 h-2 rounded-full bg-current" />
                                {STATUS_LABELS[row.status] ?? row.status}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={e => { e.stopPropagation(); setSelected(selected?.id === row.id ? null : row) }}
                                  className="px-3 py-1.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={e => toggleExpand(row.id, e)}
                                  className={`p-1.5 border rounded-lg transition-colors ${isExpanded ? 'border-primary text-primary bg-primary-50' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                  title="Show transfers"
                                >
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan={8} className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-semibold text-gray-700">Transfers ({linkedTransfers.length})</span>
                                </div>
                                {linkedTransfers.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic">No transfers have been created for this request yet.</p>
                                ) : (
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-gray-500 border-b border-gray-200">
                                        <th className="text-left py-2 pr-4 font-medium">Transfer ID</th>
                                        <th className="text-left py-2 pr-4 font-medium">From</th>
                                        <th className="text-left py-2 pr-4 font-medium">Blood Type</th>
                                        <th className="text-left py-2 pr-4 font-medium">Qty</th>
                                        <th className="text-left py-2 pr-4 font-medium">Status</th>
                                        <th className="text-left py-2 pr-4 font-medium">ETA</th>
                                        <th className="text-left py-2 font-medium">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {linkedTransfers.map(t => (
                                        <tr key={t.id} className="border-b border-gray-100 last:border-0">
                                          <td className="py-2.5 pr-4 font-mono text-primary font-semibold">{t.transferId}</td>
                                          <td className="py-2.5 pr-4 text-gray-700">{t.donorHospital?.name ?? t.donorHospital?.code}</td>
                                          <td className="py-2.5 pr-4 font-bold text-red-600">{formatBloodType(t.bloodType)}</td>
                                          <td className="py-2.5 pr-4">{t.units}u</td>
                                          <td className="py-2.5 pr-4">
                                            <div className={`flex items-center gap-1 font-medium ${getStatusColor(t.status)}`}>
                                              <span className="w-2 h-2 rounded-full bg-current" />
                                              {STATUS_LABELS[t.status] ?? t.status}
                                            </div>
                                          </td>
                                          <td className="py-2.5 pr-4 text-gray-600">{formatDate(t.estimatedDelivery)}</td>
                                          <td className="py-2.5">
                                            {t.status === 'IN_TRANSIT' && (
                                              <button
                                                onClick={() => handleAction('confirm-delivered', t.id, 'RECEIVED')}
                                                disabled={actionLoading}
                                                className="px-2 py-1 bg-green-50 border border-green-300 text-green-800 rounded text-xs font-medium hover:bg-green-100 disabled:opacity-50 whitespace-nowrap"
                                              >
                                                <IonIcon icon={checkmarkOutline} style={{ fontSize: '0.85rem', verticalAlign: 'middle' }} /> Confirm Receipt
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    }

                    /* Transfers Out tab row */
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${selected?.id === row.id ? 'bg-primary-50' : ''}`}
                        onClick={() => setSelected(selected?.id === row.id ? null : row)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{row.transferId}</div>
                          <div className="text-gray-400">{formatDate(row.createdAt)}</div>
                        </td>
                        <td className="px-4 py-3"><PriorityBadge priority={row.priority} /></td>
                        <td className="px-4 py-3 text-gray-700">{row.receivingHospital?.name ?? row.receivingHospital?.code}</td>
                        <td className="px-4 py-3 font-bold text-red-600">{formatBloodType(row.bloodType)}</td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1 font-medium ${getStatusColor(row.status)}`}>
                            <span className="w-2 h-2 rounded-full bg-current" />
                            {STATUS_LABELS[row.status] ?? row.status}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{formatDate(row.estimatedDelivery)}</div>
                          <div className="text-gray-400">{formatTime(row.estimatedDelivery)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(selected?.id === row.id ? null : row) }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-100 flex items-center justify-between">
                <span>Showing 1 to {displayedRows.length} of {rows.length} {tab === 'requests' ? 'requests' : 'transfers'}</span>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">‹</button>
                  <span className="px-2 py-1 bg-gray-100 rounded font-medium">1</span>
                  <button className="px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">›</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
