import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import LoadingScreen from '../../components/common/LoadingScreen'
import api from '../../api/axios'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { Users, CalendarDays, TrendingUp, TrendingDown, Info, Filter, Calendar } from 'lucide-react'

function TrendBadge({ pct, positive }) {
  const up = positive !== false
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pct}%
    </span>
  )
}

function KpiCard({ icon, label, value, trendPct, trendPositive, trendLabel }) {
  return (
    <div className="card p-3 sm:p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <span className="text-xs text-gray-500 font-medium leading-tight">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="flex items-center gap-1 flex-wrap">
        <TrendBadge pct={trendPct} positive={trendPositive} />
        <span className="text-xs text-gray-400">{trendLabel}</span>
      </div>
    </div>
  )
}

const CustomBarLabel = ({ x, y, width, value }) => (
  <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#6B7280">{value}%</text>
)

const BLOOD_TYPE_COLORS = {
  'O+': '#EF4444',
  'A+': '#F97316',
  'B+': '#EAB308',
  'O-': '#22C55E',
  'A-': '#3B82F6',
  'AB+': '#8B5CF6',
  'B-': '#EC4899',
  'AB-': '#14B8A6',
}

function getBloodTypeColor(type) {
  return BLOOD_TYPE_COLORS[type] ?? '#9CA3AF'
}

export default function DonorInformation() {
  const [data, setData]           = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get('/donors/stats').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <PageLayout title="Donor Information & Summary" subtitle="Overview of the current donor pool and key insights">
      <LoadingScreen variant="donorInformation" />
    </PageLayout>
  )

  const summary          = data?.summary ?? {}
  const byBloodType      = data?.byBloodType ?? []
  const byAge            = data?.byAge ?? []
  const byLocation       = data?.byLocation ?? []
  const responseRateTrend = data?.responseRateTrend ?? []

  return (
    <PageLayout
      title="Donor Information & Summary"
      subtitle="Overview of the current donor pool and key insights"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-50 text-gray-600"
          >
            <Calendar className="w-3.5 h-3.5" /> 30 Apr – 30 May 2026
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-50 text-gray-600">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      }
    >

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          icon={<Users className="w-4 h-4 text-primary" />}
          label="Active Donors"
          value={(summary.activeDonors ?? 0).toLocaleString()}
          trendPct={4.2} trendPositive={true} trendLabel="vs last month"
        />
        <KpiCard
          icon={<CalendarDays className="w-4 h-4 text-primary" />}
          label="Eligible Repeat Donors"
          value={(summary.eligibleRepeat ?? 0).toLocaleString()}
          trendPct={3.6} trendPositive={true} trendLabel="vs last month"
        />
        <KpiCard
          icon={<Users className="w-4 h-4 text-gray-400" />}
          label="Dormant Donors"
          value={(summary.dormant ?? 0).toLocaleString()}
          trendPct={2.1} trendPositive={false} trendLabel="vs last month"
        />
        <KpiCard
          icon={<TrendingUp className="w-4 h-4 text-primary" />}
          label="Past Response Rate"
          value={`${summary.responseRate ?? 0}%`}
          trendPct={2.8} trendPositive={true} trendLabel="vs last campaign"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5 items-stretch">
        {/* Donors by Blood Type — donut */}
        <div className="card p-4 flex flex-col">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Donors by Blood Type</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <PieChart width={140} height={140}>
                <Pie data={byBloodType} dataKey="count" cx={65} cy={65} innerRadius={36} outerRadius={62} startAngle={90} endAngle={-270}>
                  {byBloodType.map((d, i) => <Cell key={i} fill={getBloodTypeColor(d.type)} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[9px] text-gray-400">Total Donors</div>
                <div className="text-xs font-bold text-gray-800">{(summary.activeDonors ?? 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs flex-1">
              {byBloodType.map(d => (
                <div key={d.type} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getBloodTypeColor(d.type) }} />
                  <span className="text-gray-700 font-medium w-5">{d.type}</span>
                  <span className="text-gray-500 ml-auto">{d.count.toLocaleString()}</span>
                  <span className="text-gray-400 w-10 text-right">({d.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
            <Info className="w-3 h-3" /> O+ donors form the largest group in the donor pool.
          </p>
        </div>

        {/* Donors by Age Group — bar */}
        <div className="card p-4 flex flex-col">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Donors by Age Group</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <BarChart data={byAge} margin={{ top: 14, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="group" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [v.toLocaleString(), 'Donors']} />
                <Bar dataKey="count" fill="#FECACA" radius={[3, 3, 0, 0]} label={<CustomBarLabel />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
            {byAge.map(d => (
              <span key={d.group} className="text-[9px] text-gray-400">{d.group}: {d.pct}%</span>
            ))}
          </div>
        </div>

        {/* Donors by Location (Top 5) */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Donors by Location (Top 5)</h3>
          <div className="relative rounded-lg overflow-hidden bg-rose-50 border border-rose-100 mb-3" style={{ height: 100 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-rose-300 font-medium">Singapore</span>
            </div>
            {byLocation.map((loc, i) => {
              const positions = [
                { top: '55%', left: '78%' },
                { top: '60%', left: '25%' },
                { top: '15%', left: '35%' },
                { top: '35%', left: '55%' },
                { top: '70%', left: '65%' },
              ]
              const pos = positions[i] || { top: '50%', left: '50%' }
              const sizes = [36, 30, 26, 22, 18]
              const size = sizes[i] || 18
              return (
                <div
                  key={loc.name}
                  className="absolute rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center"
                  style={{ width: size, height: size, top: pos.top, left: pos.left, transform: 'translate(-50%,-50%)' }}
                >
                  <span className="text-[8px] font-bold text-primary">{loc.rank}</span>
                </div>
              )
            })}
          </div>
          <div className="space-y-1.5">
            {byLocation.map((loc) => (
              <div key={loc.name} className="flex items-center gap-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0">
                  {loc.rank}
                </span>
                <span className="flex-1 text-gray-700 font-medium">{loc.name}</span>
                <span className="text-gray-500">{loc.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Response rate trend */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Past Response Rate Trend</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={responseRateTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 40]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`${v}%`, 'Response Rate']} />
              <Line type="monotone" dataKey="rate" stroke="#C20000" strokeWidth={2} dot={{ fill: '#C20000', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-1.5 mt-1 justify-center text-[10px] text-gray-400">
            <span className="w-4 h-0.5 bg-primary inline-block rounded" />
            Response Rate (%)
          </div>
        </div>

        {/* Key takeaways */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Key Takeaways</h3>
          <div className="space-y-3">
            {[
              { icon: Users,        color: 'bg-red-100',    iconColor: 'text-primary',
                text: 'Active donor base grew by 4.2% compared to last month.' },
              { icon: CalendarDays, color: 'bg-blue-100',   iconColor: 'text-blue-600',
                text: `${(summary.eligibleRepeat ?? 0).toLocaleString()} donors are eligible for repeat donation.` },
              { icon: Users,        color: 'bg-purple-100', iconColor: 'text-purple-600',
                text: `Improve re-engagement for ${(summary.dormant ?? 0).toLocaleString()} dormant donors.` },
              { icon: TrendingUp,   color: 'bg-green-100',  iconColor: 'text-green-600',
                text: 'Response rate improved by 2.8% from last campaign.' },
            ].map(({ icon: Icon, color, iconColor, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
