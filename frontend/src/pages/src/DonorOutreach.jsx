import { useState } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis
} from 'recharts'
import {
  CalendarDays, Clock, Droplets, MapPin, ExternalLink,
  Users, Send, ChevronDown, CheckSquare, Square, Edit2, Info
} from 'lucide-react'

const SELECTED_DRIVE = {
  location: 'Tampines Community Plaza',
  date: '31 May 2026',
  time: '10:00 AM – 4:00 PM',
  bloodType: 'O-',
  linkedAlert: 'ALT-2505-001',
  status: 'Ready for Outreach',
}

const AGE_DATA = [
  { group: '21–30 years', count: 32, pct: 37, color: '#EF4444' },
  { group: '31–40 years', count: 28, pct: 33, color: '#FECACA' },
  { group: '41–50 years', count: 17, pct: 20, color: '#FCA5A5' },
  { group: '51+ years',   count: 9,  pct: 10, color: '#FEE2E2' },
]

const AREA_DATA = [
  { area: 'Tampines',  count: 42 },
  { area: 'Pasir Ris', count: 21 },
  { area: 'Bedok',     count: 12 },
  { area: 'Hougang',   count: 11 },
]

const ELIGIBLE_DONORS = 86
const EST_RESPONSE = 18
const RESPONSE_RATE = 21

const MESSAGE_TEMPLATE = `Urgent O- donors needed near Tampines Community Plaza this Saturday.

Your donation can help prevent an upcoming shortage.

Book your slot today.

Tap to book: https://codered.sg/abcd1234`

function SelectDropdown({ label, value, options }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value)
  return (
    <div className="relative">
      <div className="text-[10px] text-gray-400 font-medium mb-1">{label}</div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 bg-white hover:bg-gray-50 min-w-24"
      >
        {label === 'Blood Type' && <Droplets className="w-3 h-3 text-primary" />}
        {label === 'Radius' && <MapPin className="w-3 h-3 text-gray-400" />}
        <span className="flex-1 text-left">{selected}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { setSelected(opt); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
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
    <div>
      <div className="text-[10px] text-gray-400 font-medium mb-1">{label}</div>
      <button onClick={() => setChecked(!checked)} className="flex items-center">
        {checked
          ? <CheckSquare className="w-4 h-4 text-primary" />
          : <Square className="w-4 h-4 text-gray-300" />
        }
      </button>
    </div>
  )
}

