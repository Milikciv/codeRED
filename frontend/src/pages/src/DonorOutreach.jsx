import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import LoadingScreen, { SectionLoader } from '../../components/common/LoadingScreen'
import EmptyState from '../../components/common/EmptyState'
import api from '../../api/axios'
import {
  CalendarDays, Clock, Droplets, MapPin, ExternalLink,
  Users, Send, ChevronDown, Check, Sparkles, X,
  MessageSquare, Building2, GraduationCap, Heart, Zap, Search, Eye,
  ChevronRight, Star, Download, RefreshCw,
} from 'lucide-react'

// ─── Static data ──────────────────────────────────────────────────────────────

const CAMPAIGN_THEMES = [
  {
    id: 'youth-challenge',
    name: 'Youth Challenge',
    description: 'Gamified donation challenge targeting first-time young donors via social media.',
    registrations: 31,
    responseRate: 36,
  },
  {
    id: 'campus-challenge',
    name: 'Campus Challenge',
    description: 'University and polytechnic campus competition between student groups.',
    registrations: 28,
    responseRate: 32,
  },
  {
    id: 'save-lives-together',
    name: 'Save Lives Together',
    description: 'Peer-to-peer social sharing campaign to recruit donors from friend groups.',
    registrations: 24,
    responseRate: 27,
  },
  {
    id: 'community-challenge',
    name: 'Community Challenge',
    description: 'Neighbourhood-level challenge engaging residents via community apps.',
    registrations: 20,
    responseRate: 22,
  },
]

