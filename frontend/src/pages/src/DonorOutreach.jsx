import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import LoadingScreen from '../../components/common/LoadingScreen'
import api from '../../api/axios'
import {
  CalendarDays, Clock, Droplets, MapPin, ExternalLink,
  Users, Send, ChevronDown, Check, Sparkles, X,
  MessageSquare, Building2, GraduationCap, Heart, Zap,
  ChevronRight, Star,
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

const PARTNERS = {
  Companies: [
    { name: 'DBS',                distance: '1.2km', reach: '4,500 employees', score: 88 },
    { name: 'Singapore Airlines', distance: '2.1km', reach: '3,200 employees', score: 75 },
    { name: 'CapitaLand',         distance: '0.9km', reach: '2,800 employees', score: 82 },
    { name: 'ST Engineering',     distance: '1.8km', reach: '2,100 employees', score: 70 },
  ],
  Schools: [
    { name: 'Temasek Polytechnic', distance: '0.8km', reach: '2,000 students', score: 92 },
    { name: 'SUTD',                distance: '1.4km', reach: '1,800 students', score: 85 },
    { name: 'ITE College East',    distance: '1.1km', reach: '1,500 students', score: 78 },
    { name: 'Temasek JC',          distance: '0.6km', reach: '1,200 students', score: 81 },
  ],
  'Community Groups': [
    { name: 'Community Clubs',           distance: '0.3km', reach: '3,000 members', score: 90 },
    { name: 'Religious Organisations',   distance: '0.5km', reach: '1,500 members', score: 86 },
    { name: 'Grassroots Organisations',  distance: '0.4km', reach: '2,200 members', score: 88 },
  ],
}

const TABS = [
  { id: 'ai',     label: 'AI Recommended',     icon: <Sparkles className="w-4 h-4" /> },
  { id: 'push',   label: 'Push Notifications', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'youth',  label: 'Youth Campaigns',    icon: <Zap className="w-4 h-4" /> },
  { id: 'collab', label: 'Collaborations',     icon: <Building2 className="w-4 h-4" /> },
]

// ─── Shared sub-components ────────────────────────────────────────────────────

function SelectDropdown({ label, value, options, icon }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value)
  const labelId = label ? `label-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined
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
              onClick={() => { setSelected(opt); setOpen(false) }}
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

// ─── Tab 1: AI Recommended ────────────────────────────────────────────────────

function TabAIRecommended({ onViewCombined }) {
  const reasons = [
    'High student population within 3km',
    'Strong engagement in previous youth campaigns',
    'Weekend timing aligns with youth availability',
    'High social sharing potential',
  ]

  const stats = [
    { label: 'Recommended Audience',  value: '18–30 years old', color: 'text-gray-900' },
    { label: 'Recommended Strategy',  value: 'Youth Campaign',  color: 'text-amber-600' },
    { label: 'Expected Response Rate', value: '36%',            color: 'text-green-600' },
    { label: 'Expected Registrations', value: '31 donors',      color: 'text-gray-900' },
  ]

  return (
    <div className="space-y-4">
      {/* AI strategy card */}
      <div className="card p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">AI Recommended Strategy</h3>
            <p className="text-xs text-gray-400">Based on drive location, timing, and historical response data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_108px] gap-4 mb-5">
          {/* Stat list — key/value pairs instead of identical boxes */}
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {stats.map(stat => (
              <div key={stat.label} className="flex items-center justify-between px-4 py-2.5 bg-white">
                <span className="text-xs text-gray-500">{stat.label}</span>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
          {/* Confidence score — kept compact, one card is fine here */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center flex flex-col justify-center gap-1">
            <div className="text-xs text-gray-400">Confidence</div>
            <div className="text-3xl font-bold text-green-600">89%</div>
            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">High</span>
          </div>
        </div>

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
      </div>

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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STRATEGY_COMPARISON.map(s => (
            <div
              key={s.id}
              className={`relative rounded-xl border-2 p-4 ${s.border} ${s.bg} ${
                s.best ? 'ring-2 ring-green-300/50' : ''
              }`}
            >
              {s.best && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full whitespace-nowrap">
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

function TabPushNotifications({ drive }) {
  const [variantIdx, setVariantIdx] = useState(0)
  const [sent, setSent]     = useState(false)
  const [sending, setSending] = useState(false)
  const [prevRespondersOnly, setPrevRespondersOnly] = useState(true)
  const [editedBodies, setEditedBodies] = useState(() =>
    Object.fromEntries(MESSAGE_VARIANTS.map(v => [v.id, v.body]))
  )

  const variant = MESSAGE_VARIANTS[variantIdx]
  const body = editedBodies[variant.id]
  const isDirty = body !== variant.body

  const handleBodyChange = (e) => {
    setEditedBodies(prev => ({ ...prev, [variant.id]: e.target.value }))
    setSent(false)
  }

  const handleReset = () => {
    setEditedBodies(prev => ({ ...prev, [variant.id]: variant.body }))
    setSent(false)
  }

  const handleSend = () => {
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1500)
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
            <SelectDropdown
              label="Blood Type"
              value={drive?.bloodType ?? 'O-'}
              options={['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']}
              icon={<Droplets className="w-3.5 h-3.5" />}
            />
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

          <div className="flex gap-6 items-start">
            {/* Phone mockup */}
            <div className="relative flex-shrink-0" style={{ width: 160 }}>
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

            {/* Right panel — three clear groups with varied spacing */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">

              {/* Group 1: variant selection + name + response rate */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  {MESSAGE_VARIANTS.map((v, i) => (
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
              </div>

              {/* Group 2: message editor */}
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

              {/* Group 3: send action */}
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
                  {sent ? 'Sent to 86 donors' : sending ? 'Sending…' : 'Send Push Notification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 3: Youth Campaigns ───────────────────────────────────────────────────

function TabYouthCampaigns({ drive }) {
  const [selected, setSelected] = useState(CAMPAIGN_THEMES[0])
  const [launched, setLaunched] = useState(false)
  const [launching, setLaunching] = useState(false)

  const handleLaunch = () => {
    setLaunching(true)
    setTimeout(() => { setLaunching(false); setLaunched(true) }, 1500)
  }

  const driveName = drive?.location?.split(' ')[0] ?? 'Tampines'

  return (
    <div className="space-y-4">
      {/* Campaign theme cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CAMPAIGN_THEMES.map(theme => {
          const active = selected.id === theme.id
          return (
            <button
              key={theme.id}
              onClick={() => { setSelected(theme); setLaunched(false) }}
              className={`card p-4 text-left transition-[box-shadow,border-color] duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                active ? 'border-2 border-primary ring-2 ring-primary/10' : 'hover:border-gray-200'
              }`}
            >
              {active && (
                <span className="inline-block mb-2 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full">
                  Selected
                </span>
              )}
              <div className="font-bold text-sm text-gray-900 mb-1">{theme.name}</div>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{theme.description}</p>
              <div className="flex justify-between text-xs">
                <div>
                  <div className="text-[10px] text-gray-400">Registrations</div>
                  <div className="font-bold text-gray-900">{theme.registrations}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400">Response Rate</div>
                  <div className="font-bold text-green-700">{theme.responseRate}%</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Preview + details */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
        {/* Phone preview */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-gray-800">Campaign Preview</h3>
          </div>
          <div className="flex justify-center">
            <div className="relative flex-shrink-0" style={{ width: 152 }}>
              <img
                src="/phone.png"
                alt=""
                className="w-full h-auto block"
                style={{ zIndex: 10, pointerEvents: 'none' }}
              />
              <div
                className="absolute overflow-hidden flex flex-col"
                style={{ top: '13%', left: '7%', right: '7%', bottom: '4%', zIndex: 20, pointerEvents: 'none' }}
              >
                {/* SRC header */}
                <div className="bg-primary px-1.5 py-1 flex items-center gap-1 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-1.5 h-1.5 text-primary" />
                  </div>
                  <span className="text-white font-semibold" style={{ fontSize: '5.5px' }}>Singapore Red Cross</span>
                </div>
                {/* Campaign hero */}
                <div className="bg-primary/90 flex flex-col items-center justify-center py-4 px-2 flex-shrink-0">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mb-1">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-white font-bold text-center uppercase" style={{ fontSize: '6px', letterSpacing: '0.04em', lineHeight: '1.4' }}>
                    {driveName}<br />{selected.name}
                  </div>
                </div>
                {/* Post body */}
                <div className="bg-white px-1.5 py-1.5 flex flex-col gap-1">
                  <p className="text-gray-700 leading-relaxed" style={{ fontSize: '5.5px' }}>
                    Join {selected.registrations} donors this Saturday. Help prevent an O- shortage.
                  </p>
                  <div className="w-full bg-primary rounded py-0.5 text-center text-white font-semibold" style={{ fontSize: '5.5px' }}>
                    Reserve Your Slot
                  </div>
                  <div className="text-gray-400" style={{ fontSize: '5px' }}>Today, 10:00 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign details + launch */}
        <div className="card p-5 flex flex-col gap-4">
          <div>
            <div className="font-bold text-gray-900 text-base mb-1.5">{driveName} {selected.name}</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Join other young donors this Saturday and help prevent an O- shortage.
              Be part of the {selected.name.toLowerCase()} and make an impact in your community.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">Expected Registrations</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-900">{selected.registrations}</span>
                <span className="text-xs text-gray-400">donors</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">Response Rate</div>
              <div className="text-2xl font-bold text-green-700">{selected.responseRate}%</div>
            </div>
          </div>

          <button
            onClick={handleLaunch}
            disabled={launching || launched}
            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
              launched
                ? 'bg-success text-white cursor-default focus-visible:ring-success'
                : 'btn-primary disabled:opacity-60 focus-visible:ring-primary'
            }`}
          >
            {launched ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            {launched ? 'Campaign Launched' : launching ? 'Launching…' : 'Launch Campaign'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 4: Collaborations ────────────────────────────────────────────────────

function OutreachPreview({ partner, subTab, invited, onInvite }) {
  const isInvited = invited.has(partner.name)

  const ctx = subTab === 'Companies'
    ? { noun: 'employees', type: 'workplace giving programme', team: 'HR / CSR Team' }
    : subTab === 'Schools'
    ? { noun: 'students', type: 'campus blood drive', team: 'Student Affairs Office' }
    : { noun: 'members', type: 'community outreach event', team: 'Community Leaders' }

  return (
    <div className="card p-5 sticky top-4">
      <div className="flex items-center gap-2 mb-4">
        <Send className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-gray-800">Outreach Preview</h3>
      </div>

      {/* Email mockup */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 space-y-1.5">
          <div className="flex gap-2.5 text-xs">
            <span className="text-gray-400 w-10 flex-shrink-0">To</span>
            <span className="font-semibold text-gray-900">{partner.name}</span>
          </div>
          <div className="flex gap-2.5 text-xs">
            <span className="text-gray-400 w-10 flex-shrink-0">From</span>
            <span className="text-gray-700">Singapore Red Cross</span>
          </div>
          <div className="flex gap-2.5 text-xs">
            <span className="text-gray-400 w-10 flex-shrink-0">Subject</span>
            <span className="text-gray-700 font-medium">Blood Drive Partnership — Tampines</span>
          </div>
        </div>
        <div className="p-4 space-y-2 text-xs text-gray-700 leading-relaxed">
          <p>Dear {partner.name} {ctx.team},</p>
          <p>
            Singapore Red Cross is organising a blood donation drive at Tampines Community
            Plaza this Saturday and would love to partner with your organisation.
          </p>
          <p>
            With {partner.reach} within {partner.distance}, your {ctx.noun} can
            make a real difference through our {ctx.type}.
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 text-center">
              <span className="text-primary text-xs font-semibold">Confirm Your Participation</span>
            </div>
          </div>
          <p className="text-gray-400 text-[10px]">Singapore Red Cross · Donor Outreach</p>
        </div>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between text-xs mb-4 px-0.5">
        <span className="text-gray-500">Partnership Score</span>
        <span className={`font-bold px-2 py-0.5 rounded-full border text-[10px] ${
          partner.score >= 85
            ? 'bg-green-50 text-green-700 border-green-100'
            : 'bg-amber-50 text-amber-700 border-amber-100'
        }`}>{partner.score}%</span>
      </div>

      <button
        onClick={() => onInvite(partner.name)}
        disabled={isInvited}
        className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
          isInvited
            ? 'bg-success text-white cursor-default focus-visible:ring-success'
            : 'btn-primary focus-visible:ring-primary'
        }`}
      >
        {isInvited ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        {isInvited ? 'Invitation Sent' : `Send Invitation`}
      </button>
    </div>
  )
}

function TabCollaborations() {
  const [subTab, setSubTab] = useState('Schools')
  const [invited, setInvited] = useState(new Set())
  const [selectedPartner, setSelectedPartner] = useState(PARTNERS['Schools'][0])

  const handleSubTabChange = (tab) => {
    setSubTab(tab)
    setSelectedPartner(PARTNERS[tab][0])
  }

  const handleInvite = name => setInvited(s => { const n = new Set(s); n.add(name); return n })

  const partners = PARTNERS[subTab] ?? []
  const subTabs = ['Companies', 'Schools', 'Community Groups']

  const tabIcon = t =>
    t === 'Companies'       ? <Building2 className="w-4 h-4" /> :
    t === 'Schools'         ? <GraduationCap className="w-4 h-4" /> :
                              <Heart className="w-4 h-4" />

  const cardIcon = t =>
    t === 'Companies'       ? { el: <Building2 className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' } :
    t === 'Schools'         ? { el: <GraduationCap className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' } :
                              { el: <Heart className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="card p-1 flex gap-1 w-fit">
        {subTabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleSubTabChange(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              subTab === tab ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className={subTab === tab ? 'text-white' : 'text-gray-400'}>{tabIcon(tab)}</span>
            {tab}
          </button>
        ))}
      </div>

      {/* Partner list + outreach preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        {/* Partner cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {partners.map(partner => {
            const isInvited = invited.has(partner.name)
            const isSelected = selectedPartner?.name === partner.name
            const { el: icon, bg } = cardIcon(subTab)
            const scoreCls = partner.score >= 85
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-amber-50 text-amber-700 border-amber-100'

            return (
              <button
                key={partner.name}
                onClick={() => setSelectedPartner(partner)}
                className={`card p-4 text-left w-full transition-[box-shadow,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  isSelected
                    ? 'border-2 border-primary ring-2 ring-primary/10'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-gray-900 leading-tight truncate">{partner.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{partner.distance}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Potential Reach</span>
                    <span className="font-semibold text-gray-800">{partner.reach}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Partnership Score</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded-full border text-[10px] ${scoreCls}`}>
                      {partner.score}%
                    </span>
                  </div>
                </div>
                {isInvited && (
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] text-green-700 font-medium">
                    <Check className="w-3 h-3" />
                    Invitation sent
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Outreach preview panel */}
        {selectedPartner && (
          <OutreachPreview
            partner={selectedPartner}
            subTab={subTab}
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

  const drive = drives.find(d => d.id === selectedDriveId) ?? drives[0]

  if (loading) return (
    <PageLayout title="Donor Outreach" subtitle="How should SRC maximise donor turnout for this drive?">
      <LoadingScreen variant="general" />
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
        <div className="absolute right-0 mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
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
      actions={changeDriveButton}
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
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
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
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-0 mb-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-150 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-primary' : 'text-gray-400'}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div key={activeTab} className="page-enter-animate">
        {activeTab === 'ai'     && <TabAIRecommended onViewCombined={() => setShowCombined(true)} />}
        {activeTab === 'push'   && <TabPushNotifications drive={drive} />}
        {activeTab === 'youth'  && <TabYouthCampaigns drive={drive} />}
        {activeTab === 'collab' && <TabCollaborations />}
      </div>

      {showCombined && <CombinedPlanModal onClose={() => setShowCombined(false)} />}
    </PageLayout>
  )
}
