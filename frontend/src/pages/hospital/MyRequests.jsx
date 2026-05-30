import { useState, useEffect, Fragment } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import PriorityBadge from '../../components/common/PriorityBadge'
import api from '../../api/axios'
import { Check, ChevronDown, X, ClipboardList, ArrowRightLeft } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { clipboardOutline, refreshOutline } from 'ionicons/icons'

const STATUS_STEPS = ['Requested', 'Approved', 'Preparing', 'In Transit', 'Delivered']
const TRANSFER_STEPS = ['Pending', 'Acknowledged', 'Ready', 'In Transit', 'Delivered']

const STATUS_INDEX = {
  PENDING: 0, APPROVED: 1, PREPARING: 2, IN_TRANSIT: 3, DELIVERED: 4, COMPLETED: 4, REJECTED: 0
}

const TRANSFER_STATUS_INDEX = {
  PENDING: 0, ACKNOWLEDGED: 1, PREPARING: 1, READY: 2, IN_TRANSIT: 3, DELIVERED: 4
}

const TRANSFER_TIMELINE_ACTIVE = {
  PENDING: 1, ACKNOWLEDGED: 2, PREPARING: 2, READY: 3, IN_TRANSIT: 4, DELIVERED: 5
}

const STATUS_LABELS = {
  PENDING: 'Pending', APPROVED: 'Approved', PREPARING: 'Acknowledged',
  IN_TRANSIT: 'In Transit', DELIVERED: 'Delivered', COMPLETED: 'Completed',
  REJECTED: 'Rejected', ACKNOWLEDGED: 'Acknowledged', READY: 'Ready'
}

const REQUEST_STATUS_NOTES = {
  PENDING: 'Awaiting HSA review',
  APPROVED: 'Request approved, preparing for dispatch',
  PREPARING: 'Blood is being prepared for dispatch',
  IN_TRANSIT: 'Your request is on the way!',
  DELIVERED: 'Blood has been delivered successfully',
  COMPLETED: 'Request completed',
  REJECTED: 'Request has been rejected'
}

const TRANSFER_STATUS_NOTES = {
  PENDING: 'HSA has requested a blood transfer. Please acknowledge to proceed.',
  ACKNOWLEDGED: 'Transfer acknowledged — preparing blood units for pickup.',
  PREPARING: 'Transfer acknowledged — preparing blood units for pickup.',
  READY: 'Blood is ready and awaiting collection.',
  IN_TRANSIT: 'Blood is on its way to the receiving hospital.',
  DELIVERED: 'Transfer has been delivered successfully.'
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
  if (['DELIVERED', 'COMPLETED'].includes(status)) return 'text-green-600'
  if (status === 'REJECTED') return 'text-red-500'
  if (status === 'PENDING') return 'text-gray-500'
  return 'text-blue-600'
}

function buildTransferTimeline(transfer) {
  const activeIdx = TRANSFER_TIMELINE_ACTIVE[transfer.status] ?? 1
  return [
    { label: 'Requested by HSA', note: formatDateTime(transfer.createdAt) },
    { label: 'Pending Acknowledgment', note: 'Awaiting acknowledgement' },
    { label: 'Acknowledged', note: 'Preparing blood for transfer' },
    { label: 'Ready for Pickup', note: 'Blood is ready and awaiting collection' },
    { label: 'In Transit', note: 'Blood is on its way' },
    { label: 'Delivered', note: 'Transfer completed' },
  ].map((step, i) => ({ ...step, done: i < activeIdx, active: i === activeIdx }))
}