const STRATEGY_COMPARISON = [
  { id: 'push',     label: 'Push Notifications', donors: 18, color: 'text-gray-700',  bg: 'bg-gray-50',   border: 'border-gray-200' },
  { id: 'youth',    label: 'Youth Campaigns',    donors: 31, color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200', recommended: true },
  { id: 'collab',   label: 'Collaborations',     donors: 42, color: 'text-blue-700',  bg: 'bg-blue-50',   border: 'border-blue-200' },
  { id: 'combined', label: 'Combined Approach',  donors: 68, color: 'text-green-700', bg: 'bg-green-50',  border: 'border-green-200', best: true },
]


const OUTREACH_TONES = [
  {
    id: 'formal',
    name: 'Formal',
    badge: 'Professional',
    badgeColor: 'bg-blue-100 text-blue-700',
    getBody: (partner, ctx) =>
      `Dear ${partner.name} ${ctx.team},\n\nSingapore Red Cross is organising a blood donation drive at Tampines Community Plaza this Saturday and would like to invite your organisation to participate.\n\nWith ${partner.reach} within ${partner.distance}, your ${ctx.noun} can make a meaningful contribution through our ${ctx.type}.\n\nWe would be grateful for your partnership in this life-saving initiative.\n\nWarm regards,\nSingapore Red Cross`,
    getSubject: (partner) => `Blood Drive Partnership Invitation - ${partner.name}`,
  },
  {
    id: 'community',
    name: 'Community',
    badge: 'Warm and engaging',
    badgeColor: 'bg-green-100 text-green-700',
    getBody: (partner, ctx) =>
      `Hi ${partner.name} team,\n\nWe're excited to reach out! Singapore Red Cross is hosting a blood drive at Tampines Community Plaza this Saturday and we'd love to have your community involved.\n\nWith ${partner.reach} within ${partner.distance}, together we can make a real difference through our ${ctx.type}!\n\nLooking forward to hearing from you.\n\nThe SRC Team`,
    getSubject: (_partner) => `Join Us - Blood Drive at Tampines This Saturday`,
  },
  {
    id: 'urgent',
    name: 'Urgent',
    badge: 'High response',
    badgeColor: 'bg-orange-100 text-orange-700',
    getBody: (partner, ctx) =>
      `Dear ${partner.name} ${ctx.team},\n\nUrgent: Singapore Red Cross needs your help. We are facing a critical O- blood shortage and have organised an emergency drive at Tampines Community Plaza this Saturday.\n\nWith ${partner.reach} nearby, your ${ctx.noun} can help avert a shortage that puts lives at risk. Please partner with us for this ${ctx.type}.\n\nTime is critical. Please respond by Thursday.\n\nSingapore Red Cross`,
    getSubject: (partner) => `Urgent: Blood Drive Partnership Needed - ${partner.name}`,
  },
]

const TABS = [
  { id: 'ai',     label: 'AI Recommended',     icon: <Sparkles className="w-4 h-4" /> },
  { id: 'push',   label: 'Push Notifications', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'youth',  label: 'Youth Campaigns',    icon: <Zap className="w-4 h-4" /> },
  { id: 'collab', label: 'Collaborations',     icon: <Building2 className="w-4 h-4" /> },
]

const AI_STEPS = [
  'Analysing campaign theme...',
  'Generating visual elements...',
  'Applying brand guidelines...',
  'Finalising campaign assets...',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseBloodTypes(bloodType) {
  if (!bloodType) return []
  if (Array.isArray(bloodType)) return bloodType
  return bloodType.split(',').map(s => s.trim()).filter(Boolean)
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SelectDropdown({ label, value, options, icon, onChange }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value)
  const labelId = label ? `label-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined

  useEffect(() => { setSelected(value) }, [value])

  return (
    <div className="relative">
      {label && (
        <div id={labelId} className="text-xs text-gray-500 font-medium mb-1">{label}</div>
      )}
      <button
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
        <span className="flex-1 text-left">{selected}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="listbox" className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-full">
          {options.map(opt => (
            <button
              key={opt}
              role="option"
              aria-selected={opt === selected}
              onClick={() => { setSelected(opt); setOpen(false); onChange?.(opt) }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors duration-100 focus-visible:outline-none focus-visible:bg-gray-50"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MultiSelectDropdown({ label, values, options, icon, onChange }) {
  const [open, setOpen] = useState(false)
  const labelId = label ? `label-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined

  const toggle = (opt) => {
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt])
  }

  const displayText = values.length === 0 ? 'None'
    : values.length === 1 ? values[0]
    : `${values.length} types selected`

  return (
    <div className="relative">
      {label && (
        <div id={labelId} className="text-xs text-gray-500 font-medium mb-1">{label}</div>
      )}
      <button
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
        <span className="flex-1 text-left truncate">{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="listbox" className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-full">
          {options.map(opt => {
            const checked = values.includes(opt)
            return (
              <button
                key={opt}
                role="option"
                aria-selected={checked}
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors duration-100 focus-visible:outline-none focus-visible:bg-gray-50"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  checked ? 'bg-primary border-primary' : 'border-2 border-gray-300 bg-white'
                }`}>
                  {checked && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                {opt}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}


// ─── Combined Plan Modal ──────────────────────────────────────────────────────

function CombinedPlanModal({ onClose }) {
  const [selected, setSelected] = useState({ push: true, youth: true, collab: false })
  const strategies = [
    { key: 'push',  label: 'Push Notifications',   donors: 18, icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'youth', label: 'Youth Campaign',        donors: 31, icon: <Zap className="w-4 h-4" /> },
    { key: 'collab', label: 'School Collaboration', donors: 42, icon: <GraduationCap className="w-4 h-4" /> },
  ]
  const allThree = selected.push && selected.youth && selected.collab
  const expectedDonors = allThree ? 68 : (selected.push ? 18 : 0) + (selected.youth ? 31 : 0) + (selected.collab ? 42 : 0)

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 modal-backdrop-enter">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] mx-4 modal-content-enter">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Combined Strategy Plan</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select strategies to combine for maximum reach</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-2.5">
          {strategies.map(s => {
            const on = selected[s.key]
            return (
              <button
                key={s.key}
                onClick={() => setSelected(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  on ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  on ? 'bg-primary border-primary' : 'border-gray-300'
                }`}>
                  {on && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-shrink-0 ${on ? 'text-primary' : 'text-gray-400'}`}>{s.icon}</span>
                <span className="flex-1 font-semibold text-sm text-gray-800">{s.label}</span>
                <span className="text-sm text-gray-500 font-medium">{s.donors} donors</span>
              </button>
            )
          })}

          <div className="mt-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 mb-3">Combined Results</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">{expectedDonors}</div>
                <div className="text-xs text-gray-400 mt-0.5">Expected Donors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">32%</div>
                <div className="text-xs text-gray-400 mt-0.5">Response Rate</div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm font-semibold text-green-700">AI Endorsed</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Recommended by AI</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold btn-primary rounded-xl">
            Launch Combined Plan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Donor Demographics Card ──────────────────────────────────────────────────

function DonorDemographicsCard({ demographics }) {
  if (!demographics) return null

  const byAge      = demographics.byAge      ?? []
  const byGender   = demographics.byGender   ?? []
  const byLocation = demographics.byLocation ?? []

  const maxAgePct = Math.max(...byAge.map(r => r.pct), 1)

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-900">Donor Demographics</h3>
          <p className="text-xs text-gray-400">Eligible donor pool filtered to this drive's blood type</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Matched Donors',  value: demographics.activeCount?.toLocaleString()   ?? '—', color: 'text-gray-900' },
          { label: 'Eligible Now',    value: demographics.totalEligible?.toLocaleString()  ?? '—', color: 'text-primary'  },
          { label: 'Avg Donations',   value: demographics.avgDonations != null ? demographics.avgDonations.toFixed(1) : '—', color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold leading-none ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Age + Gender bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-3">By Age Group</div>
          <div className="space-y-2">
            {byAge.map(row => (
              <div key={row.group} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-11 flex-shrink-0">{row.group}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(row.pct / maxAgePct) * 100}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 w-8 text-right tabular-nums">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-700 mb-3">By Gender</div>
          <div className="space-y-3">
            {byGender.map(row => (
              <div key={row.gender} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-11 flex-shrink-0">{row.gender}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 w-8 text-right tabular-nums">{row.pct}%</span>
              </div>
            ))}
          </div>

          {/* Top donor regions */}
          {byLocation.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">Top Regions</div>
              <div className="flex flex-col gap-1.5">
                {byLocation.slice(0, 5).map((loc, i) => (
                  <div key={loc.region} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 w-4">#{i + 1}</span>
                    <span className="text-xs font-semibold text-gray-700 flex-1">{loc.region}</span>
                    <span className="text-[10px] text-gray-400 tabular-nums">{loc.count?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab 1: AI Recommended ────────────────────────────────────────────────────

function TabAIRecommended({ drive, outreachStrategy, strategyLoading, onRefresh, onViewCombined }) {
  const strategy   = outreachStrategy?.strategy
  const confidence = strategy?.confidence ?? null

  const confLabel  = confidence == null ? '—' : confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low'
  const confColor  = confidence >= 80 ? 'text-green-600' : confidence >= 60 ? 'text-amber-600' : 'text-gray-500'
  const confBg     = confidence >= 80 ? 'bg-green-50 border-green-100' : confidence >= 60 ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'
  const confBadge  = confidence >= 80 ? 'bg-green-100 text-green-700' : confidence >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'

  const stats = [
    { label: 'Target Blood Type',     value: drive?.bloodType ?? '—',                                                  color: 'text-primary'    },
    { label: 'Eligible Donors',       value: outreachStrategy?.demographics?.totalEligible?.toLocaleString() ?? '—',   color: 'text-gray-900'   },
    { label: 'Recommended Audience',  value: strategy?.audience ?? '—',                                                color: 'text-amber-600'  },
    { label: 'Expected Response Rate', value: strategy?.expectedResponseRate != null ? `${strategy.expectedResponseRate}%` : '—', color: 'text-green-600' },
  ]

  const reasons = strategy?.reasons ?? []

  return (
    <div className="space-y-4">
      {/* AI strategy card */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">AI Recommended Strategy</h3>
              <p className="text-xs text-gray-400">Analysed from eligible donor demographics for this drive</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={strategyLoading}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary flex-shrink-0 disabled:opacity-40"
            title="Regenerate AI analysis"
          >
            <RefreshCw className={`w-3 h-3 ${strategyLoading ? 'animate-spin' : ''}`} />
            {strategyLoading ? 'Analysing…' : 'Regenerate'}
          </button>
        </div>

        {strategyLoading ? (
          <SectionLoader variant="donorOutreach" message="AI analysing donor demographics for this drive…" />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_108px] gap-4 mb-5">
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {stats.map(stat => (
                  <div key={stat.label} className="flex items-center justify-between px-4 py-2.5 bg-white">
                    <span className="text-xs text-gray-500">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className={`border rounded-xl p-3 text-center flex flex-col justify-center gap-1 ${confBg}`}>
                <div className="text-xs text-gray-400">Confidence</div>
                <div className={`text-3xl font-bold ${confColor}`}>{confidence != null ? `${confidence}%` : '—'}</div>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${confBadge}`}>{confLabel}</span>
              </div>
            </div>

            {strategy?.message && (
              <div className="mb-5 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
                <div className="text-xs font-semibold text-primary mb-1">AI Insight</div>
                <p className="text-xs text-gray-700 leading-relaxed">{strategy.message}</p>
              </div>
            )}

            {reasons.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-700 mb-3">Why this strategy?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reasons.map(r => (
                    <div key={r} className="flex items-start gap-2">
                      <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                        <Check className="w-2.5 h-2.5 text-green-700" />
                      </span>
                      <span className="text-xs text-gray-600">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Donor demographics */}
      <DonorDemographicsCard demographics={outreachStrategy?.demographics} />

      {/* Strategy comparison */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-gray-900">Strategy Comparison</h3>
          <button
            onClick={onViewCombined}
            className="flex items-center gap-1.5 btn-primary px-4 py-2 text-xs rounded-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            View Combined Plan
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
          {STRATEGY_COMPARISON.map(s => (
            <div
              key={s.id}
              className={`relative rounded-xl border-2 p-4 ${s.border} ${s.bg} ${
                s.best ? 'ring-2 ring-green-300/50' : ''
              }`}
            >
              {s.best && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-0.5 px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full whitespace-nowrap">
                    Best
                  </span>
                </div>
              )}
              {s.recommended && !s.best && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-400 text-white text-[9px] font-bold rounded-full whitespace-nowrap">
                    <Star className="w-2.5 h-2.5 fill-white" /> AI Pick
                  </span>
                </div>
              )}
              <div className="text-xs font-semibold text-gray-700 mb-1">{s.label}</div>
              <div className={`text-3xl font-bold leading-none ${s.color}`}>{s.donors}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">expected donors</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab 2: Push Notifications ────────────────────────────────────────────────

const MESSAGE_VARIANTS = [
  {
    id: 'life-saving',
    name: 'Life-Saving Focus',
    badge: 'Best performing',
    badgeColor: 'bg-green-100 text-green-700',
    body: `Urgent O- donors needed near Tampines Community Plaza this Saturday.\n\nYour donation can help prevent an upcoming shortage.\n\nBook your slot today.\n\nTap to register: bit.ly/sav3lives`,
    responseRate: 24,
  },
  {
    id: 'urgency',
    name: 'Urgency-Based',
    badge: 'High open rate',
    badgeColor: 'bg-amber-100 text-amber-700',
    body: `Critical O- shortage in your area. Donors needed urgently this Saturday.\n\nEvery donation counts. Register now: bit.ly/sav3lives`,
    responseRate: 21,
  },
  {
    id: 'community',
    name: 'Community Appeal',
    badge: 'High trust',
    badgeColor: 'bg-blue-100 text-blue-700',
    body: `Join your neighbours this Saturday and help save lives together.\n\nO- donors needed at Tampines Community Plaza.\n\nBook: bit.ly/sav3lives`,
    responseRate: 18,
  },
]

const ALL_BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

function TabPushNotifications({ drive, aiVariants = [], aiLoading = false, onRefresh }) {
  const driveBloodTypes = parseBloodTypes(drive?.bloodType)
  const isMultiBloodType = driveBloodTypes.length > 1

  const [selectedBloodTypes, setSelectedBloodTypes] = useState(driveBloodTypes)
  const [selectedBloodType, setSelectedBloodType]   = useState(driveBloodTypes[0] ?? 'O-')

  const variants = aiVariants.length > 0 ? aiVariants : MESSAGE_VARIANTS
  const [variantIdx, setVariantIdx] = useState(0)
  const [sent, setSent]     = useState(false)
  const [sending, setSending] = useState(false)
  const [prevRespondersOnly, setPrevRespondersOnly] = useState(true)
  const [donorsReached, setDonorsReached] = useState(null)
  const [editedBodies, setEditedBodies] = useState(() =>
    Object.fromEntries(variants.map(v => [v.id, v.body]))
  )

  useEffect(() => {
    const types = parseBloodTypes(drive?.bloodType)
    setSelectedBloodTypes(types)
    setSelectedBloodType(types[0] ?? 'O-')
  }, [drive?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setVariantIdx(0)
    setEditedBodies(Object.fromEntries(variants.map(v => [v.id, v.body])))
    setSent(false)
  }, [aiVariants.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const variant = variants[variantIdx] ?? variants[0]
  const body = editedBodies[variant?.id] ?? ''
  const isDirty = body !== variant?.body

  const handleBodyChange = (e) => {
    setEditedBodies(prev => ({ ...prev, [variant.id]: e.target.value }))
    setSent(false)
  }

  const handleReset = () => {
    setEditedBodies(prev => ({ ...prev, [variant.id]: variant.body }))
    setSent(false)
  }

  const handleSend = async () => {
    setSending(true)
    try {
      const { data } = await api.post('/donor-outreach/push-notification', {
        message: body,
        bloodType: isMultiBloodType ? selectedBloodTypes.join(',') : selectedBloodType,
        region: drive?.region ?? null,
        prevRespondersOnly: prevRespondersOnly,
      })
      console.log('Push notification sent:', data)
      setDonorsReached(data.donorsReached)
      setSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handlePickVariant = (idx) => {
    setVariantIdx(idx)
    setSent(false)
  }

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Eligible Donors',      value: 86,    color: 'text-gray-900' },
          { label: 'Estimated Responders', value: 18,    color: 'text-primary' },
          { label: 'Response Rate',        value: '21%', color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-gray-800">Audience Filters</h3>
          </div>
          <div className="space-y-3">
            {isMultiBloodType ? (
              <MultiSelectDropdown
                label="Blood Type"
                values={selectedBloodTypes}
                options={ALL_BLOOD_TYPES}
                icon={<Droplets className="w-3.5 h-3.5" />}
                onChange={setSelectedBloodTypes}
              />
            ) : (
              <SelectDropdown
                label="Blood Type"
                value={selectedBloodType}
                options={ALL_BLOOD_TYPES}
                icon={<Droplets className="w-3.5 h-3.5" />}
                onChange={setSelectedBloodType}
              />
            )}
            <SelectDropdown
              label="Radius"
              value="5 km"
              options={['2 km', '5 km', '10 km', '15 km', '20 km']}
              icon={<MapPin className="w-3.5 h-3.5" />}
            />
            <SelectDropdown
              label="Last Donation Date"
              value="> 12 weeks"
              options={['> 8 weeks', '> 12 weeks', '> 16 weeks', 'Any']}
              icon={<CalendarDays className="w-3.5 h-3.5" />}
            />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={prevRespondersOnly}
                onChange={e => setPrevRespondersOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1 ${
                prevRespondersOnly ? 'bg-primary' : 'border-2 border-gray-300 bg-white'
              }`}>
                {prevRespondersOnly && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-sm text-gray-700">Previous Responders Only</span>
            </label>
          </div>
        </div>

        {/* Message preview card */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-gray-800">Message Preview</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Phone mockup — hidden on mobile, not enough room */}
            <div className="hidden sm:block relative flex-shrink-0" style={{ width: 160 }}>
              <img
                src="/phone.png"
                alt=""
                className="w-full h-auto block relative"
                style={{ zIndex: 10, pointerEvents: 'none' }}
              />
              <div
                className="absolute overflow-hidden flex flex-col"
                style={{ top: '13%', left: '7%', right: '7%', bottom: '4%', zIndex: 20, pointerEvents: 'none' }}
              >
                <div className="flex items-center gap-1 px-1.5 pt-1.5 pb-1">
                  <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold" style={{ fontSize: '5px' }}>SRC</span>
                  </div>
                  <span className="text-gray-800 font-semibold" style={{ fontSize: '6px' }}>Singapore Red Cross</span>
                </div>
                <div className="mx-1.5 bg-gray-100 rounded-lg rounded-tl-sm px-2 py-1.5" style={{ maxWidth: '90%' }}>
                  <p className="text-gray-800 leading-relaxed" style={{ fontSize: '6.5px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {body}
                  </p>
                </div>
                <div className="mx-1.5 mt-0.5 text-gray-400" style={{ fontSize: '5.5px' }}>Today, 10:00 AM</div>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 min-w-0 flex flex-col gap-5 w-full sm:w-auto">

              {/* Variant selector + regenerate button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  {!aiLoading && variants.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => handlePickVariant(i)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                        i === variantIdx
                          ? 'bg-gray-900 text-white focus-visible:ring-gray-900'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 focus-visible:ring-gray-400'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary flex-shrink-0 disabled:opacity-40"
                    title="Regenerate AI messages"
                  >
                    <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
                    {aiLoading ? 'Regenerating…' : 'Regenerate'}
                  </button>
                )}
              </div>

              {aiLoading ? (
                <SectionLoader variant="donorOutreach" message="Gemini AI drafting messages…" />
              ) : (
                <>
                  {/* Name + response rate */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-bold text-gray-900 text-base leading-tight">{variant.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${variant.badgeColor}`}>
                        {variant.badge}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 flex-shrink-0">
                      <span className="text-2xl font-bold text-green-600">{variant.responseRate}%</span>
                      <span className="text-[10px] text-gray-400">response rate</span>
                    </div>
                  </div>

                  {/* Message editor */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="message-body" className="text-xs font-medium text-gray-600 cursor-pointer">
                        Message
                      </label>
                      {isDirty && (
                        <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:text-gray-600">
                          Reset
                        </button>
                      )}
                    </div>
                    <textarea
                      id="message-body"
                      value={body}
                      onChange={handleBodyChange}
                      rows={4}
                      className="w-full px-3 py-2.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg resize-none outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 transition-colors leading-relaxed"
                    />
                    <span className={`text-[10px] ${body.length > 160 ? 'text-amber-700 font-medium' : 'text-gray-400'}`}>
                      {body.length} / 160 chars{body.length > 160 ? ' · 2 segments' : ''}
                    </span>
                  </div>

                  {/* Send action */}
                  <div>
                    <button
                      onClick={handleSend}
                      disabled={sending || sent}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                        sent
                          ? 'bg-success text-white cursor-default focus-visible:ring-success'
                          : 'btn-primary disabled:opacity-60 focus-visible:ring-primary'
                      }`}
                    >
                      {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                      {sent ? `Sent to ${donorsReached ?? 86} donors` : sending ? 'Sending…' : 'Send Push Notification'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AI Campaign Generator ────────────────────────────────────────────────────

function AICampaignGenerator({ theme, drive }) {
  const [genState, setGenState] = useState('idle')
  const [stepIdx, setStepIdx] = useState(0)
  const [dots, setDots] = useState('')

  const driveName = drive?.location ?? 'Tampines Community Plaza'
  const driveShort = drive?.location?.split(' ')[0] ?? 'Tampines'
  const hashtag = '#' + theme.name.replace(/\s+/g, '')

  useEffect(() => {
    setGenState('idle')
  }, [theme.id])

  useEffect(() => {
    if (genState !== 'generating') return
    const dotsId = setInterval(() => {
      setDots(d => d.length >= 5 ? '' : d + '.')
    }, 300)
    return () => clearInterval(dotsId)
  }, [genState])

  useEffect(() => {
    if (genState !== 'generating') return
    setStepIdx(0)
    let s = 0
    const stepId = setInterval(() => {
      s += 1
      if (s < AI_STEPS.length) {
        setStepIdx(s)
      } else {
        clearInterval(stepId)
        setTimeout(() => setGenState('done'), 500)
      }
    }, 650)
    return () => clearInterval(stepId)
  }, [genState])

  const handleGenerate = () => {
    setDots('')
    setStepIdx(0)
    setGenState('generating')
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">AI Campaign Generator</h3>
            <p className="text-xs text-gray-400">Generate personalised campaign visuals with AI</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {genState === 'done' && (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </button>
          )}
          {genState === 'idle' && (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 btn-primary px-4 py-2 text-xs rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Campaign
            </button>
          )}
        </div>
      </div>

      {genState === 'idle' && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">No campaign generated yet</p>
          <p className="text-xs text-gray-400 text-center max-w-[240px] leading-relaxed">
            Generate a personalised social media poster for the {theme.name}
          </p>
        </div>
      )}

      {genState === 'generating' && (
        <div className="flex flex-col items-center justify-center py-14 bg-gray-50 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-primary/8 animate-ping opacity-20" style={{ animationDuration: '2s' }} />
          </div>
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4 relative z-10">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="relative z-10 text-base font-bold text-gray-900 mb-1.5 tabular-nums" style={{ minWidth: '12ch', textAlign: 'center' }}>
            Generating{dots}
          </div>
          <p className="relative z-10 text-xs text-gray-400 mb-5">{AI_STEPS[stepIdx]}</p>
          <div className="relative z-10 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((stepIdx + 1) / AI_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {genState === 'done' && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <img src="/aigeneratedasset.png" alt="Generated campaign assets" className="w-full h-auto block" />
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-500">AI-generated assets ready</span>
            <div className="flex gap-1.5">
              <button className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <Download className="w-3 h-3" />
                Download
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold btn-primary rounded-lg">
                <Send className="w-3 h-3" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 3: Youth Campaigns ───────────────────────────────────────────────────

function TabYouthCampaigns({ drive }) {
  const [selected, setSelected] = useState(CAMPAIGN_THEMES[0])
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 1500)
  }

  const driveName = drive?.location?.split(' ')[0] ?? 'Tampines'

  return (
    <div className="space-y-4">
      {/* Campaign theme pill tabs */}
      <div className="flex gap-2 flex-wrap overflow-x-auto no-scrollbar">
        {CAMPAIGN_THEMES.map(theme => {
          const active = selected.id === theme.id
          return (
            <button
              key={theme.id}
              onClick={() => { setSelected(theme); setGenerated(false) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                active
                  ? 'border-primary text-primary'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {theme.name}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
              }`}>{theme.responseRate}%</span>
            </button>
          )
        })}
      </div>

      {/* Main card */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
          {/* Phone preview */}
          <div className="p-5 border-b border-gray-100 lg:border-b-0 lg:border-r lg:border-gray-100 flex flex-col">
            <div className="text-sm font-semibold text-gray-900 mb-4">Campaign Preview</div>
            <div className="flex justify-center flex-1 items-center">
              <div className="relative flex-shrink-0" style={{ width: 160 }}>
                <img src="/phone.png" alt="" className="w-full h-auto block" style={{ zIndex: 10, pointerEvents: 'none' }} />
                <div
                  className="absolute overflow-hidden bg-white flex items-center justify-center"
                  style={{ top: '7%', left: '7%', right: '7%', bottom: '4%', zIndex: 20, pointerEvents: 'none' }}
                >
                  <img src="/aigeneratedpost.png" alt="Campaign preview" className="w-full object-contain" style={{ maxHeight: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Campaign details */}
          <div className="p-6 flex flex-col gap-5">
            {/* Title + description */}
            <div>
              <h2 className="font-bold text-gray-900 text-xl mb-2">{driveName} {selected.name}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selected.description} Be part of the campaign and make an impact in your community this Saturday.
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1.5">Expected Registrations</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-gray-900">{selected.registrations}</span>
                  <span className="text-sm text-gray-400">donors</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1.5">Response Rate</div>
                <div className="text-3xl font-bold text-green-600">{selected.responseRate}%</div>
              </div>
            </div>

            {/* Meta items + buttons */}
            <div className="flex flex-col gap-4">
              {/* Meta cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: <Users className="w-4 h-4 text-primary" />, label: 'Target Audience', value: '16 – 30 years old' },
                  { icon: <MapPin className="w-4 h-4 text-primary" />, label: 'Reach', value: 'Within 3km of venue' },
                  { icon: <CalendarDays className="w-4 h-4 text-primary" />, label: 'Campaign Date', value: drive?.date ?? 'This Saturday' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-semibold text-gray-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                  <Eye className="w-4 h-4" />
                  Preview Assets
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating || generated}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    generated
                      ? 'bg-success text-white cursor-default focus-visible:ring-success'
                      : 'btn-primary disabled:opacity-60 focus-visible:ring-primary'
                  }`}
                >
                  {generated ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {generated ? 'Campaign Launched' : generating ? 'Launching…' : 'Launch Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Campaign Generator */}
      <AICampaignGenerator theme={selected} drive={drive} />
    </div>
  )
}

// ─── Tab 4: Collaborations ────────────────────────────────────────────────────

function OutreachPreview({ partner, subTab, invited, onInvite }) {
  const [toneIdx, setToneIdx] = useState(0)
  const isInvited = invited.has(partner.name)
  const [sending, setSending] = useState(false)

  const tone = OUTREACH_TONES[toneIdx]

  const [editedBodies, setEditedBodies] = useState(() =>
    Object.fromEntries(OUTREACH_TONES.map(t => {
      const c = subTab === 'Companies'
        ? { noun: 'employees', type: 'workplace giving programme', team: 'HR / CSR Team' }
        : subTab === 'Schools'
        ? { noun: 'students', type: 'campus blood drive', team: 'Student Affairs Office' }
        : { noun: 'members', type: 'community outreach event', team: 'Community Leaders' }
      return [t.id, t.getBody(partner, c)]
    }))
  )
  const [editedSubjects, setEditedSubjects] = useState(() =>
    Object.fromEntries(OUTREACH_TONES.map(t => [t.id, t.getSubject(partner)]))
  )

  useEffect(() => {
    const ctx = subTab === 'Companies'
      ? { noun: 'employees', type: 'workplace giving programme', team: 'HR / CSR Team' }
      : subTab === 'Schools'
      ? { noun: 'students', type: 'campus blood drive', team: 'Student Affairs Office' }
      : { noun: 'members', type: 'community outreach event', team: 'Community Leaders' }
    setEditedBodies(Object.fromEntries(OUTREACH_TONES.map(t => [t.id, t.getBody(partner, ctx)])))
    setEditedSubjects(Object.fromEntries(OUTREACH_TONES.map(t => [t.id, t.getSubject(partner)])))
  }, [partner.name, subTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const ctx = subTab === 'Companies'
    ? { noun: 'employees', type: 'workplace giving programme', team: 'HR / CSR Team' }
    : subTab === 'Schools'
    ? { noun: 'students', type: 'campus blood drive', team: 'Student Affairs Office' }
    : { noun: 'members', type: 'community outreach event', team: 'Community Leaders' }

  const body = editedBodies[tone.id]
  const subject = editedSubjects[tone.id]
  const isDirty = body !== tone.getBody(partner, ctx) || subject !== tone.getSubject(partner)

  const scoreCls = partner.score >= 85
    ? 'bg-green-50 text-green-700 border-green-100'
    : 'bg-amber-50 text-amber-700 border-amber-100'

  const handleReset = () => {
    setEditedBodies(prev => ({ ...prev, [tone.id]: tone.getBody(partner, ctx) }))
    setEditedSubjects(prev => ({ ...prev, [tone.id]: tone.getSubject(partner) }))
  }

  const handleSendInvitation = async () => {
    setSending(true)
    try {
      const { data } = await api.post('/donor-outreach/invitation', {
        partnerName:     partner.name,
        partnerCategory: subTab,
        recipientEmail:  partner.email,
        subject:         subject,
        message:         body,
      })
      console.log('Invitation sent:', data)
      onInvite(partner.name)  // marks as invited in parent state
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card sticky top-4 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-gray-900">Outreach Preview</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{partner.name}</p>
        </div>
        <span className={`font-bold px-2 py-0.5 rounded-full border text-[10px] flex-shrink-0 mt-0.5 ${scoreCls}`}>
          {partner.score}%
        </span>
      </div>

      {/* Tone selector */}
      <div className="px-5 pt-4 pb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium flex-shrink-0">Tone:</span>
          {OUTREACH_TONES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setToneIdx(i)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                i === toneIdx
                  ? 'bg-gray-900 text-white focus-visible:ring-gray-900'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 focus-visible:ring-gray-400'
              }`}
            >
              {t.name}
            </button>
          ))}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${tone.badgeColor}`}>
            {tone.badge}
          </span>
        </div>
      </div>

      {/* Editable email compose area */}
      <div className="p-4">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Email header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 space-y-1.5">
            <div className="flex gap-2.5 text-xs">
              <span className="text-gray-400 w-10 flex-shrink-0">To</span>
              <span className="font-semibold text-gray-900 truncate">{partner.name}</span>
            </div>
            <div className="flex gap-2.5 text-xs">
              <span className="text-gray-400 w-10 flex-shrink-0">From</span>
              <span className="text-gray-700">Singapore Red Cross</span>
            </div>
            <div className="flex gap-2.5 text-xs items-center">
              <span className="text-gray-400 w-10 flex-shrink-0 flex-shrink-0">Subject</span>
              <input
                type="text"
                value={subject}
                onChange={e => setEditedSubjects(prev => ({ ...prev, [tone.id]: e.target.value }))}
                className="flex-1 min-w-0 text-gray-700 font-medium bg-transparent outline-none focus:text-gray-900 border-b border-transparent focus:border-primary/40 pb-px transition-colors"
              />
            </div>
          </div>
          {/* Email body */}
          <div className="p-3">
            <textarea
              value={body}
              onChange={e => setEditedBodies(prev => ({ ...prev, [tone.id]: e.target.value }))}
              rows={8}
              className="w-full text-xs text-gray-700 bg-transparent outline-none resize-none leading-relaxed"
            />
            <div className="mt-1 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{body.length} chars</span>
              {isDirty && (
                <button
                  onClick={handleReset}
                  className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:text-gray-600"
                >
                  Reset to template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send action */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSendInvitation}
          disabled={isInvited || sending}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
            isInvited
              ? 'bg-success text-white cursor-default focus-visible:ring-success'
              : 'btn-primary disabled:opacity-60 focus-visible:ring-primary'
          }`}
        >
          {isInvited ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {isInvited ? 'Invitation Sent' : sending ? 'Sending…' : 'Send Invitation'}
        </button>
      </div>
    </div>
  )
}

function TabCollaborations({ drive }) {
  const SUB_TABS = [
    { label: 'Nearby Companies',         category: 'Companies' },
    { label: 'Educational Institutions', category: 'Schools' },
    { label: 'Community Groups',         category: 'Community Groups' },
  ]

  const [subTab, setSubTab] = useState('Nearby Companies')
  const [invited, setInvited] = useState(new Set())
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [search, setSearch] = useState('')
  const [partners, setPartners] = useState({})
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [radiusKm, setRadiusKm] = useState(5)
  const [expanded, setExpanded] = useState(false)
  const PAGE_SIZE = 3

  useEffect(() => {
    const params = drive?.id ? `?driveCode=${drive.id}` : ''
    api.get(`/collaborators${params}`)
      .then(({ data }) => {
        setPartners(data)
        const firstCategory = SUB_TABS[0].category
        if (data[firstCategory]?.length > 0) setSelectedPartner(data[firstCategory][0])
      })
      .catch(() => {})
      .finally(() => setLoadingPartners(false))
  }, [drive?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setExpanded(false) }, [search, radiusKm])

  const parseDistanceKm = (str) => {
    if (!str) return null
    const [num, unit] = str.split(' ')
    return unit === 'km' ? parseFloat(num) : parseFloat(num) / 1000
  }

  const activeTab = SUB_TABS.find(t => t.label === subTab)
  const category = activeTab?.category
  const allPartners = category ? (partners[category] ?? []) : []
  const filteredPartners = allPartners.filter(p => {
    const distKm = parseDistanceKm(p.distance)
    if (distKm !== null && distKm > radiusKm) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSubTabChange = (label) => {
    setSubTab(label)
    setSearch('')
    setRadiusKm(5)
    setExpanded(false)
    const tab = SUB_TABS.find(t => t.label === label)
    if (tab?.category && partners[tab.category]?.length > 0) setSelectedPartner(partners[tab.category][0])
  }

  const handleInvite = name => setInvited(s => { const n = new Set(s); n.add(name); return n })

  const parseReach = (str) => parseInt(str?.replace(/[^0-9]/g, '') ?? '0', 10) || 0
  const currentReach = allPartners.reduce((sum, p) => sum + parseReach(p.reach), 0)
  const recommendedCount = allPartners.filter(p => p.score >= 80).length
  const sentCount = allPartners.filter(p => invited.has(p.name)).length

  const getMatch = (score) =>
    score >= 80 ? { label: 'High Match',   cls: 'text-green-700 bg-green-50' }
    : score >= 65 ? { label: 'Medium Match', cls: 'text-amber-700 bg-amber-50' }
    :               { label: 'Low Match',    cls: 'text-gray-500 bg-gray-100' }

  const getIconColor = (name) => {
    const palette = [
      'bg-red-100 text-red-700', 'bg-blue-100 text-blue-700',
      'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700',
      'bg-purple-100 text-purple-700', 'bg-sky-100 text-sky-700',
    ]
    return palette[name.charCodeAt(0) % palette.length]
  }

  const viewMoreLabel =
    subTab === 'Nearby Companies' ? 'View More Companies' :
    subTab === 'Educational Institutions' ? 'View More Institutions' :
    'View More Groups'

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Potential Reach',  value: currentReach.toLocaleString(), color: 'text-gray-900' },
          { label: 'Recommended',      value: recommendedCount,              color: 'text-green-600' },
          { label: 'Invitations Sent', value: sentCount,                     color: 'text-primary' },
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main layout: list + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 items-start">

        {/* Left: partner list card */}
        <div className="card overflow-hidden">
          {/* Card heading */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900">Target Collaborations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Partner with organisations and schools near the drive location.</p>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-0 border-b border-gray-200 overflow-x-auto no-scrollbar px-5">
            {SUB_TABS.map(t => (
              <button
                key={t.label}
                onClick={() => handleSubTabChange(t.label)}
                className={`px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-150 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  subTab === t.label
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          {category && (
            <div className="px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b border-gray-100">
              <div className="flex gap-2">
                <div className="flex-1 sm:flex-none sm:w-[130px]">
                  <SelectDropdown
                    value="Within 5 km"
                    options={['Within 1 km', 'Within 3 km', 'Within 5 km', 'Within 10 km']}
                    onChange={opt => setRadiusKm(parseInt(opt.replace(/\D/g, ''), 10))}
                  />
                </div>
                <div className="flex-1 sm:flex-none sm:w-[110px]">
                  <SelectDropdown value="All Types" options={['All Types', 'Large Company', 'SME', 'Health Partner', 'Community Partner']} />
                </div>
              </div>
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search organisation"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Partner rows */}
          {category && (
            <>
              {loadingPartners && (
                <div className="px-5 py-8 text-center text-sm text-gray-400">Loading partners…</div>
              )}
              {!loadingPartners && filteredPartners.length === 0 && (
                <EmptyState
                  size="sm"
                  title="No organisations found"
                  description="Try widening the radius or clearing the search filter."
                  className="flex flex-col items-center justify-center py-12 text-center select-none"
                />
              )}
              <div className="divide-y divide-gray-50">
                {(expanded ? filteredPartners : filteredPartners.slice(0, PAGE_SIZE)).map(partner => {
                  const isSelected = selectedPartner?.name === partner.name
                  const match = getMatch(partner.score)
                  const initials = partner.name.split(' ').slice(0, 2).map(w => w[0]).join('')
                  const iconColor = getIconColor(partner.name)

                  return (
                    <div
                      key={partner.name}
                      onClick={() => setSelectedPartner(partner)}
                      className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors duration-150 ${
                        isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Logo / initials */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${iconColor}`}>
                        {initials}
                      </div>

                      {/* Name, address, distance, tags */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm leading-tight ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                          {partner.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{partner.address}</div>
                        {partner.distance && <div className="text-xs text-gray-400">– {partner.distance} from drive</div>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {partner.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Match quality */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${match.cls}`}>
                          {match.label}
                        </span>
                        <span className="font-bold text-gray-900 text-sm">{partner.score}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* View More */}
              {filteredPartners.length > PAGE_SIZE && (
                <div className="px-5 py-3.5 border-t border-gray-100 flex justify-center">
                  <button
                    onClick={() => setExpanded(e => !e)}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {expanded ? 'Show Less' : `${viewMoreLabel} (${filteredPartners.length - PAGE_SIZE} more)`}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Outreach preview panel */}
        {selectedPartner && category && (
          <OutreachPreview
            partner={selectedPartner}
            subTab={category}
            invited={invited}
            onInvite={handleInvite}
          />
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DonorOutreach() {
  const [drives, setDrives]             = useState([])
  const [selectedDriveId, setSelectedDriveId] = useState(null)
  const [showDriveDropdown, setShowDriveDropdown] = useState(false)
  const [activeTab, setActiveTab]       = useState('ai')
  const [showCombined, setShowCombined] = useState(false)
  const [loading, setLoading]           = useState(true)
  const [messageVariants, setMessageVariants] = useState([])
  const [aiLoading, setAiLoading]       = useState(false)
  const [outreachStrategy, setOutreachStrategy] = useState(null)
  const [strategyLoading, setStrategyLoading]   = useState(false)

  useEffect(() => {
    api.get('/drives')
      .then(r => {
        const upcoming = r.data.filter(d => d.status !== 'Completed')
        setDrives(upcoming)
        if (upcoming.length > 0) setSelectedDriveId(upcoming[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fetchMessages = (refresh = false) => {
    const drive = drives.find(d => d.id === selectedDriveId) ?? drives[0]
    if (!drive) return
    setAiLoading(true)
    const refreshParam = refresh ? '&refresh=true' : ''
    api.get(`/forecast/outreach-messages?driveCode=${drive.id}${refreshParam}`)
      .then(r => {
        const formatted = r.data.map((msg, idx) => ({
          id: String.fromCharCode(65 + idx),
          name: `AI Variant ${idx + 1}`,
          badge: idx === 0 ? 'AI Recommended' : 'AI Generated',
          badgeColor: idx === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700',
          body: msg,
          responseRate: [24, 21, 18][idx] ?? 20,
        }))
        setMessageVariants(formatted)
      })
      .catch(() => setMessageVariants([]))
      .finally(() => setAiLoading(false))
  }

  useEffect(() => { fetchMessages() }, [selectedDriveId, drives]) // eslint-disable-line react-hooks/exhaustive-deps

  const drive = drives.find(d => d.id === selectedDriveId) ?? drives[0]

  const fetchStrategy = (refresh = false) => {
    if (!drive) return
    setStrategyLoading(true)
    const qs = refresh ? '&refresh=true' : ''
    api.get(`/donor-outreach/strategy?driveCode=${drive.id}${qs}`)
      .then(r => setOutreachStrategy(r.data))
      .catch(() => setOutreachStrategy(null))
      .finally(() => setStrategyLoading(false))
  }

  useEffect(() => { fetchStrategy(false) }, [drive?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <PageLayout title="Donor Outreach" subtitle="How should SRC maximise donor turnout for this drive?">
      <LoadingScreen variant="donorOutreach" />
    </PageLayout>
  )

  const changeDriveButton = (
    <div className="relative">
      <button
        onClick={() => setShowDriveDropdown(!showDriveDropdown)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-white shadow-sm"
      >
        Change Drive
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDriveDropdown ? 'rotate-180' : ''}`} />
      </button>
      {showDriveDropdown && (
        <div className="absolute right-0 mt-1.5 w-72 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
          {drives.map(d => (
            <button
              key={d.id}
              onClick={() => { setSelectedDriveId(d.id); setShowDriveDropdown(false); setActiveTab('ai') }}
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
      subtitle="How should SRC maximise donor turnout for this drive?"
    >
      {/* Drive summary card */}
      {drive && (
        <div className="card p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-gray-900 text-sm truncate">{drive.location}</div>
                <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />{drive.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />{drive.time}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-5">
              <div className="flex items-center gap-4 sm:gap-5">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Target Blood Type</div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-primary text-sm">{drive.bloodType}</span>
                  </div>
                </div>
                <div className="w-px h-7 bg-gray-100 hidden sm:block" />
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Linked Alert</div>
                  <div className="flex items-center gap-1 text-primary text-sm font-semibold">
                    {drive.linkedAlert}<ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div className="w-px h-7 bg-gray-100 hidden sm:block" />
              {changeDriveButton}
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-0 mb-4 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-150 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-primary' : 'text-gray-400'}>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div key={activeTab} className="page-enter-animate">
        {activeTab === 'ai'     && <TabAIRecommended drive={drive} outreachStrategy={outreachStrategy} strategyLoading={strategyLoading} onRefresh={() => fetchStrategy(true)} onViewCombined={() => setShowCombined(true)} />}
        {activeTab === 'push'   && <TabPushNotifications drive={drive} aiVariants={messageVariants} aiLoading={aiLoading} onRefresh={() => fetchMessages(true)} />}
        {activeTab === 'youth'  && <TabYouthCampaigns drive={drive} />}
        {activeTab === 'collab' && <TabCollaborations drive={drive} />}
      </div>

      {showCombined && <CombinedPlanModal onClose={() => setShowCombined(false)} />}
    </PageLayout>
  )
}