function PhoneMockup({ message }) {
  return (
    <div className="relative mx-auto" style={{ width: 200 }}>
      {/* Phone frame */}
      <div className="bg-gray-900 rounded-3xl p-2" style={{ paddingTop: 28, paddingBottom: 16 }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-white text-[8px] font-semibold">10:30</span>
          <div className="flex items-center gap-0.5">
            <div className="w-3 h-1.5 bg-white rounded-sm opacity-80" />
            <div className="w-1 h-1 bg-white rounded-full opacity-80" />
          </div>
        </div>
        {/* Screen */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden min-h-64 p-2">
          {/* App header */}
          <div className="flex items-center gap-2 px-2 py-2 border-b border-gray-100 mb-2">
            <span className="text-primary text-xs">←</span>
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[7px] font-bold">+</span>
            </div>
            <span className="text-[9px] font-semibold text-gray-800">Singapore Red Cross</span>
          </div>
          {/* Message bubble */}
          <div className="px-2 space-y-1">
            <div className="bg-gray-200 rounded-xl rounded-tl-sm p-2.5 max-w-[90%]">
              {message.split('\n').map((line, i) => (
                <p key={i} className="text-[8px] text-gray-800 leading-relaxed">
                  {line || ' '}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DonorOutreach() {
  const [message, setMessage] = useState(MESSAGE_TEMPLATE)
  const [editingMessage, setEditingMessage] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1500)
  }

  return (
    <PageLayout
      title="Donor Outreach"
      subtitle="Reach the right donors for your drive."
      footer={
        <div className="bg-white border-t border-gray-200 z-30 flex-shrink-0">
          <div className="flex items-center gap-6 px-8 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{ELIGIBLE_DONORS} Recipients Selected</div>
                <div className="text-xs text-gray-400">Based on your audience filters</div>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="text-xs text-gray-400">Estimated Response</div>
              <div className="text-sm font-bold text-gray-900">{EST_RESPONSE} donors</div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <p className="text-xs text-gray-400">The alert will be sent via SMS</p>
              <button
                onClick={handleSend}
                disabled={sending || sent}
                className="flex items-center gap-2 btn-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {sent ? 'Sent!' : sending ? 'Sending…' : `Send Alert to ${ELIGIBLE_DONORS} Donors`}
              </button>
            </div>
          </div>
        </div>
      }
    >
      {/* Selected Drive card */}
      <div className="card p-4 mb-5 flex items-center gap-5">
        <div className="w-24 h-16 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-gray-400 font-medium mb-0.5">Selected Drive</div>
          <h3 className="font-bold text-gray-900">{SELECTED_DRIVE.location}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {SELECTED_DRIVE.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {SELECTED_DRIVE.time}</span>
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-primary" />
              Target: <span className="font-semibold text-primary ml-0.5">{SELECTED_DRIVE.bloodType}</span>
            </span>
            <span className="flex items-center gap-1.5">
              Linked Alert:
              <span className="text-primary font-semibold flex items-center gap-1">
                {SELECTED_DRIVE.linkedAlert} <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            {SELECTED_DRIVE.status}
          </span>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-2 gap-5 mb-24">
        {/* Left column: Audience Selection + Donor Insights */}
        <div className="space-y-4">
          {/* Audience Selection */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Audience Selection</h3>
            <p className="text-xs text-gray-400 mb-4">Refine your audience to find the most relevant donors.</p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
              <SelectDropdown
                label="Blood Type"
                value="O-"
                options={['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']}
              />
              <SelectDropdown
                label="Radius"
                value="5 km"
                options={['2 km', '5 km', '10 km', '15 km', '20 km']}
              />
              <SelectDropdown
                label="Last Donated"
                value="> 12 weeks"
                options={['> 8 weeks', '> 12 weeks', '> 16 weeks', 'Any']}
              />
              <CheckFilter label="Previous Responders" defaultChecked={true} />
              <CheckFilter label="Weekend Availability" defaultChecked={true} />
            </div>

            <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-500">
              <Users className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              We'll find donors who match all selected criteria and are most likely to respond to your outreach.
            </div>
          </div>

          {/* Donor Insights */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-1">Donor Insights</h3>
            <p className="text-xs text-gray-400 mb-3">Overview of your potential audience.</p>

            <div className="flex items-start gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">O- Donors</div>
                <div className="text-3xl font-bold text-primary">{ELIGIBLE_DONORS}</div>
                <Droplets className="w-5 h-5 text-primary/40 mt-0.5" />
              </div>
              {/* Age donut */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 font-medium mb-2">Age Groups</div>
                <div className="flex items-center gap-3">
                  <PieChart width={80} height={80}>
                    <Pie
                      data={AGE_DATA}
                      dataKey="count"
                      cx={38}
                      cy={38}
                      innerRadius={22}
                      outerRadius={38}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {AGE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="space-y-1">
                    {AGE_DATA.map(d => (
                      <div key={d.group} className="flex items-center gap-1.5 text-[10px]">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-gray-600">{d.group}</span>
                        <span className="ml-auto font-semibold text-gray-800 pl-2">{d.count} ({d.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top areas */}
            <div>
              <div className="text-xs text-gray-500 font-medium mb-2">Top Areas</div>
              <div className="space-y-2">
                {AREA_DATA.map(d => (
                  <div key={d.area} className="flex items-center gap-3 text-xs">
                    <span className="w-16 text-gray-700">{d.area}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(d.count / ELIGIBLE_DONORS) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-gray-500">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-4 text-[10px] text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <span className="w-3.5 h-3.5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px]">✓</span>
              </span>
              All donors are within 5km radius and match your selected criteria.
            </div>
          </div>
        </div>

        {/* Right column: Eligible Donors summary + Message Preview */}
        <div className="space-y-4">
          {/* Eligible Donors summary */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Eligible Donors</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <Users className="w-8 h-8 text-primary/30 mx-auto mb-1" />
                <div className="text-5xl font-bold text-primary">{ELIGIBLE_DONORS}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xl font-bold text-gray-900">{EST_RESPONSE}</div>
                <div className="text-xs text-gray-400 mt-0.5">Estimated Response</div>
                <div className="text-xs text-gray-500">donors</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xl font-bold text-gray-900">{RESPONSE_RATE}%</div>
                <div className="text-xs text-gray-400 mt-0.5">Response Rate</div>
              </div>
            </div>
            <button className="mt-3 w-full py-2 text-xs text-primary font-semibold text-center hover:underline flex items-center justify-center gap-1">
              View Donor List →
            </button>
          </div>

          {/* Message Preview */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-1">Message Preview</h3>
            <p className="text-xs text-gray-400 mb-4">This is how your message will look to donors.</p>

            {editingMessage ? (
              <div className="mb-4">
                <textarea
                  className="w-full text-xs border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  rows={6}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setEditingMessage(false)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setEditingMessage(false)}
                    className="px-3 py-1.5 text-xs btn-primary"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <PhoneMockup message={message} />
            )}

            {!editingMessage && (
              <button
                onClick={() => setEditingMessage(true)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-gray-600 font-medium hover:bg-gray-50 py-2 rounded-lg border border-gray-200"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Message
              </button>
            )}
          </div>
        </div>
      </div>

    </PageLayout>
  )
}