const MOCK_REQUESTS = [
  {
    id: 101, requestId: 'REQ-4976',
    requestingHospital: { name: 'Singapore General Hospital', abbreviation: 'SGH' },
    priority: 'CRITICAL',
    bloodItems: [
      { bloodType: 'O_POSITIVE', units: 20 },
      { bloodType: 'A_POSITIVE', units: 10 },
      { bloodType: 'AB_NEGATIVE', units: 5 },
    ],
    unitsRequested: 35,
    requestedAt: '2026-05-30T07:44:00', neededBy: '2026-05-31T07:44:00',
    status: 'IN_TRANSIT',
    requestedByName: 'Dr. Sarah Tan', requestedByDesignation: 'Head of Surgery',
    remarks: 'Urgent surgical requirement',
  },
  {
    id: 102, requestId: 'REQ-3330',
    requestingHospital: { name: 'Singapore General Hospital', abbreviation: 'SGH' },
    priority: 'HIGH',
    bloodItems: [
      { bloodType: 'B_POSITIVE', units: 8 },
      { bloodType: 'O_NEGATIVE', units: 5 },
    ],
    unitsRequested: 13,
    requestedAt: '2026-05-30T10:00:00', neededBy: '2026-06-01T10:00:00',
    status: 'APPROVED',
    requestedByName: 'Dr. Lim Wei', requestedByDesignation: 'ICU Specialist',
  },
  {
    id: 103, requestId: 'REQ-2109',
    requestingHospital: { name: 'Singapore General Hospital', abbreviation: 'SGH' },
    priority: 'MEDIUM',
    bloodItems: [{ bloodType: 'A_NEGATIVE', units: 6 }],
    unitsRequested: 6,
    requestedAt: '2026-05-29T14:30:00', neededBy: '2026-06-02T14:30:00',
    status: 'PENDING',
    requestedByName: 'Dr. Wong Mei', requestedByDesignation: 'Emergency Physician',
  },
]

const MOCK_TRANSFERS = [
  {
    id: 201, transferId: 'TRF-9201', requestId: 101,
    donorHospital: { name: 'HSA Blood Services', abbreviation: 'National' },
    receivingHospital: { name: 'National University Hospital', abbreviation: 'NUH' },
    bloodType: 'O_POSITIVE', units: 20, status: 'IN_TRANSIT', priority: 'CRITICAL',
    estimatedDelivery: '2026-05-30T19:44:00', createdAt: '2026-05-30T07:44:00',
  },
  {
    id: 202, transferId: 'TRF-9202', requestId: 101,
    donorHospital: { name: 'HSA Blood Services', abbreviation: 'National' },
    receivingHospital: { name: "KK Women's and Children's Hospital", abbreviation: 'KKH' },
    bloodType: 'A_POSITIVE', units: 10, status: 'IN_TRANSIT', priority: 'CRITICAL',
    estimatedDelivery: '2026-05-30T19:44:00', createdAt: '2026-05-30T07:44:00',
  },
  {
    id: 203, transferId: 'TRF-9203', requestId: 101,
    donorHospital: { name: 'HSA Blood Services', abbreviation: 'National' },
    receivingHospital: { name: 'Tan Tock Seng Hospital', abbreviation: 'TTSH' },
    bloodType: 'AB_NEGATIVE', units: 5, status: 'PENDING', priority: 'CRITICAL',
    estimatedDelivery: '2026-05-31T09:10:00', createdAt: '2026-05-30T07:44:00',
  },
]

function getBloodItems(row) {
  if (row.bloodItems?.length) return row.bloodItems
  if (row.bloodType) return [{ bloodType: row.bloodType, units: row.unitsRequested }]
  return []
}

function matchesFilter(row, filter, tab) {
  if (filter === 'All') return true
  const s = row.status?.toUpperCase() ?? ''
  if (tab === 'requests') {
    if (filter === 'Active') return ['APPROVED', 'PREPARING', 'IN_TRANSIT'].includes(s)
    if (filter === 'Pending') return s === 'PENDING'
    if (filter === 'Fulfilled') return ['DELIVERED', 'COMPLETED'].includes(s)
    if (filter === 'Rejected') return s === 'REJECTED'
  } else {
    if (filter === 'Pending')      return s === 'PENDING'
    if (filter === 'Acknowledged') return ['ACKNOWLEDGED', 'PREPARING'].includes(s)
    if (filter === 'Ready')        return ['READY', 'READY_FOR_PICKUP'].includes(s)
    if (filter === 'In Transit')   return s === 'IN_TRANSIT'
    if (filter === 'Completed')    return ['DELIVERED', 'COMPLETED'].includes(s)
  }
  return false
}

