import { useState, useEffect } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import api from '../../api/axios'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  Area, AreaChart, Legend
} from 'recharts'
import { TrendingUp, AlertTriangle, Calendar, Shield } from 'lucide-react'

const STATUS_COLOR = {
  Good: 'text-green-600', Medium: 'text-yellow-600',
  'High Risk': 'text-red-600',
}

const DRIVER_ICONS = {
  Seasonality: '☀️', 'Illness Trend': '🤧', 'Public Holidays': '📅', Events: '🎉',
}

export default function Forecasting() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/forecast').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return (
    <PageLayout title="Demand Forecasting" subtitle="AI powered predictions to stay ahead of shortages">
      <div className="flex items-center justify-center h-64 text-gray-400">Loading forecast data…</div>
    </PageLayout>
  )

  return (
    <PageLayout title="Demand Forecasting" subtitle="AI powered predictions to stay ahead of shortages">
      {/* Filters */}
      <div className="flex justify-end gap-2 mb-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
          <span>🩸</span> All Blood Types <span className="text-gray-400">▾</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
          <Calendar className="w-3.5 h-3.5 text-gray-500" /> May 14 - May 17, 2026 <span className="text-gray-400">▾</span>
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-500">Predicted Peak Demand</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.predictedPeakDemand?.toLocaleString()} <span className="text-sm font-normal text-gray-500">units</span></div>
          <div className="text-xs text-primary font-medium mt-1">{data.peakDate}</div>
        </div>
        <div className="card p-4 bg-orange-50 border-orange-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">High Risk Period</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{data.highRiskPeriod}</div>
          <div className="text-xs text-gray-500 mt-1">{data.highRiskDays} days</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">📉</span>
            <span className="text-xs text-gray-500">Expected Shortfall</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.expectedShortfall} <span className="text-sm font-normal text-gray-500">units</span></div>
          <div className="text-xs text-gray-400 mt-1">No action needed</div>
        </div>
        <div className="card p-4 bg-purple-50 border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Forecast accuracy</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.forecastAccuracy}%</div>
          <div className="text-xs text-green-600 font-medium mt-1">High Confidence</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main forecast chart */}
        <div className="card p-4 col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Overall Blood Demand Forecast</h3>
            <span className="text-gray-400 text-xs">ⓘ</span>
          </div>
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-primary inline-block" />Actual</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-primary border-dashed inline-block" />Forecast</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t border-gray-400 inline-block" />Upper Bound</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t border-gray-400 inline-block" />Lower Bound</span>
            <span className="flex items-center gap-1"><span className="w-4 h-3 bg-red-100 inline-block rounded" />Risk Threshold</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FEE2E2" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#FEE2E2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <ReferenceLine y={1200} stroke="#EF4444" strokeDasharray="4 2" strokeWidth={1.5} />
              <Area type="monotone" dataKey="upper" stroke="#D1D5DB" strokeWidth={1} fill="url(#riskGrad)" dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#C41230" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="forecast" stroke="#C41230" strokeWidth={2} strokeDasharray="6 3" dot={false} />
              <Line type="monotone" dataKey="lower" stroke="#D1D5DB" strokeWidth={1} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-1.5 mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            <span>◇</span> Demand expected to exceed supply on May 22–May 25
          </div>
        </div>

        {/* Forecast by blood type */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Forecast By Blood Type <span className="text-gray-400 font-normal text-xs">(Next 7 Days)</span></h3>
            <button className="text-xs text-primary font-medium">View All</button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">Blood Type</th>
                <th className="text-right pb-2 font-medium">Current Supply</th>
                <th className="text-right pb-2 font-medium">Supply %</th>
                <th className="text-right pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.byBloodType?.map(row => (
                <tr key={row.bloodType} className="border-b border-gray-50">
                  <td className="py-2 font-semibold">{row.bloodType}</td>
                  <td className="py-2 text-right text-gray-600">{row.currentSupply}</td>
                  <td className="py-2 text-right text-gray-600">{row.supplyPct}%</td>
                  <td className={`py-2 text-right font-semibold ${STATUS_COLOR[row.status] ?? 'text-gray-600'}`}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Demand Drivers */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Demand Drivers</h3>
            <button className="text-xs text-primary font-medium">View All</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {data.demandDrivers?.map(d => (
              <div key={d.name} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{DRIVER_ICONS[d.name] ?? '📊'}</div>
                <div className="text-xs font-semibold text-gray-800">{d.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{d.description}</div>
                <div className="text-sm font-bold text-primary mt-1">↑ {d.change}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Early Warning */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">AI Early Warning</h3>
            <button className="text-xs text-primary font-medium">View All</button>
          </div>
          {data.earlyWarning && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-red-700">{data.earlyWarning.message}</div>
                <div className="text-xs text-gray-600 mt-1">Confidence: {data.earlyWarning.confidence}%</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  <span className="font-medium">Recommended action: </span>
                  {data.earlyWarning.recommendation}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
