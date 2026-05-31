import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import PriorityBadge from '../../components/common/PriorityBadge'
import api from '../../api/axios'
import { X, ArrowRightLeft } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { checkmarkOutline } from 'ionicons/icons'

const STATUS_LABELS = {
  PENDING: 'Pending', ACKNOWLEDGED: 'Acknowledged', PREPARING: 'Acknowledged',
  READY: 'Ready', READY_FOR_PICKUP: 'Ready',
  IN_TRANSIT: 'In Transit', DELIVERED: 'Delivered', RECEIVED: 'Delivered'
}

const TRANSFER_STATUS_NOTES = {
  PENDING: 'Awaiting acknowledgment from the receiving hospital.',
  ACKNOWLEDGED: 'Acknowledged — donor hospital is preparing blood units.',
  PREPARING: 'Acknowledged — donor hospital is preparing blood units.',
  READY: 'Blood is ready and awaiting collection.',
  READY_FOR_PICKUP: 'Blood is ready and awaiting collection.',
  IN_TRANSIT: 'Blood is on its way to the receiving hospital.',
  DELIVERED: 'Transfer has been delivered successfully.',
  RECEIVED: 'Transfer has been delivered successfully.'
}

// DEL = HSA delivery (starts IN_TRANSIT, no PENDING/ACKNOWLEDGED)
// TRF = inter-hospital transfer (full workflow)
const DEL_STEPS = ['In Transit', 'Delivered']
const TRF_STEPS = ['Pending', 'Acknowledged', 'Ready', 'In Transit', 'Delivered']

const DEL_STATUS_INDEX  = { IN_TRANSIT: 0, DELIVERED: 1, RECEIVED: 1 }
const TRF_STATUS_INDEX  = { PENDING: 0, ACKNOWLEDGED: 1, PREPARING: 1, READY: 2, READY_FOR_PICKUP: 2, IN_TRANSIT: 3, DELIVERED: 4, RECEIVED: 4 }

const TRF_TIMELINE_ACTIVE = { PENDING: 1, ACKNOWLEDGED: 2, PREPARING: 2, READY: 3, READY_FOR_PICKUP: 3, IN_TRANSIT: 4, DELIVERED: 5, RECEIVED: 5 }

const STATUS_FILTERS = ['All', 'Pending', 'Acknowledged', 'Ready', 'In Transit', 'Completed']
const TYPE_FILTERS   = ['All', 'HSA Deliveries', 'Inter-hospital']

function isHsaDelivery(transfer) {
  return transfer.transferId?.startsWith('DEL') || transfer.donorHospital?.code === 'HSA'
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
  if (['DELIVERED', 'RECEIVED'].includes(status)) return 'text-green-600'
  if (status === 'PENDING') return 'text-gray-500'
  return 'text-blue-600'
}

function matchesStatusFilter(row, filter) {
  if (filter === 'All') return true
  const s = row.status?.toUpperCase() ?? ''
  if (filter === 'Pending')      return s === 'PENDING'
  if (filter === 'Acknowledged') return ['ACKNOWLEDGED', 'PREPARING'].includes(s)
  if (filter === 'Ready')        return ['READY', 'READY_FOR_PICKUP'].includes(s)
  if (filter === 'In Transit')   return s === 'IN_TRANSIT'
  if (filter === 'Completed')    return ['DELIVERED', 'RECEIVED'].includes(s)
  return false
}

function matchesTypeFilter(row, filter) {
  if (filter === 'All') return true
  const del = isHsaDelivery(row)
  if (filter === 'HSA Deliveries') return del
  if (filter === 'Inter-hospital') return !del
  return true
}

function buildTrfTimeline(transfer) {
  const activeIdx = TRF_TIMELINE_ACTIVE[transfer.status] ?? 1
  return [
    { label: 'Transfer Created', note: formatDateTime(transfer.createdAt) },
    { label: 'Pending Acknowledgment', note: 'Awaiting acknowledgement from receiving hospital' },
    { label: 'Acknowledged', note: 'Donor hospital preparing blood units' },
    { label: 'Ready for Pickup', note: 'Blood is ready and awaiting collection' },
    { label: 'In Transit', note: 'Blood is on its way' },
    { label: 'Delivered', note: 'Transfer completed' },
  ].map((step, i) => ({ ...step, done: i < activeIdx, active: i === activeIdx }))
}

function buildDelTimeline(transfer) {
  const delivered = ['DELIVERED', 'RECEIVED'].includes(transfer.status?.toUpperCase())
  return [
    { label: 'HSA Dispatched', note: formatDateTime(transfer.createdAt), done: true, active: false },
    { label: 'In Transit', note: `ETA: ${formatDateTime(transfer.estimatedDelivery)}`, done: delivered, active: !delivered },
    { label: 'Delivered', note: delivered ? 'Delivery completed' : 'Awaiting delivery', done: delivered, active: false },
  ]
}

