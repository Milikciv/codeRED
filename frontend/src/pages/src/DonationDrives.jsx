import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageLayout from '../../components/layout/PageLayout'
import LoadingScreen from '../../components/common/LoadingScreen'
import api from '../../api/axios'
import { ease } from '../../lib/motion'
import {
  CalendarDays, Clock, Droplets, MapPin, ExternalLink,
  MoreVertical, Plus, History, BarChart2,
  X, CheckCircle2, XCircle, Megaphone, FileText,
  Pencil, ChevronLeft, Save, Trash2, Users
} from 'lucide-react'
import Pagination, { usePagination } from '../../components/common/Pagination'

const UPCOMING_PAGE_SIZE = 5
const HISTORY_PAGE_SIZE  = 10

const STATUS_BADGE = {
  Planned:   'bg-blue-50 text-blue-700 border border-blue-200',
  Confirmed: 'bg-green-50 text-green-700 border border-green-200',
  Completed: 'bg-gray-100 text-gray-600 border border-gray-200',
}

const BLOOD_COLOR = {
  'O-':  '#EF4444', 'O+':  '#F97316', 'A+':  '#3B82F6',
  'A-':  '#8B5CF6', 'B+':  '#22C55E', 'B-':  '#EC4899',
  'AB+': '#14B8A6', 'AB-': '#6366F1',
}

function DriveImage({ location }) {
  const colors = ['#FEE2E2', '#FED7AA', '#D1FAE5', '#DBEAFE']
  const bg = colors[location.length % colors.length]
  return (
    <div className="w-28 h-20 rounded-lg flex-shrink-0 flex items-center justify-center text-center" style={{ background: bg }}>
      <MapPin className="w-6 h-6 text-gray-400" />
    </div>
  )
}

function BloodTypePip({ type }) {
  const color = BLOOD_COLOR[type] || '#EF4444'
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color }}>
      <Droplets className="w-3 h-3" /> {type}
    </span>
  )
}

function ConversionCell({ rate }) {
  const color = rate >= 45 ? 'text-green-600' : rate >= 40 ? 'text-orange-500' : 'text-red-500'
  return <span className={`font-semibold ${color}`}>{rate}%</span>
}

function CheckItem({ done, label, sub }) {
  return (
    <div className="flex items-start gap-2.5">
      {done
        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
        : <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />}
      <div>
        <div className={`text-xs font-medium ${done ? 'text-gray-800' : 'text-gray-400'}`}>{label}</div>
        {sub && <div className="text-[11px] text-gray-400">{sub}</div>}
      </div>
    </div>
  )
}

const BLOOD_TYPES = ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const STATUSES    = ['Planned', 'Confirmed']
const inputCls    = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

