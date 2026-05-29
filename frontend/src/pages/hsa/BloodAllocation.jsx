import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import PriorityBadge from '../../components/common/PriorityBadge'
import Toast from '../../components/common/Toast'
import ConfirmModal from '../../components/common/ConfirmModal'
import api from '../../api/axios'
import { Filter, List, Building2, Check, X, Star, ClipboardList } from 'lucide-react'
import LoadingScreen from '../../components/common/LoadingScreen'

const PRIORITY_TABS = ['All', 'Critical', 'High', 'Medium']

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
  const [requests, setRequests]     = useState([])
  const [selected, setSelected]     = useState(null)
  const [inventory, setInventory]   = useState(null)
  const [donorHospitals, setDonorHospitals] = useState([])
  const [allocations, setAllocations] = useState({})
  const [tab, setTab]               = useState('All')
  const [toast, setToast]           = useState(null)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showConfirmApprove, setShowConfirmApprove] = useState(false)
  const [aiRecommended, setAiRecommended] = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/requests').then(r => setRequests(r.data)),
      api.get('/allocation/inventory').then(r => setInventory(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  const selectRequest = async (req) => {
    setSelected(req)
    setAllocations({})
    setAiRecommended(false)
    try {
      const { data } = await api.get(`/allocation/donor-hospitals/${req.id}`)
      setDonorHospitals(data)
    } catch {
      setDonorHospitals([])
    }
  }

  const setUnits = (hospitalId, value) => {
    setAllocations(prev => ({ ...prev, [hospitalId]: Math.max(0, value) }))
  }

  const totalAllocated = Object.values(allocations).reduce((a, b) => a + (b || 0), 0)
  const needed = selected?.unitsRequested ?? 0

  const buildAiAlloc = () => {
    const safe = donorHospitals.filter(h => h.safeToTransfer === 'Yes')
    const newAlloc = {}
    let remaining = needed
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
    await api.post('/allocation/approve', { requestId: selected.id, allocations })
    setToast({ type: 'success', title: 'Success!', message: 'Blood units have been allocated and dispatch notification sent' })
  }

  const filteredRequests = requests.filter(r =>
    tab === 'All' ? true : r.priority?.toLowerCase() === tab.toLowerCase()
  )

  const safeColor = (s) => {
    if (s === 'Yes') return 'text-green-600 bg-green-50'
    if (s === 'Caution') return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

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
          title="Confirm approval and allocate?"
          message="Once confirmed, hospitals will be notified accordingly."
          confirmLabel="Confirm"
          confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
          onCancel={() => setShowConfirmApprove(false)}
          onConfirm={confirmApprove}
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
                ⓘ <span className="font-semibold">AI Recommended Allocation</span>
                <span className="text-gray-500">— The allocation helps maintain safe stock levels at hospitals and ensures timely availability of blood units</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary">{selected.requestId}</span>
                    <span className="text-xs text-gray-400">17 mins ago</span>
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
                    <div className="ml-auto text-xs text-right">
                      <div className="text-gray-400">Current Stock</div>
                      <div className="font-semibold text-gray-700">12% <span className="text-red-500">●</span></div>
                    </div>
                  </div>
                  {selected.reason && <p className="text-xs text-gray-500 mt-2 leading-tight">{selected.reason}</p>}
                  <button className="text-xs text-primary font-medium mt-1">View Details</button>
                </div>

                <div className="col-span-2">
                  <table className="w-full text-xs mb-3">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="text-left pb-2 font-medium">Hospital</th>
                        <th className="text-center pb-2 font-medium">Distance</th>
                        <th className="text-center pb-2 font-medium">Units</th>
                        <th className="text-center pb-2 font-medium">ETA</th>
                        <th className="text-center pb-2 font-medium">Transport Type</th>
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
                            <td className="py-2 text-center text-gray-600">{h.distance}</td>
                            <td className="py-2 text-center font-bold text-gray-800">{units} units</td>
                            <td className="py-2 text-center text-gray-600">20 Minutes</td>
                            <td className="py-2 text-center">
                              <span className="text-primary text-xs font-semibold">🚁 Priority Transport</span>
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
                🚀 Approve &amp; Allocate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 h-full">
        {/* Left: Incoming Requests */}
        <div className="w-72 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-800">Incoming Requests</h3>
            <div className="flex gap-1">
              <button className="p-1 text-gray-400 hover:text-gray-600"><Filter className="w-4 h-4" /></button>
              <button className="p-1 text-gray-400 hover:text-gray-600"><List className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Priority tabs */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {PRIORITY_TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  tab === t
                    ? t === 'All' ? 'bg-gray-800 text-white' : t === 'Critical' ? 'bg-red-600 text-white' : t === 'High' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t} {t === 'All' ? filteredRequests.length : requests.filter(r => r.priority?.toLowerCase() === t.toLowerCase()).length}
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
                <p className="text-xs text-gray-400 mt-1">
                  {tab === 'All' ? 'No incoming blood requests at this time.' : `No ${tab.toLowerCase()} priority requests.`}
                </p>
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
                    <span className="text-xs text-gray-400">{timeAgo(req.requestedAt)}</span>
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
                    <div className="ml-auto text-xs">
                      <div className="text-gray-500">Current Stock</div>
                      <div className="font-semibold text-gray-700">
                        {req.requestingHospital?.code} <span className="text-red-500">●</span>
                      </div>
                    </div>
                  </div>
                  {req.reason && <p className="text-xs text-gray-500 mt-1 leading-tight">{req.reason}</p>}
                  <button className="text-xs text-primary font-medium mt-1">View Details</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Allocation Workbench */}
        <div className="flex-1 flex flex-col gap-4">
          {/* National inventory — always visible */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-700">National Blood Inventory Overview</h4>
              <span className="text-xs text-gray-500">Total Stock: {inventory?.totalStock?.toLocaleString()}</span>
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
              {!inventory && (
                <div className="col-span-4 text-xs text-gray-400 text-center py-4">Inventory data unavailable</div>
              )}
            </div>
          </div>

          {!selected ? (
            <div className="card flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-6xl mb-4 opacity-20">📋</div>
              <h3 className="text-lg font-semibold text-gray-600">Please select one request to start allocating!</h3>
              <p className="text-sm text-gray-400 mt-2">Choose a request from the left to view details and allocate blood units</p>
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

              {/* Goal */}
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3 text-xs text-blue-700">
                ⓘ Goal: Meet the requested units while keeping donor hospitals above safe stock threshold.
                <span className="flex items-center gap-1 ml-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Yes (Safe)
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block ml-1" /> Caution (Low)
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block ml-1" /> No (Unsafe)
                </span>
              </div>

              {/* Donor Hospitals table */}
              <h4 className="text-xs font-semibold text-gray-700 mb-2">1. Select Donor Hospitals</h4>
              {donorHospitals.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 border border-gray-100 rounded-lg mb-4">No donor hospitals available for this request.</p>
              ) : (
                <table className="w-full text-xs mb-4">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100">
                      <th className="text-left pb-1.5 font-medium">Hospital</th>
                      <th className="text-center pb-1.5 font-medium">Distance</th>
                      <th className="text-center pb-1.5 font-medium">{formatBloodType(selected.bloodType)}-Stock (units)</th>
                      <th className="text-center pb-1.5 font-medium">Safe to Transfer</th>
                      <th className="text-center pb-1.5 font-medium">Max Safe Transfer</th>
                      <th className="text-center pb-1.5 font-medium">Select Units</th>
                    </tr>
                  </thead>
                  <tbody>
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
                        <td className="text-center text-gray-600">{h.distance}</td>
                        <td className="text-center">
                          <span className="text-green-700 font-semibold">{h.stock}</span>
                          <span className="text-gray-400"> ({h.stockPct}%)</span>
                        </td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${safeColor(h.safeToTransfer)}`}>
                            {h.safeToTransfer}
                          </span>
                        </td>
                        <td className="text-center text-gray-600">{h.maxSafeTransfer}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setUnits(h.hospitalId, (allocations[h.hospitalId] || 0) - 1)} className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">−</button>
                            <span className="w-8 text-center font-medium">{allocations[h.hospitalId] || 0}</span>
                            <button onClick={() => setUnits(h.hospitalId, (allocations[h.hospitalId] || 0) + 1)} className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Total allocated */}
              <div className={`flex items-center gap-2 text-sm font-semibold mb-4 ${totalAllocated >= needed ? 'text-green-600' : 'text-gray-600'}`}>
                {totalAllocated >= needed ? <Check className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0" />}
                Total Allocated {totalAllocated} / {needed} units
              </div>

              {/* Allocation Plan */}
              {Object.keys(allocations).some(k => allocations[k] > 0) && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">2. Allocation Plan</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <div className="text-xs text-gray-500 font-medium mb-2">Donor Hospitals</div>
                        <div className="space-y-2">
                          {donorHospitals.filter(h => allocations[h.hospitalId] > 0).map(h => (
                            <div key={h.hospitalId} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{h.hospitalCode?.charAt(0)}</div>
                              <span className="text-xs font-medium">{h.hospitalCode}</span>
                              <span className="text-xs text-gray-500">{allocations[h.hospitalId]} units</span>
                              <span className="text-gray-300">· · · · · · ·</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Estimated Delivery</div>
                        <div className="text-sm font-bold text-gray-800">18 - 22 mins</div>
                        <div className="text-xs text-primary font-medium mt-1">🚁 Priority Transport</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Receiving Hospital</div>
                        <div className="text-sm font-bold text-primary">{selected.requestingHospital?.code}</div>
                        <div className="text-xs text-gray-500">{needed} units</div>
                        <div className="text-xs text-gray-400 mt-1">Needed by {new Date(selected.neededBy).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button className="btn-outline flex-1 text-sm">Save as Draft</button>
                <button onClick={handleRecommend} className="flex-1 flex items-center justify-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">
                  ⭐ Recommend Allocation
                </button>
                <button
                  onClick={handleApprove}
                  disabled={totalAllocated === 0}
                  className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  🚀 Approve &amp; Allocate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

