import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../../components/layout/PageLayout'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart,
} from 'recharts'
import { ChevronDown, Calendar } from 'lucide-react'

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

const CHART_DATA = {
  'O-': [
    { date: 'May 14', actual: 120 }, { date: 'May 15', actual: 110 },
    { date: 'May 16', actual: 100 }, { date: 'May 17', actual: 130 },
    { date: 'May 18', actual: 160 }, { date: 'May 19', actual: 170 },
    { date: 'May 20', actual: 155 }, { date: 'May 21', forecast: 140, upper: 175, lower: 105 },
    { date: 'May 22', forecast: 120, upper: 160, lower: 80 },
    { date: 'May 23', forecast: 90, upper: 130, lower: 50 },
    { date: 'May 24', forecast: 70, upper: 110, lower: 30 },
    { date: 'May 25', forecast: 55, upper: 90, lower: 20 },
    { date: 'May 26', forecast: 45, upper: 80, lower: 10 },
    { date: 'May 27', forecast: 35, upper: 70, lower: 5 },
  ],
}

const DEFAULT_DATA = CHART_DATA['O-'].map(d => ({ ...d }))

const CRITICAL_TYPES = [
  { type: 'O-',  label: 'Very High Risk', color: '#C20000', barColor: '#C20000', pct: 95 },
  { type: 'A+',  label: 'High Risk',      color: '#E8760A', barColor: '#E8760A', pct: 78 },
  { type: 'B-',  label: 'Medium',         color: '#FEAE25', barColor: '#FEAE25', pct: 50 },
  { type: 'A+',  label: 'Low',            color: '#63A363', barColor: '#63A363', pct: 30 },
]

const INVENTORY = [
  { type: 'O+',  supply: 620, pct: 87,  status: 'Good',      statusColor: 'text-green-600' },
  { type: 'A+',  supply: 410, pct: 70,  status: 'Good',      statusColor: 'text-green-600' },
  { type: 'B+',  supply: 210, pct: 62,  status: 'Medium',    statusColor: 'text-yellow-600' },
  { type: 'AB+', supply: 210, pct: 62,  status: 'Medium',    statusColor: 'text-yellow-600' },
  { type: 'O-',  supply: 90,  pct: 20,  status: 'High Risk', statusColor: 'text-red-600' },
  { type: 'A-',  supply: 90,  pct: 20,  status: 'High Risk', statusColor: 'text-red-600' },
  { type: 'B-',  supply: 90,  pct: 20,  status: 'High Risk', statusColor: 'text-red-600' },
  { type: 'AB-', supply: 90,  pct: 50,  status: 'Medium',    statusColor: 'text-yellow-600' },
]

const HOSPITAL_DEMAND = [
  { type: 'O+',  demand: 620, surplus: -150, risk: 'Good',      riskColor: 'text-green-600' },
  { type: 'A+',  demand: 410, surplus: -40,  risk: 'Good',      riskColor: 'text-green-600' },
  { type: 'B+',  demand: 210, surplus: 20,   risk: 'Medium',    riskColor: 'text-yellow-600' },
  { type: 'AB+', demand: 210, surplus: 10,   risk: 'Medium',    riskColor: 'text-yellow-600' },
  { type: 'B-',  demand: 90,  surplus: -70,  risk: 'High Risk', riskColor: 'text-red-600' },
  { type: 'AB-', demand: 90,  surplus: -10,  risk: 'Medium',    riskColor: 'text-yellow-600' },
]

export default function BloodTypeAnalytics() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState('O-')
  const [viewMode, setViewMode] = useState('units') // 'units' | 'percentage'

  const chartData = CHART_DATA[selectedType] ?? DEFAULT_DATA

  return (
    <PageLayout
      title="Blood Type Analytics"
      subtitle="Detailed insights by blood group"
      breadcrumb={['Forecasting', 'Blood Type Analytics']}
    >
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Select Blood Type</label>
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm cursor-pointer min-w-32">
            <span className="text-primary">🩸</span>
            <span className="font-medium">{selectedType}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hospital</label>
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm cursor-pointer min-w-36">
            <span>All hospitals</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Time Range</label>
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm cursor-pointer">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>May 14 - May 17, 2026</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
          </div>
        </div>
      </div>

      {/* Blood type pill selector */}
      <div className="flex gap-2 mb-5">
        {BLOOD_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              selectedType === t
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Forecast chart */}
        <div className="card p-4 col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Forecast Trend for {selectedType} Blood</h3>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              <button
                onClick={() => setViewMode('units')}
                className={`px-3 py-1.5 ${viewMode === 'units' ? 'bg-primary-100 text-primary font-semibold' : 'bg-white text-gray-500'}`}
              >Units</button>
              <button
                onClick={() => setViewMode('percentage')}
                className={`px-3 py-1.5 ${viewMode === 'percentage' ? 'bg-primary-100 text-primary font-semibold' : 'bg-white text-gray-500'}`}
              >Percentage</button>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-primary inline-block" />Actual</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-primary border-dashed inline-block" />Forecast</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t border-gray-400 inline-block" />Upper Bound</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t border-gray-400 inline-block" />Lower Bound</span>
            <span className="flex items-center gap-1"><span className="w-4 h-3 bg-red-100 inline-block rounded" />Risk Threshold</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FEE2E2" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#FEE2E2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="4 2" strokeWidth={1.5} />
              <Area type="monotone" dataKey="upper" stroke="#D1D5DB" strokeWidth={1} fill="url(#riskFill)" dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#C20000" strokeWidth={2} dot={{ r: 3, fill: '#C20000' }} />
              <Line type="monotone" dataKey="forecast" stroke="#C20000" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#C20000' }} />
              <Line type="monotone" dataKey="lower" stroke="#D1D5DB" strokeWidth={1} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-2 mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            <span className="text-red-500">◇</span>
            Supply is expected to fall below the risk threshold on May 23
          </div>
        </div>

        {/* Critical blood types */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-gray-800 mb-4">Critical Blood Types</h3>
          <div className="space-y-4">
            {CRITICAL_TYPES.map((ct, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">🩸</span>
                  <div>
                    <div className="text-base font-bold text-gray-900">{ct.type}</div>
                    <div className="text-xs font-semibold" style={{ color: ct.color }}>{ct.label}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${ct.pct}%`, background: ct.barColor }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-2 gap-4">
        {/* Inventory status */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Inventory Status By Blood Type</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">Blood Type</th>
                <th className="text-right pb-2 font-medium">Current Supply (Units)</th>
                <th className="text-right pb-2 font-medium">Supply %</th>
                <th className="text-right pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map(row => (
                <tr key={row.type} className="border-b border-gray-50">
                  <td className="py-2 font-semibold">{row.type}</td>
                  <td className="py-2 text-right text-gray-600">{row.supply}</td>
                  <td className="py-2 text-right text-gray-600">{row.pct}%</td>
                  <td className={`py-2 text-right font-semibold ${row.statusColor}`}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hospital demand */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Hospital Demand for {selectedType} Blood</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">Hospital</th>
                <th className="text-right pb-2 font-medium">Forecasted Demand (Units)</th>
                <th className="text-right pb-2 font-medium">Surplus/Deficit</th>
                <th className="text-right pb-2 font-medium">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {HOSPITAL_DEMAND.map((row, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 font-semibold">{row.type}</td>
                  <td className="py-2 text-right text-gray-600">{row.demand}</td>
                  <td className={`py-2 text-right font-semibold ${row.surplus < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {row.surplus > 0 ? '+' : ''}{row.surplus}
                  </td>
                  <td className={`py-2 text-right font-semibold ${row.riskColor}`}>{row.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  )
}