function DriveDetailDrawer({ drive, onClose, navigate, initialEditing = false }) {
  const [isEditing, setIsEditing] = useState(initialEditing)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [form, setForm] = useState({
    location:      drive.location,
    address:       drive.address,
    bloodType:     drive.bloodType,
    date:          drive.date,
    time:          drive.time,
    expectedMin:   drive.expectedDonorsMin,
    expectedMax:   drive.expectedDonorsMax,
    status:        drive.status,
    staffAssigned: drive.staffAssigned,
    notes:         drive.notes ?? '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const pct        = Math.round((drive.confirmedDonors / drive.expectedDonorsMin) * 100)
  const clampedPct = Math.min(pct, 100)
  const barColor   = clampedPct >= 100 ? '#22C55E' : clampedPct >= 60 ? '#F97316' : '#EF4444'

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
      >

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          {isEditing ? (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-gray-900 text-base">Edit Drive</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="min-w-0 pr-3">
                <h2 className="font-semibold text-gray-900 text-base leading-tight">{drive.location}</h2>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{drive.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[drive.status]}`}>
                  {drive.status}
                </span>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {isEditing ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Venue Name</label>
                <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Address</label>
                <input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
                  <input className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} placeholder="e.g. 31 May 2026" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Time</label>
                  <input className={inputCls} value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 10:00 AM – 4:00 PM" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Blood Type</label>
                  <select className={inputCls} value={form.bloodType} onChange={e => set('bloodType', e.target.value)}>
                    {BLOOD_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                  <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Expected Donors</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} className={inputCls} value={form.expectedMin} onChange={e => set('expectedMin', Number(e.target.value))} placeholder="Min" />
                  <span className="text-gray-400 text-sm flex-shrink-0">–</span>
                  <input type="number" min={0} className={inputCls} value={form.expectedMax} onChange={e => set('expectedMax', Number(e.target.value))} placeholder="Max" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Staff Assigned</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input type="number" min={0} className={`${inputCls} pl-8`} value={form.staffAssigned} onChange={e => set('staffAssigned', Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
                <textarea rows={3} className={`${inputCls} resize-none`} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Add any relevant notes…" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 space-y-2">
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-50">
                  Discard
                </button>
                <button onClick={() => setIsEditing(false)} className="flex-1 flex items-center justify-center gap-1.5 btn-primary py-2 text-sm">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-red-500 border border-red-200 rounded-xl py-2 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Drive
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] text-gray-400 font-medium mb-1">Blood Type</div>
                  <BloodTypePip type={drive.bloodType} />
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] text-gray-400 font-medium mb-1">Date</div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
                    <CalendarDays className="w-3 h-3 text-gray-400" /> {drive.date}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] text-gray-400 font-medium mb-1">Time</div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
                    <Clock className="w-3 h-3 text-gray-400" /> {drive.time}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 mb-1.5">Linked Alert</div>
                <button
                  onClick={() => { navigate(`/src/drive-planning?alertId=${drive.linkedAlert}`); onClose() }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <Droplets className="w-4 h-4" /> {drive.linkedAlert}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-gray-500">Donor Registrations</div>
                  <div className="text-xs font-semibold text-gray-700">
                    {drive.confirmedDonors} <span className="text-gray-400 font-normal">/ {drive.expectedDonors} expected</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${clampedPct}%`, background: barColor }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="text-[11px] text-gray-400">
                    {clampedPct >= 100 ? 'Target reached!' : `${clampedPct}% of minimum target`}
                  </div>
                  <div className="text-[11px]" style={{ color: barColor }}>{drive.confirmedDonors} confirmed</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 mb-2.5">Preparation Status</div>
                <div className="space-y-2.5">
                  <CheckItem done={drive.venueConfirmed} label="Venue Confirmed" sub={drive.venueConfirmed ? drive.address : 'Pending confirmation'} />
                  <CheckItem done={drive.outreachSent} label="Outreach Sent" sub={drive.outreachSent ? `${(drive.outreachCount ?? 0).toLocaleString()} donors contacted` : 'Not yet sent'} />
                  <CheckItem done={drive.staffAssigned >= 2} label="Staff Assigned" sub={drive.staffAssigned > 0 ? `${drive.staffAssigned} staff member${drive.staffAssigned > 1 ? 's' : ''} assigned` : 'No staff assigned yet'} />
                </div>
              </div>

              {drive.notes && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                    <FileText className="w-3.5 h-3.5" /> Notes
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{drive.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => { navigate('/src/donor-outreach'); onClose() }} className="flex-1 flex items-center justify-center gap-1.5 btn-primary py-2 text-sm">
                <Megaphone className="w-4 h-4" /> Send Outreach
              </button>
              <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 rounded-xl px-4 py-2 text-sm hover:bg-gray-50">
                <Pencil className="w-3.5 h-3.5" /> Edit Drive
              </button>
            </div>
          </>
        )}
      </motion.div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 modal-backdrop-enter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 modal-content-enter">
            <h3 className="font-semibold text-gray-900 text-base mb-1">Delete this drive?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently remove <span className="font-medium text-gray-700">{form.location}</span>. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={onClose} className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-red-600">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const UPCOMING_FILTERS = ['All', 'Planned', 'Confirmed']

export default function DonationDrives() {
  const navigate = useNavigate()
  const [drives, setDrives]               = useState([])
  const [tab, setTab]                     = useState('upcoming')
  const [filter, setFilter]               = useState('All')
  const [driveMenu, setDriveMenu]         = useState(null)
  const [upcomingPage, setUpcomingPage]   = useState(1)
  const [historyPage, setHistoryPage]     = useState(1)
  const [selectedDrive, setSelectedDrive] = useState(null)
  const [openInEdit, setOpenInEdit]       = useState(false)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    api.get('/drives').then(r => setDrives(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <PageLayout title="Donation Drives" subtitle="Manage all blood donation drives.">
      <LoadingScreen variant="general" />
    </PageLayout>
  )

  const upcomingDrives = drives.filter(d => d.status !== 'Completed')
  const historyDrives  = drives.filter(d => d.status === 'Completed')

  function openDriveDrawer(drive, editing = false) {
    setSelectedDrive(drive)
    setOpenInEdit(editing)
  }
  function closeDriveDrawer() {
    setSelectedDrive(null)
    setOpenInEdit(false)
  }

  const filtered      = filter === 'All' ? upcomingDrives : upcomingDrives.filter(d => d.status === filter)
  const upcomingPag   = usePagination(filtered, UPCOMING_PAGE_SIZE)
  const historyPag    = usePagination(historyDrives, HISTORY_PAGE_SIZE)
  const upcomingItems = upcomingPag.slice(upcomingPage)
  const historyItems  = historyPag.slice(historyPage)

  return (
    <>
    <PageLayout
      title="Donation Drives"
      subtitle="Manage all blood donation drives."
    >
      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-4 items-center">
        {[
          { key: 'upcoming', label: 'Upcoming Drives', icon: CalendarDays },
          { key: 'history',  label: 'Drive History',   icon: History      },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setFilter('All') }}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
        <button onClick={() => navigate('/src/drive-planning')} className="ml-auto self-center flex items-center gap-1.5 btn-primary px-3 py-1.5 text-sm">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create New Drive</span>
        </button>
      </div>

      {tab === 'upcoming' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              {UPCOMING_FILTERS.map(f => {
                const count = f === 'All' ? upcomingDrives.length : upcomingDrives.filter(d => d.status === f).length
                return (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setUpcomingPage(1) }}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}{count > 0 && ` ${count}`}
                  </button>
                )
              })}
            </div>
            <span className="text-xs text-gray-400">{filtered.length} drive{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${upcomingPage}`}
            className="space-y-3"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {upcomingItems.map((drive) => (
              <motion.div
                key={drive.id}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease } } }}
                className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openDriveDrawer(drive)}
              >
                <div className="hidden sm:block flex-shrink-0">
                  <DriveImage location={drive.location} />
                </div>

                <div className="min-w-0 sm:w-44 flex-1 sm:flex-none">
                  <div className="flex items-start justify-between gap-2 sm:block">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-gray-900 truncate">{drive.location}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{drive.address}</span>
                      </div>
                    </div>
                    {/* Status badge + three-dot menu, mobile only */}
                    <div className="sm:hidden flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[drive.status]}`}>
                        {drive.status}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDriveMenu(driveMenu === drive.id ? null : drive.id) }}
                          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {driveMenu === drive.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                            {['Edit Drive', 'Send Outreach', 'Cancel Drive'].map(opt => (
                              <button
                                key={opt}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (opt === 'Edit Drive') openDriveDrawer(drive, true)
                                  if (opt === 'Send Outreach') navigate('/src/donor-outreach')
                                  setDriveMenu(null)
                                }}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${opt === 'Cancel Drive' ? 'text-red-600' : 'text-gray-700'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block h-10 w-px bg-gray-100 flex-shrink-0" />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 min-w-0">
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-400 font-medium mb-1 whitespace-nowrap">Blood Type</div>
                    <BloodTypePip type={drive.bloodType} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-400 font-medium mb-1 whitespace-nowrap">Exp. Donors</div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
                      <span className="text-gray-500">👥</span> {drive.expectedDonors}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-400 font-medium mb-1 whitespace-nowrap">Linked Alert</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/src/drive-planning?alertId=${drive.linkedAlert}`) }}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Droplets className="w-3 h-3" /> {drive.linkedAlert}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-400 font-medium mb-1 whitespace-nowrap">Date</div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-800 whitespace-nowrap">
                      <CalendarDays className="w-3 h-3 text-gray-400 flex-shrink-0" /> {drive.date}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block h-10 w-px bg-gray-100 flex-shrink-0" />

                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium mb-1">Status</div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[drive.status]}`}>
                      {drive.status}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDriveMenu(driveMenu === drive.id ? null : drive.id) }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {driveMenu === drive.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                        {['Edit Drive', 'Send Outreach', 'Cancel Drive'].map(opt => (
                          <button
                            key={opt}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (opt === 'Edit Drive') openDriveDrawer(drive, true)
                              if (opt === 'Send Outreach') navigate('/src/donor-outreach')
                              setDriveMenu(null)
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${opt === 'Cancel Drive' ? 'text-red-600' : 'text-gray-700'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          </AnimatePresence>

          <Pagination
            page={upcomingPage}
            totalPages={upcomingPag.totalPages}
            totalItems={upcomingPag.totalItems}
            pageSize={UPCOMING_PAGE_SIZE}
            onPageChange={setUpcomingPage}
          />
        </div>
      )}

      {tab === 'history' && (
        <div>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {historyItems.map((d, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-800 truncate">{d.location}</div>
                    <div className="text-xs text-gray-400 truncate">{d.address}</div>
                  </div>
                  <BloodTypePip type={d.bloodType} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium mb-0.5">Date</div>
                    <div className="font-medium text-gray-700">{d.date}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium mb-0.5">Conversion</div>
                    <ConversionCell rate={d.conversionRate} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium mb-0.5">Turnout</div>
                    <div className="text-primary font-semibold">{d.actualTurnout} donors</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium mb-0.5">Units Collected</div>
                    <div className="text-primary font-semibold">{d.unitsCollected} units</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/src/drive-planning?alertId=${d.linkedAlert}`)}
                    className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                  >
                    <Droplets className="w-3 h-3" /> {d.linkedAlert}
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block card overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Location', 'Date', 'Target Blood Type', 'Actual Turnout', 'Units Collected', 'Conversion Rate', 'Linked Alert', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historyItems.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{d.location}</div>
                      <div className="text-gray-400">{d.address}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{d.date}</td>
                    <td className="px-4 py-3"><BloodTypePip type={d.bloodType} /></td>
                    <td className="px-4 py-3 text-primary font-semibold">{d.actualTurnout} donors</td>
                    <td className="px-4 py-3 text-primary font-semibold">{d.unitsCollected} units</td>
                    <td className="px-4 py-3"><ConversionCell rate={d.conversionRate} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/src/drive-planning?alertId=${d.linkedAlert}`)} className="text-primary font-medium hover:underline">
                        {d.linkedAlert}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
                        <BarChart2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={historyPage}
            totalPages={historyPag.totalPages}
            totalItems={historyPag.totalItems}
            pageSize={HISTORY_PAGE_SIZE}
            onPageChange={setHistoryPage}
          />
        </div>
      )}

    </PageLayout>

    {createPortal(
      <AnimatePresence>
        {selectedDrive && (
          <DriveDetailDrawer
            drive={selectedDrive}
            onClose={closeDriveDrawer}
            navigate={navigate}
            initialEditing={openInEdit}
          />
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  )
}
