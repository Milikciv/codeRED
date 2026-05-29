import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import PriorityBadge from '../../components/common/PriorityBadge'
import api from '../../api/axios'
import { Check, Clock, ChevronRight, X, ClipboardList } from 'lucide-react'

const STATUS_STEPS = ['Requested', 'Approved', 'Preparing', 'In Transit', 'Delivered']
const TRANSFER_STEPS = ['Acknowledge', 'Preparing', 'Ready', 'In Transit', 'Delivered']

const STATUS_INDEX = {
  PENDING: 0, APPROVED: 1, PREPARING: 2, IN_TRANSIT: 3, DELIVERED: 4, COMPLETED: 4
}

function formatBloodType(bt) {
  return bt?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') ?? bt
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

const MOCK_REQUESTS = [
  { id: 1, requestId: 'REQ-2025-1003', date: '21 May 2025', time: '17:05', priority: 'CRITICAL', status: 'ACTIVE', statusLabel: 'Active', statusStep: 3, eta: '21 May 18:00' },
  { id: 2, requestId: 'REQ-2025-1003', date: '21 May 2025', time: '17:05', priority: 'MEDIUM', status: 'COMPLETED', statusLabel: 'Completed', statusStep: 4, eta: '21 May 18:00' },
  { id: 3, requestId: 'REQ-2025-1003', date: '21 May 2025', time: '17:05', priority: 'MEDIUM', status: 'ACTIVE', statusLabel: 'Active', statusStep: 3, eta: '21 May 18:00' },
  { id: 4, requestId: 'REQ-2025-1003', date: '21 May 2025', time: '17:05', priority: 'MEDIUM', status: 'PENDING', statusLabel: 'Pending', statusStep: 0, eta: '21 May 18:00' },
]

const MOCK_TRANSFERS = [
  { id: 1, transferId: 'TRF-2025-1003', date: '21 May 2025', time: '17:05', priority: 'CRITICAL', status: 'Pending', step: 0, eta: '21 May 18:00' },
  { id: 2, transferId: 'TRF-2025-1003', date: '21 May 2025', time: '17:05', priority: 'MEDIUM', status: 'Active', step: 2, eta: '21 May 18:00' },
  { id: 3, transferId: 'TRF-2025-1003', date: '21 May 2025', time: '17:05', priority: 'CRITICAL', status: 'Completed', step: 4, eta: '21 May 18:00' },
  { id: 4, transferId: 'TRF-2025-1003', date: '21 May 2025', time: '17:05', priority: 'MEDIUM', status: 'Ready', step: 2, eta: '21 May 18:00' },
]

const DETAIL_MOCK = {
  requestId: 'REQ-2025-1001',
  status: 'In Transit',
  statusNote: 'Your request is on the way!',
  priority: 'Critical',
  bloodTypeUnits: 'O+(20), A+(10)',
  totalUnits: 30,
  requestedOn: '21 May 2025, 17:05',
  requestedBy: 'Dr James Tan',
  hospital: 'Singapore General Hospital',
  expectedDelivery: '21 May 2025, 18:00',
  transfers: [
    { id: 'TRF-2001', from: 'HSA Blood Bank', to: 'Singapore General Hospital', bloodType: 'O+ (20 units)', dispatchedAt: '21 May 2025, 17:45', eta: '21 May 2025, 18:00', status: 'In Transit' },
    { id: 'TRF-2002', from: 'Sengkang General Hospital', to: 'Singapore General Hospital', bloodType: 'A+ (10 units)', dispatchedAt: '21 May 2025, 17:25', eta: '21 May 2025, 19:00', status: 'In Transit' },
  ]
}

const TRANSFER_DETAIL_MOCK = {
  transferId: 'TRF-2025-3001',
  note: 'HSA has requested a blood transfer. Please acknowledge to proceed.',
  priority: 'Critical',
  bloodTypeUnits: 'O+(20), A+(10)',
  totalUnits: 30,
  requestedBy: 'HSA',
  requestedPickupDate: '21 May 2025, 17:05',
  purposeNotes: 'Urgent Transfer for surgery',
  expectedDelivery: '21 May 2025, 18:00',
  timeline: [
    { label: 'Requested by HSA', time: '23 May 2025, 15:15', done: true },
    { label: 'Pending Acknowledgment', note: 'Awaiting acknowledgement', done: false, active: true },
    { label: 'Preparing', note: 'Prepare blood for transfer', done: false },
    { label: 'Ready for Pickup', note: 'Blood is ready and awaiting collection', done: false },
    { label: 'In Transit', note: 'Blood is on its way', done: false },
    { label: 'Delivered', note: 'Transfer completed', done: false },
  ]
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
  const [tab, setTab]             = useState('requests')
  const [filter, setFilter]       = useState('All')
  const [sortBy, setSortBy]       = useState('Latest')
  const [selected, setSelected]   = useState(null)
  const [requests, setRequests]   = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/requests').then(r => setRequests(r.data)),
      api.get('/transfers').then(r => setTransfers(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  const REQUEST_FILTERS = ['All', 'Active', 'Pending', 'Fulfilled', 'Rejected']
  const TRANSFER_FILTERS = ['All', 'In Transit', 'Preparing', 'Ready', 'Completed', 'Pending']

  const filters = tab === 'requests' ? REQUEST_FILTERS : TRANSFER_FILTERS
  const rows = tab === 'requests' ? MOCK_REQUESTS : MOCK_TRANSFERS
  const idField = tab === 'requests' ? 'requestId' : 'transferId'

  return (
    <PageLayout title="My Requests" subtitle="Track all requests and transfers in real time">
      <div className="flex gap-4">
        {/* Main table */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => { setTab('requests'); setSelected(null) }}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              📋 My Requests
            </button>
            <button
              onClick={() => { setTab('transfers'); setSelected(null) }}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === 'transfers' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              🔄 Transfers Out
            </button>
          </div>

          {/* Sub-filters */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5 flex-wrap">
              {filters.map(f => {
                const count = f === 'All' ? rows.length : rows.filter(r => r.statusLabel?.toLowerCase() === f.toLowerCase() || r.status?.toLowerCase() === f.toLowerCase()).length
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
          ) : rows.length === 0 ? (
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
                    <th className="text-left px-4 py-3 font-medium">Request ID</th>
                    <th className="text-left px-4 py-3 font-medium">Priority</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Progress</th>
                    <th className="text-left px-4 py-3 font-medium">ETA</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${selected?.id === row.id ? 'bg-primary-50' : ''}`}
                      onClick={() => setSelected(selected?.id === row.id ? null : row)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{row[idField]}</div>
                        <div className="text-gray-400">{row.date}</div>
                        <div className="text-gray-400">{row.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={row.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          row.status === 'COMPLETED' || row.status === 'Completed' ? 'text-green-600' :
                          row.status === 'PENDING' || row.status === 'Pending' ? 'text-gray-500' :
                          'text-blue-600'
                        }`}>
                          <span className="w-2 h-2 rounded-full bg-current" />
                          {row.statusLabel ?? row.status}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StepProgress
                          steps={tab === 'requests' ? STATUS_STEPS : TRANSFER_STEPS}
                          currentIndex={row.statusStep ?? row.step ?? 0}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{row.eta}</div>
                        <div className="text-gray-400">Updated 2 mins ago</div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(selected?.id === row.id ? null : row) }}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-100 flex items-center justify-between">
                <span>Showing 1 to {rows.length} of {rows.length} {tab === 'requests' ? 'requests' : 'Transfers'}</span>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">‹</button>
                  <span className="px-2 py-1 bg-gray-100 rounded font-medium">1</span>
                  <button className="px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">›</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0 card p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-800">
                {tab === 'requests' ? 'Request Details' : 'Transfer Details'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-primary">{tab === 'requests' ? DETAIL_MOCK.requestId : TRANSFER_DETAIL_MOCK.transferId}</span>
                <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
              </div>
            </div>

            {tab === 'requests' ? (
              <>
                <div className="bg-primary-100 rounded-lg px-3 py-2 mb-3 text-xs text-primary font-medium">
                  {DETAIL_MOCK.status} — {DETAIL_MOCK.statusNote}
                </div>
                <div className="space-y-2 text-xs mb-3">
                  <h4 className="font-semibold text-gray-700">Request overview</h4>
                  {[
                    ['Priority', <span className="badge-critical">{DETAIL_MOCK.priority}</span>],
                    ['Blood Type & Units', DETAIL_MOCK.bloodTypeUnits],
                    ['Total Units', `${DETAIL_MOCK.totalUnits} Units`],
                    ['Requested on', DETAIL_MOCK.requestedOn],
                    ['Requested By', DETAIL_MOCK.requestedBy],
                    ['Hospital', DETAIL_MOCK.hospital],
                    ['Expected Delivery', DETAIL_MOCK.expectedDelivery],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-gray-500 flex-shrink-0">{k}</span>
                      <span className="font-medium text-gray-800 text-right">{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-gray-700 mb-2">Transfers ({DETAIL_MOCK.transfers.length})</h4>
                  <p className="text-xs text-gray-500 mb-2">This request contains multiple transfers from blood bank and hospitals</p>
                  {DETAIL_MOCK.transfers.map(t => (
                    <div key={t.id} className="border border-gray-100 rounded-lg p-3 mb-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-gray-500">{t.id}</span>
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">{t.status}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span className="font-medium">{t.from}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="font-medium">{t.to}</span>
                      </div>
                      <div className="text-gray-400 mt-1">{t.bloodType}</div>
                      <div className="text-gray-400">Dispatched: {t.dispatchedAt}</div>
                      <div className="text-gray-400">ETA: {t.eta}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3 text-xs text-yellow-800 font-medium">
                  Pending Acknowledgement — {TRANSFER_DETAIL_MOCK.note}
                </div>
                <div className="space-y-1.5 text-xs mb-3">
                  <h4 className="font-semibold text-gray-700">Transfer overview</h4>
                  {[
                    ['Priority', <span className="badge-critical">{TRANSFER_DETAIL_MOCK.priority}</span>],
                    ['Blood Type & Units', TRANSFER_DETAIL_MOCK.bloodTypeUnits],
                    ['Total Units', `${TRANSFER_DETAIL_MOCK.totalUnits} Units`],
                    ['Requested By', TRANSFER_DETAIL_MOCK.requestedBy],
                    ['Requested Pickup Date', TRANSFER_DETAIL_MOCK.requestedPickupDate],
                    ['Purpose/Notes', TRANSFER_DETAIL_MOCK.purposeNotes],
                    ['Expected Delivery', TRANSFER_DETAIL_MOCK.expectedDelivery],
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
                    {TRANSFER_DETAIL_MOCK.timeline.map((step, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500' : step.active ? 'border-2 border-primary' : 'border-2 border-gray-200'}`}>
                            {step.done ? <Check className="w-3 h-3 text-white" /> : <span className="w-2 h-2 rounded-full bg-gray-200" />}
                          </div>
                          {i < TRANSFER_DETAIL_MOCK.timeline.length - 1 && <div className="w-0.5 h-5 bg-gray-200 mt-0.5" />}
                        </div>
                        <div className="pb-2">
                          <div className="text-xs font-medium text-gray-800">{step.label}</div>
                          {(step.time || step.note) && <div className="text-xs text-gray-400">{step.time ?? step.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full mt-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg py-2.5 text-sm font-semibold hover:bg-yellow-100">
                  ✓ Acknowledge Transfer
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