function StepProgress({ steps, currentIndex }) {
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
                active ? 'bg-primary-500 border-primary-500 text-white' :
                'bg-white border-gray-300 text-gray-300'
              }`}>
                {done ? <IonIcon icon={checkmarkOutline} style={{ fontSize: '0.7rem' }} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </div>
              <span className="text-gray-400 mt-1 whitespace-nowrap" style={{ fontSize: 9 }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-4 mb-4 ${i < currentIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
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
            {['ID', 'Type', 'Route', 'Blood Type', 'Priority', 'Status', 'ETA', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3">
                <div className="h-3 bg-gray-200 rounded w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(4)].map((_, i) => (
            <tr key={i} className="border-b border-gray-50">
              {[...Array(8)].map((_, j) => (
                <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-20" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function HsaTransfers() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter]     = useState('All')
  const [selected, setSelected]         = useState(null)
  const [transfers, setTransfers]       = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.get('/transfers').then(r => setTransfers(r.data)).finally(() => setLoading(false))
  }, [])

  const displayed = transfers.filter(r =>
    matchesStatusFilter(r, statusFilter) && matchesTypeFilter(r, typeFilter)
  )

  return (
    <PageLayout title="Transfers" subtitle="Monitor all blood deliveries and inter-hospital transfers">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSelected(null)}
      />

      {/* Slide-in drawer */}
      <div className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${selected ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Transfer Details</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-primary">{selected?.transferId}</span>
            <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {selected && (() => {
            const del = isHsaDelivery(selected)
            const timeline = del ? buildDelTimeline(selected) : buildTrfTimeline(selected)
            return (
              <>
                <div className={`rounded-lg px-3 py-2 mb-3 text-xs font-medium border ${
                  selected.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  ['DELIVERED', 'RECEIVED'].includes(selected.status) ? 'bg-green-50 border-green-200 text-green-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <span className="font-semibold">{del ? 'HSA Delivery' : 'Inter-hospital Transfer'}</span>
                  {' — '}{TRANSFER_STATUS_NOTES[selected.status] ?? STATUS_LABELS[selected.status]}
                </div>

                <div className="space-y-1.5 text-xs mb-4">
                  <h4 className="font-semibold text-gray-700">Overview</h4>
                  {[
                    ['Priority', <PriorityBadge priority={selected.priority} />],
                    ['Blood Type', formatBloodType(selected.bloodType)],
                    ['Units', `${selected.units} units`],
                    ['From', del ? 'HSA Blood Services' : selected.donorHospital?.name],
                    ['To', selected.receivingHospital?.name],
                    ['Created', formatDateTime(selected.createdAt)],
                    ['Est. Delivery', formatDateTime(selected.estimatedDelivery)],
                    ...(selected.purposeNotes ? [['Notes', selected.purposeNotes]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-gray-500 flex-shrink-0">{k}</span>
                      <span className="font-medium text-gray-800 text-right">{v}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-gray-700 mb-2">Timeline</h4>
                  <div className="space-y-2">
                    {timeline.map((step, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500' : step.active ? 'border-2 border-primary' : 'border-2 border-gray-200'}`}>
                            {step.done ? <IonIcon icon={checkmarkOutline} style={{ fontSize: '0.7rem', color: 'white' }} /> : <span className="w-2 h-2 rounded-full bg-gray-200" />}
                          </div>
                          {i < timeline.length - 1 && <div className="w-0.5 h-5 bg-gray-200 mt-0.5" />}
                        </div>
                        <div className="pb-2">
                          <div className="text-xs font-medium text-gray-800">{step.label}</div>
                          <div className="text-xs text-gray-400">{step.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      </div>

      <div>
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map(f => {
                const count = f === 'All' ? transfers.length : transfers.filter(r => matchesStatusFilter(r, f)).length
                return (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusFilter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {f} {count > 0 && count}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-1.5 ml-auto">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : displayed.length === 0 ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center">
              <ArrowRightLeft className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-medium text-gray-500">No transfers found</p>
              <p className="text-sm text-gray-400 mt-1">No records match the current filter.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium">Transfer ID</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Route</th>
                    <th className="text-left px-4 py-3 font-medium">Blood Type</th>
                    <th className="text-left px-4 py-3 font-medium">Priority</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">ETA</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(row => {
                    const del = isHsaDelivery(row)
                    const route = del
                      ? `HSA → ${row.receivingHospital?.name ?? '?'}`
                      : `${row.donorHospital?.name ?? '?'} → ${row.receivingHospital?.name ?? '?'}`
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
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${del ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                            {del ? 'HSA Delivery' : 'Inter-hospital'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700 max-w-[180px] truncate" title={route}>{route}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-red-600">{formatBloodType(row.bloodType)}</td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={row.priority} />
                        </td>
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
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-100">
                Showing {displayed.length} of {transfers.length} transfers
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
