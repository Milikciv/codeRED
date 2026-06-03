import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import LoadingScreen from '../../components/common/LoadingScreen'
import { PieChart, Pie, Cell } from 'recharts'
import api from '../../api/axios'
import {
  CalendarDays, Clock, Droplets, MapPin, ExternalLink,
  Users, Send, ChevronDown, CheckSquare, Square,
  RefreshCw, Sparkles, X, Check, MessageSquare, BarChart2,
  Bookmark, Target, Star, Info,
} from 'lucide-react'

const STATUS_BADGE = {
  Planned:   'bg-green-50 text-green-700 border border-green-200',
  Confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  Completed: 'bg-gray-100 text-gray-500 border border-gray-200',
}

const MESSAGE_VARIANTS = [
  {
    id: 'A',
    name: 'Urgent Appeal',
    preview: 'Help us meet the urgent need for O- blood this weekend.',
    responseRate: 21,
    rateColor: 'text-green-600',
    recommended: false,
    full: `Urgent O- donors needed near Tampines Community Plaza this Saturday.\n\nHelp us meet the urgent need for O- blood this weekend.\n\nBook your slot today.\n\nTap to register: bit.ly/sav3lives`,
  },
  {
    id: 'B',
    name: 'Community Impact',
    preview: 'Your donation can help patients in our community.',
    responseRate: 17,
    rateColor: 'text-amber-500',
    recommended: false,
    full: `O- donors needed near Tampines Community Plaza this Saturday.\n\nYour donation can help patients in our community.\n\nBook your slot today.\n\nTap to register: bit.ly/sav3lives`,
  },
  {
    id: 'C',
    name: 'Life-Saving Focus',
    preview: 'One donation can save up to 3 lives. Be a lifesaver today.',
    responseRate: 24,
    rateColor: 'text-green-600',
    recommended: true,
    full: `Urgent O- donors needed near Tampines Community Plaza this Saturday.\n\nYour donation can help prevent an upcoming shortage.\n\nBook your slot today.\n\nTap to register: bit.ly/sav3lives`,
  },
]

function ProgressDonut({ pct }) {
  const data = [{ value: pct }, { value: 100 - pct }]
  return (
    <div className="relative w-20 h-20">
      <PieChart width={80} height={80}>
        <Pie data={data} dataKey="value" cx={38} cy={38} innerRadius={26} outerRadius={38} startAngle={90} endAngle={-270} strokeWidth={0}>
          <Cell fill="#EF4444" />
          <Cell fill="#F3F4F6" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold text-gray-900">{pct}%</span>
      </div>
    </div>
  )
}