function StepProgress({ steps, currentIndex, color = 'primary' }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 ${
                done ? 'bg-green-500 border-green-500 text-white' :
                active ? `bg-${color}-500 border-${color}-500 text-white` :
                'bg-white border-gray-300 text-gray-300'
              }`}>
                {done ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </div>
              <span className="text-xs text-gray-400 mt-1 whitespace-nowrap" style={{ fontSize: 9 }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-5 mb-4 ${i < currentIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Request ID', 'Priority', 'Status', 'Progress', 'ETA', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3">
                <div className="h-3 bg-gray-200 rounded w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(4)].map((_, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="px-4 py-3 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-28" />
                <div className="h-2.5 bg-gray-100 rounded w-20" />
              </td>
              <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded w-16" /></td>
              <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-14" /></td>
              <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded w-32" /></td>
              <td className="px-4 py-3 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-2.5 bg-gray-100 rounded w-24" />
              </td>
              <td className="px-4 py-3"><div className="h-7 bg-gray-200 rounded w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function MyRequests() {
  const [tab, setTab]                   = useState('requests')
  const [filter, setFilter]             = useState('All')
  const [sortBy, setSortBy]             = useState('Latest')
  const [selected, setSelected]         = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [requests, setRequests]         = useState(MOCK_REQUESTS)
  const [transfers, setTransfers]       = useState(MOCK_TRANSFERS)
  const [loading, setLoading]           = useState(true)
  const [acknowledging, setAcknowledging] = useState(false)

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
    ]).finally(() => setLoading(false))
  }, [])

  async function handleAcknowledge() {
    if (!selected) return
    setAcknowledging(true)
    try {
      await api.patch(`/transfers/${selected.id}/acknowledge`)
      const updated = transfers.map(t =>
        t.id === selected.id ? { ...t, status: 'ACKNOWLEDGED' } : t
      )
      setTransfers(updated)
      setSelected(prev => ({ ...prev, status: 'ACKNOWLEDGED' }))
    } finally {
      setAcknowledging(false)
    }
  }

  const REQUEST_FILTERS = ['All', 'Active', 'Pending', 'Fulfilled', 'Rejected']
  const TRANSFER_FILTERS = ['All', 'Pending', 'Acknowledged', 'Ready', 'In Transit', 'Completed']

  const filters = tab === 'requests' ? REQUEST_FILTERS : TRANSFER_FILTERS
  const rows = tab === 'requests' ? requests : transfers
  const displayedRows = rows.filter(r => matchesFilter(r, filter, tab))
  const idField = tab === 'requests' ? 'requestId' : 'transferId'

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

              {/* Linked transfers */}
              {(() => {
                const linked = transfers.filter(t => t.requestId === selected.id)
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
                              <span>→ {t.receivingHospital?.abbreviation ?? t.receivingHospital?.name}</span>
                            </div>
                            <div className="text-gray-400 mt-1">ETA: {formatDateTime(t.estimatedDelivery)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </>
          ) : (
            <>
              <div className={`rounded-lg px-3 py-2 mb-3 text-xs font-medium border ${
                selected.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                selected.status === 'DELIVERED' ? 'bg-green-50 border-green-200 text-green-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                {STATUS_LABELS[selected.status] ?? selected.status} — {TRANSFER_STATUS_NOTES[selected.status]}
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
              <div>
                <h4 className="font-semibold text-xs text-gray-700 mb-2">Transfer timeline</h4>
                <div className="space-y-2">
                  {buildTransferTimeline(selected).map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500' : step.active ? 'border-2 border-primary' : 'border-2 border-gray-200'}`}>
                          {step.done ? <Check className="w-3 h-3 text-white" /> : <span className="w-2 h-2 rounded-full bg-gray-200" />}
                        </div>
                        {i < 5 && <div className="w-0.5 h-5 bg-gray-200 mt-0.5" />}
                      </div>
                      <div className="pb-2">
                        <div className="text-xs font-medium text-gray-800">{step.label}</div>
                        <div className="text-xs text-gray-400">{step.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selected.status === 'PENDING' && (
                <button
                  onClick={handleAcknowledge}
                  disabled={acknowledging}
                  className="w-full mt-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg py-2.5 text-sm font-semibold hover:bg-yellow-100 disabled:opacity-50"
                >
                  {acknowledging ? 'Acknowledging...' : '✓ Acknowledge Transfer'}
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
          {loading ? (
            <TableSkeleton />
          ) : displayedRows.length === 0 ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center">
              <ClipboardList className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-medium text-gray-500">No {tab === 'requests' ? 'requests' : 'transfers'} found</p>
              <p className="text-sm text-gray-400 mt-1">
                {tab === 'requests' ? 'You have not made any blood requests yet.' : 'No outbound transfers at this time.'}
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
                        <th className="text-left px-4 py-3 font-medium">No. of Transfers</th>
                        <th className="text-left px-4 py-3 font-medium">Requested On</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left px-4 py-3 font-medium">Transfer ID</th>
                        <th className="text-left px-4 py-3 font-medium">Priority</th>
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
                      const linkedTransfers = transfers.filter(t => t.requestId === row.id)
                      const bloodItems = getBloodItems(row)
                      const totalUnits = bloodItems.reduce((s, i) => s + i.units, 0)
                      return (
                        <Fragment key={row.id}>
                          <tr className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-800">{row.requestId}</div>
                              <div className="text-gray-400">{formatDate(row.requestedAt)}</div>
                              <div className="text-gray-400">{formatTime(row.requestedAt)}</div>
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
                              {bloodItems.length > 1 && (
                                <div className="text-gray-400 mt-0.5">{bloodItems.length} blood types</div>
                              )}
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
                                        <th className="text-left py-2 pr-6 font-medium">Transfer ID</th>
                                        <th className="text-left py-2 pr-6 font-medium">From</th>
                                        <th className="text-left py-2 pr-6 font-medium">To</th>
                                        <th className="text-left py-2 pr-6 font-medium">Blood Type</th>
                                        <th className="text-left py-2 pr-6 font-medium">Quantity</th>
                                        <th className="text-left py-2 pr-6 font-medium">Status</th>
                                        <th className="text-left py-2 font-medium">ETA</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {linkedTransfers.map(t => (
                                        <tr key={t.id} className="border-b border-gray-100 last:border-0">
                                          <td className="py-2.5 pr-6 font-mono text-primary font-semibold">{t.transferId}</td>
                                          <td className="py-2.5 pr-6">
                                            <div className="font-medium text-gray-800">{t.donorHospital?.name}</div>
                                            {t.donorHospital?.abbreviation && <div className="text-gray-400">({t.donorHospital.abbreviation})</div>}
                                          </td>
                                          <td className="py-2.5 pr-6">
                                            <div className="font-medium text-gray-800">{t.receivingHospital?.name}</div>
                                            {t.receivingHospital?.abbreviation && <div className="text-gray-400">({t.receivingHospital.abbreviation})</div>}
                                          </td>
                                          <td className="py-2.5 pr-6 font-bold text-red-600">{formatBloodType(t.bloodType)}</td>
                                          <td className="py-2.5 pr-6">{t.units} units</td>
                                          <td className="py-2.5 pr-6">
                                            <div className={`flex items-center gap-1 font-medium ${getStatusColor(t.status)}`}>
                                              <span className="w-2 h-2 rounded-full bg-current" />
                                              {STATUS_LABELS[t.status] ?? t.status}
                                            </div>
                                          </td>
                                          <td className="py-2.5">
                                            <div className="text-gray-700">{formatDate(t.estimatedDelivery)}</div>
                                            <div className="text-gray-400">{formatTime(t.estimatedDelivery)}</div>
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

                    // Transfers tab row
                    const rowDate = row.createdAt
                    const rowEta  = row.estimatedDelivery
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${selected?.id === row.id ? 'bg-primary-50' : ''}`}
                        onClick={() => setSelected(selected?.id === row.id ? null : row)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{row.transferId}</div>
                          <div className="text-gray-400">{formatDate(rowDate)}</div>
                          <div className="text-gray-400">{formatTime(rowDate)}</div>
                        </td>
                        <td className="px-4 py-3"><PriorityBadge priority={row.priority} /></td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1 font-medium ${getStatusColor(row.status)}`}>
                            <span className="w-2 h-2 rounded-full bg-current" />
                            {STATUS_LABELS[row.status] ?? row.status}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{formatDate(rowEta)}</div>
                          <div className="text-gray-400">{formatTime(rowEta)}</div>
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