function SelectDropdown({ label, value, options, icon }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value)
  return (
    <div className="relative">
      {label && <div className="text-[10px] text-gray-400 font-medium mb-1.5">{label}</div>}
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white hover:bg-gray-50">
        {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
        <span className="flex-1 text-left">{selected}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-full">
          {options.map(opt => (
            <button key={opt} onClick={() => { setSelected(opt); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CheckFilter({ label, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <button onClick={() => setChecked(!checked)} className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
      {checked ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" /> : <Square className="w-4 h-4 text-gray-300 flex-shrink-0" />}
      {label}
    </button>
  )
}

function PhoneMockup({ message }) {
  return (
    <div className="bg-gray-900 rounded-[28px] flex-shrink-0" style={{ width: 138, padding: '20px 6px 14px' }}>
      <div className="bg-gray-50 rounded-[20px] overflow-hidden">
        <div className="bg-white px-2 py-2 flex items-center gap-1.5 border-b border-gray-100">
          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[7px] font-bold">+</span>
          </div>
          <span className="text-[8px] font-semibold text-gray-800 leading-tight">Singapore Red Cross</span>
        </div>
        <div className="p-2">
          <div className="bg-gray-200 rounded-xl rounded-tl-sm p-2">
            {message.split('\n').map((line, i) => (
              <p key={i} className="text-[7.5px] text-gray-800 leading-relaxed">{line || ' '}</p>
            ))}
          </div>
          <p className="text-[7px] text-gray-400 mt-1">Today, 10:00 AM</p>
        </div>
      </div>
    </div>
  )
}

function AIModal({ drive, onCancel, onUse }) {
  const criteria = [
    { label: `${drive.bloodType} Donors`,       sub: 'High need blood type for this alert' },
    { label: 'Within 5 km',                      sub: 'Higher response from nearby donors' },
    { label: 'Last donation > 12 weeks',         sub: 'Eligible and more likely to donate' },
    { label: 'Previously attended drives',        sub: '2.1x more likely to respond' },
  ]
  const whyRows = [
    { icon: <Users className="w-4 h-4 text-gray-400" />,        label: 'Response rate',     value: '21%',   valueColor: 'text-gray-900', sub: '+8% vs. other audiences' },
    { icon: <CalendarDays className="w-4 h-4 text-gray-400" />, label: 'Historical turnout', value: `${drive.expectedResponders ?? 18} donors`, valueColor: 'text-primary', sub: 'Avg. per similar drive' },
    { icon: <MapPin className="w-4 h-4 text-gray-400" />,       label: 'Location match',    value: '5 km',  valueColor: 'text-primary', sub: `High concentration of ${drive.bloodType} donors` },
    { icon: <Clock className="w-4 h-4 text-gray-400" />,        label: 'Availability',      value: '72%',   valueColor: 'text-gray-900', sub: 'Available this weekend' },
  ]
  const breakdown = [
    { label: 'Champions', count: 12, pct: 14, color: '#EF4444' },
    { label: 'Regular',   count: 38, pct: 44, color: '#3B82F6' },
    { label: 'Dormant',   count: 36, pct: 42, color: '#F59E0B' },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[620px] mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-gray-900 text-lg">AI Recommendation</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-0.5"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-gray-500 px-6 pb-4">
          Our AI analysed historical data, donor behaviour and location insights to recommend the audience most likely to respond.
        </p>
        <div className="flex gap-4 px-6 pb-4 overflow-y-auto">
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-700 mb-3">Recommended Audience</div>
              <div className="space-y-3">
                {criteria.map(c => (
                  <div key={c.label} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{c.label}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-[10px] text-gray-400 mb-1">Expected turnout</div>
                <div className="text-2xl font-bold text-gray-900">{drive.expectedResponders ?? 18}</div>
                <div className="text-xs text-gray-400">donors</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-[10px] text-gray-400 mb-1">Confidence</div>
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold text-green-600">{drive.outreachConfidence ?? 87}%</div>
                  <span className="mb-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded-full border border-green-100">High</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-56 flex flex-col gap-3 flex-shrink-0">
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-3">Why this audience?</div>
              <div className="space-y-3">
                {whyRows.map(r => (
                  <div key={r.label} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 mt-0.5">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-gray-500">{r.label}</span>
                        <span className={`text-xs font-bold ${r.valueColor}`}>{r.value}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-3">Audience Breakdown</div>
              <div className="flex items-center gap-3">
                <PieChart width={80} height={80}>
                  <Pie data={breakdown} dataKey="pct" cx={38} cy={38} innerRadius={22} outerRadius={38} startAngle={90} endAngle={-270} strokeWidth={2} stroke="#fff">
                    {breakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
                <div className="space-y-1.5">
                  {breakdown.map(d => (
                    <div key={d.label} className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.label} ({d.count})</span>
                      <span className="font-semibold text-gray-800 ml-auto pl-2">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-6 mb-4 flex items-start gap-2.5 bg-blue-50 rounded-xl px-4 py-3 text-[11px] text-blue-700">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
          This recommendation is expected to collect up to {drive.expectedUnits ?? 180} units and close {drive.progressPct ?? 43}% of the forecasted shortage.
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onUse} className="flex-1 py-2.5 text-sm font-semibold btn-primary rounded-xl">Use Recommendation</button>
        </div>
      </div>
    </div>
  )
}

function MessageVariantsModal({ selected, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[680px] p-6 mx-4">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-base">AI Message Variants</h3>
            <p className="text-xs text-gray-400 mt-0.5">Select message to send</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-0.5"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {MESSAGE_VARIANTS.map(v => {
            const isSelected = selected === v.id
            return (
              <button
                key={v.id}
                onClick={() => onSelect(v)}
                className={`text-left p-4 rounded-xl border-2 transition-colors hover:bg-red-50/30 ${
                  isSelected ? 'border-primary bg-red-50/40' : v.recommended ? 'border-primary/40' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400 font-medium">Variant {v.id}</span>
                  {v.recommended && (
                    <span className="flex items-center gap-0.5 text-[9px] font-semibold text-primary">
                      <Star className="w-2.5 h-2.5 fill-primary" /> Recommended
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-gray-900 mb-2">{v.name}</div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{v.preview}</p>
                <div className="text-[10px] text-gray-400 mb-0.5">Expected Response</div>
                <div className={`text-2xl font-bold ${v.rateColor}`}>{v.responseRate}%</div>
              </button>
            )
          })}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold btn-primary rounded-xl">Use Selected</button>
        </div>
      </div>
    </div>
  )
}

export default function DonorOutreach() {
  const [drives, setDrives]               = useState([])
  const [selectedDriveId, setSelectedDriveId] = useState(null)
  const [showDriveDropdown, setShowDriveDropdown] = useState(false)
  const [showAIModal, setShowAIModal]     = useState(false)
  const [showVariants, setShowVariants]   = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(MESSAGE_VARIANTS[2])
  const [aiApplied, setAiApplied]         = useState(false)
  const [sending, setSending]             = useState(false)
  const [sent, setSent]                   = useState(false)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    api.get('/drives').then(r => {
      const upcoming = r.data.filter(d => d.status !== 'Completed')
      setDrives(upcoming)
      if (upcoming.length > 0) setSelectedDriveId(upcoming[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const drive = drives.find(d => d.id === selectedDriveId) ?? drives[0]

  if (loading) return (
    <PageLayout title="Donor Outreach" subtitle="Reach the right donors for your upcoming drive.">
      <LoadingScreen variant="general" />
    </PageLayout>
  )

  const stats = drive ? {
    hsaShortage:        drive.hsaShortage        ?? 0,
    expectedCollection: drive.expectedCollection ?? 0,
    shortfall:          drive.shortfall          ?? 0,
    progressPct:        drive.progressPct        ?? 0,
    confidence:         drive.outreachConfidence ?? 0,
    lastUpdated:        drive.outreachLastUpdated ?? '',
  } : {}

  const outreach = drive ? {
    recipients:        drive.outreachRecipients  ?? 0,
    expectedResponders: drive.expectedResponders ?? 0,
    expectedUnits:     drive.expectedUnits       ?? 0,
    responseRate:      drive.outreachResponseRate ?? 0,
    confidence:        drive.outreachConfidence  ?? 0,
  } : {}

  const handleUseRecommendation = () => { setShowAIModal(false); setAiApplied(true) }
  const handleSend = () => { setSending(true); setTimeout(() => { setSending(false); setSent(true) }, 1500) }

  const changeDriveButton = (
    <div className="relative">
      <button
        onClick={() => setShowDriveDropdown(!showDriveDropdown)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-white shadow-sm"
      >
        Change Drive <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDriveDropdown ? 'rotate-180' : ''}`} />
      </button>
      {showDriveDropdown && (
        <div className="absolute right-0 mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
          {drives.map(d => (
            <button
              key={d.id}
              onClick={() => { setSelectedDriveId(d.id); setShowDriveDropdown(false); setAiApplied(false); setSent(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-gray-50 ${d.id === selectedDriveId ? 'bg-primary/5' : ''}`}
            >
              <Droplets className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-gray-800 truncate">{d.location}</div>
                <div className="text-gray-500">{d.bloodType} · {d.date}</div>
              </div>
              {d.id === selectedDriveId && <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <PageLayout
      title="Donor Outreach"
      subtitle="Reach the right donors for your upcoming drive."
      actions={changeDriveButton}
      footer={
        <div className="bg-white border-t border-gray-200 z-30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 px-4 sm:px-8 py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{outreach.recipients} recipients selected</div>
                <div className="text-xs text-gray-400">Review audience and message before sending outreach.</div>
              </div>
            </div>
            <div className="sm:ml-auto flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Bookmark className="w-4 h-4" /> Save as Draft
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || sent}
                  className="flex items-center gap-2 btn-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {sent ? 'Sent!' : sending ? 'Sending…' : `Send Alert to ${outreach.recipients} Donors`}
                </button>
              </div>
              <div className="text-[10px] text-gray-400">Donors will receive SMS immediately</div>
            </div>
          </div>
        </div>
      }
    >
      {/* Drive info + stats card */}
      <div className="card mb-4 flex flex-col lg:flex-row lg:divide-x divide-gray-100">
        <div className="p-5 lg:w-72 lg:flex-shrink-0 border-b lg:border-b-0 border-gray-100">
          <div className="text-xs font-semibold text-gray-500 mb-2">Selected drive</div>
          <div className="flex items-start gap-2 mb-2.5">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <h3 className="font-bold text-gray-900 text-base leading-tight">{drive.location}</h3>
          </div>
          <div className="space-y-1.5 text-xs text-gray-500 mb-3.5">
            <div className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" />{drive.date}</div>
            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{drive.time}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <div>
              <div className="text-[10px] text-gray-400 mb-1">Target Blood Type</div>
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-primary" />
                <span className="font-bold text-primary text-sm">{drive.bloodType}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-1">Linked Alert</div>
              <div className="flex items-center gap-1 text-primary text-sm font-semibold">
                {drive.linkedAlert}<ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 mb-1.5">Status</div>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_BADGE[drive.status] ?? STATUS_BADGE.Planned}`}>
              {drive.status}
            </span>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-400 mb-4">
            <RefreshCw className="w-3 h-3" /> Last updated: {stats.lastUpdated}
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-stretch divide-y sm:divide-y-0 sm:divide-x divide-gray-100 flex-1">
            {[
              { label: 'HSA Forecasted Shortage', value: stats.hsaShortage,         unit: 'units', color: 'text-primary'   },
              { label: 'Expected Collection',     value: stats.expectedCollection,   unit: 'units', color: 'text-green-600' },
              { label: 'Shortfall Remaining',     value: stats.shortfall,            unit: 'units', color: 'text-amber-500' },
            ].map(col => (
              <div key={col.label} className="flex-1 px-5 first:pl-0 flex flex-col">
                <div className="text-xs text-gray-400 h-8 leading-tight text-center">{col.label}</div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className={`text-4xl font-bold leading-none ${col.color}`}>{col.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{col.unit}</div>
                </div>
              </div>
            ))}
            <div className="flex-1 px-5 flex flex-col">
              <div className="text-xs text-gray-400 h-8 leading-tight text-center">Progress to Target</div>
              <div className="flex-1 flex items-center justify-center">
                <ProgressDonut pct={stats.progressPct} />
              </div>
            </div>
            <div className="flex-1 pl-5 flex flex-col">
              <div className="text-xs text-gray-400 h-8 leading-tight text-center">Confidence</div>
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-4xl font-bold text-green-600 leading-none">{stats.confidence}%</div>
                <span className="inline-block mt-2 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full border border-green-100">High</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-50">
            Forecast based on selected audience, drive plan and historical response rates.
          </div>
        </div>
      </div>

      {/* Main 3-col section */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-4 mb-24">

        {/* Audience */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-gray-800">Audience</h3>
          </div>
          <div className="space-y-3">
            <SelectDropdown label="Blood Type" value={drive.bloodType} options={['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']} icon={<Droplets className="w-3.5 h-3.5" />} />
            <SelectDropdown label="Radius" value="5 km" options={['2 km', '5 km', '10 km', '15 km', '20 km']} icon={<MapPin className="w-3.5 h-3.5" />} />
            <SelectDropdown label="Last Donated" value="> 12 weeks" options={['> 8 weeks', '> 12 weeks', '> 16 weeks', 'Any']} icon={<CalendarDays className="w-3.5 h-3.5" />} />
            <div className="pt-1 space-y-3">
              <CheckFilter label="Previous Responders" defaultChecked={true} />
              <CheckFilter label="Weekend Availability" defaultChecked={true} />
            </div>
          </div>
          <button className="mt-5 w-full py-2 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors">
            Edit Audience
          </button>
        </div>

        {/* AI recommendation zone */}
        <div className="card p-4 flex flex-col items-center justify-center">
          {aiApplied ? (
            <div className="text-center w-full max-w-xs">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">AI Recommendation Applied</h3>
              <p className="text-xs text-gray-400 mb-4">Audience has been updated based on AI suggestions.</p>
              <div className="bg-gray-50 rounded-xl p-3 text-left space-y-2 mb-4">
                {[`${drive.bloodType} Donors`, 'Within 5 km', 'Last donation > 12 weeks', 'Previously attended community drives'].map(r => (
                  <div key={r} className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                    {r}
                  </div>
                ))}
              </div>
              <button onClick={() => setAiApplied(false)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Reset to manual filters
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-7 h-7 text-gray-300" />
                  </div>
                  <div className="absolute -right-2 -bottom-1 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">Select or use AI recommendation</h3>
              <p className="text-xs text-gray-400 mb-6 max-w-48 mx-auto">
                Refine your audience or get AI recommendations to reach the right donors.
              </p>
              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors mx-auto"
              >
                <Sparkles className="w-4 h-4" /> Get AI Recommendation
              </button>
            </div>
          )}
        </div>

        {/* Message Preview + Outreach Summary */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-gray-800">Message Preview</h3>
            </div>
            <div className="flex gap-3 items-start">
              <PhoneMockup message={selectedVariant.full} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-gray-400 font-medium mb-1">Selected Message</div>
                <div className="flex items-start gap-1.5 flex-wrap mb-2">
                  <span className="text-sm font-bold text-gray-900">{selectedVariant.name}</span>
                  {selectedVariant.recommended && (
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded-full border border-green-100">Best performing</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed mb-3">{selectedVariant.preview}</p>
                <div className="text-[10px] text-gray-400 mb-0.5">Expected Response Rate</div>
                <div className={`text-xl font-bold ${selectedVariant.rateColor}`}>{selectedVariant.responseRate}%</div>
                <button
                  onClick={() => setShowVariants(true)}
                  className="mt-3 w-full py-1.5 border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Other Variants
                </button>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-gray-800">Outreach Summary</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: <Users className="w-3.5 h-3.5" />,       label: 'Recipients Selected',  value: `${outreach.recipients} donors` },
                { icon: <MapPin className="w-3.5 h-3.5" />,      label: 'Expected Responders',  value: `${outreach.expectedResponders} donors` },
                { icon: <Droplets className="w-3.5 h-3.5" />,    label: 'Expected Units',       value: `${outreach.expectedUnits} units` },
                { icon: <Target className="w-3.5 h-3.5" />,      label: 'Response Rate (Est.)', value: `${outreach.responseRate}%` },
                { icon: <CheckSquare className="w-3.5 h-3.5" />, label: 'Confidence',           value: `${outreach.confidence}%`, badge: 'High' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 flex-shrink-0">{row.icon}</span>
                  <span className="text-gray-500 flex-1">{row.label}</span>
                  <span className="font-semibold text-gray-900">{row.value}</span>
                  {row.badge && (
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded-full border border-green-100">{row.badge}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAIModal && <AIModal drive={drive} onCancel={() => setShowAIModal(false)} onUse={handleUseRecommendation} />}
      {showVariants && (
        <MessageVariantsModal
          selected={selectedVariant.id}
          onSelect={(v) => setSelectedVariant(v)}
          onClose={() => setShowVariants(false)}
        />
      )}
    </PageLayout>
  )
}
