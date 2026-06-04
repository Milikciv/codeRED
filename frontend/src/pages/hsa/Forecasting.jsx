import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import PageError from '../../components/common/PageError'
import api from '../../api/axios'
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area,
} from 'recharts'
import { TrendingUp, AlertTriangle, Shield, ChevronDown, Clock } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { sunnyOutline, bandageOutline, calendarOutline, giftOutline, statsChartOutline, waterOutline, trendingDownOutline, informationCircleOutline } from 'ionicons/icons'
import LoadingScreen from '../../components/common/LoadingScreen'

const STATUS_COLOR = {
  Good: 'text-green-600', Medium: 'text-yellow-600',
  'High Risk': 'text-red-600',
}

const DRIVER_ICONS = {
  Seasonality: sunnyOutline, 'Illness Trend': bandageOutline, 'Public Holidays': calendarOutline, Events: giftOutline,
}

function ForecastingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-end gap-2">
        <div className="h-9 w-32 bg-red-100 rounded-lg" />
        <div className="h-9 w-44 bg-red-100 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="h-3 bg-red-100 rounded w-3/4" />
            <div className="h-7 bg-red-100 rounded w-1/2" />
            <div className="h-3 bg-red-50 rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-4">
          <div className="h-4 bg-red-100 rounded w-52 mb-4" />
          <div className="h-56 bg-red-50 rounded-lg" />
          <div className="h-8 bg-red-50 rounded mt-2" />
        </div>
        <div className="card p-4">
          <div className="h-4 bg-red-100 rounded w-40 mb-4" />
          {[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-red-50 rounded mb-1" />)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="h-4 bg-red-100 rounded w-32 mb-3" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-red-50 rounded-xl" />)}
          </div>
        </div>
        <div className="card p-4">
          <div className="h-4 bg-red-100 rounded w-32 mb-3" />
          <div className="h-20 bg-red-50 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

const BLOOD_TYPE_OPTIONS = ['All Blood Types', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export default function Forecasting() {
  const navigate = useNavigate()
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [bloodType, setBloodType]       = useState('All Blood Types')
  const [historyDays, setHistoryDays]   = useState(14)

  const fetchData = () => {
    setError(false)
    setLoading(true)
    const params = {
      ...(bloodType !== 'All Blood Types' && { bloodType }),
      historyDays,
    }
    api.get('/forecast', { params })
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [bloodType, historyDays])

  const forecastingActions = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'bloodType' ? null : 'bloodType')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-white shadow-sm"
        >
          <IonIcon icon={waterOutline} style={{ fontSize: '0.875rem', color: '#C20000' }} />
          {bloodType}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'bloodType' ? 'rotate-180' : ''}`} />
        </button>
        {openDropdown === 'bloodType' && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-36">
            {BLOOD_TYPE_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => { setBloodType(t); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${bloodType === t ? 'text-primary font-medium' : 'text-gray-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm p-0.5">
        {[14, 30].map(d => (
          <button
            key={d}
            onClick={() => setHistoryDays(d)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
              historyDays === d
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-3 h-3" />
            {d}d
          </button>
        ))}
      </div>
    </div>
  )

  if (loading) return (
    <PageLayout title="Demand Forecasting" subtitle="AI powered predictions to stay ahead of shortages">
      <LoadingScreen variant="forecasting" />
    </PageLayout>
  )

  if (error) return (
    <PageLayout title="Demand Forecasting" subtitle="AI powered predictions to stay ahead of shortages">
      <PageError onRetry={fetchData} />
    </PageLayout>
  )

  return (
    <PageLayout title="Demand Forecasting" subtitle="AI powered predictions to stay ahead of shortages" actions={forecastingActions}>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="card p-4 flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500 font-medium">Predicted Peak Demand</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{data.predictedPeakDemand?.toLocaleString()}</div>
            <div className="text-xs text-primary font-medium mt-0.5">{data.peakDate}</div>
          </div>
        </div>
        <div className="card p-4 flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500 font-medium">High Risk Period</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{data.highRiskPeriod}</div>
            <div className="text-xs text-gray-400 mt-0.5">{data.highRiskDays} days</div>
          </div>
        </div>
        <div className="card p-4 flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <IonIcon icon={trendingDownOutline} style={{ fontSize: '1.25rem', color: '#6B7280' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500 font-medium">Expected Shortfall</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{data.expectedShortfall}</div>
            <div className="text-xs text-gray-400 mt-0.5">units · no action needed</div>
          </div>
        </div>
        <div className="card p-4 flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-purple-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500 font-medium">Forecast Accuracy</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{data.forecastAccuracy}%</div>
            <div className="text-xs text-green-600 font-medium mt-0.5">High Confidence</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main forecast chart */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-sm text-gray-800">
              {bloodType === 'All Blood Types' ? 'Overall Blood Demand Forecast' : `${bloodType} Blood Demand Forecast`}
            </h3>
            <IonIcon icon={informationCircleOutline} style={{ fontSize: '0.875rem', color: '#9ca3af' }} />
          </div>
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-primary inline-block" />Actual</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-primary border-dashed inline-block" />Forecast</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t border-gray-400 inline-block" />Upper Bound</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t border-gray-400 inline-block" />Lower Bound</span>
            <span className="flex items-center gap-1"><span className="w-4 h-3 bg-red-100 inline-block rounded" />Risk Threshold</span>
          </div>
          {data.chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={data.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FEE2E2" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#FEE2E2" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  formatter={(value, name) => name === 'bandWidth' || name === 'lower' ? [null, null] : [value, name]}
                />
                <ReferenceLine y={data.riskThreshold} stroke="#EF4444" strokeDasharray="4 2" strokeWidth={1.5} />
                {/* Confidence band: transparent base up to lower, pink fill for the width between lower and upper */}
                <Area type="monotone" dataKey="lower" stackId="band" stroke="none" fill="transparent" dot={false} legendType="none" />
                <Area type="monotone" dataKey="bandWidth" stackId="band" stroke="none" fill="url(#bandGrad)" dot={false} legendType="none" />
                {/* Bound marker lines */}
                <Line type="monotone" dataKey="upper" stroke="#D1D5DB" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="lower" stroke="#D1D5DB" strokeWidth={1} dot={false} />
                {/* Main lines — rendered last so they sit on top of the fill */}
                <Line type="monotone" dataKey="actual" stroke="#C20000" strokeWidth={2} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" stroke="#C20000" strokeWidth={2} strokeDasharray="6 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">No chart data available</div>
          )}
          <div className="flex items-center gap-1.5 mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            <span>◇</span> Demand expected to exceed supply on May 22–May 25
          </div>
        </div>

        {/* Forecast by blood type */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Forecast By Blood Type <span className="text-gray-400 font-normal text-xs">(Next 7 Days)</span></h3>
            <button onClick={() => navigate('/hsa/forecasting/blood-type-analytics')} className="text-xs text-primary font-medium">View All</button>
          </div>
          {data.byBloodType?.length > 0 ? (
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
                {data.byBloodType.map(row => (
                  <tr key={row.bloodType} className="border-b border-gray-50">
                    <td className="py-2 font-semibold">{row.bloodType}</td>
                    <td className="py-2 text-right text-gray-600">{row.currentSupply}</td>
                    <td className="py-2 text-right text-gray-600">{row.supplyPct}%</td>
                    <td className={`py-2 text-right font-semibold ${STATUS_COLOR[row.status] ?? 'text-gray-600'}`}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No blood type data available</p>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Demand Drivers */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Demand Drivers</h3>
            <button className="text-xs text-primary font-medium">View All</button>
          </div>
          {data.demandDrivers?.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {data.demandDrivers.map(d => (
                <div key={d.name} className="bg-gray-50 rounded-xl p-3 text-center">
                  <IonIcon icon={DRIVER_ICONS[d.name] ?? statsChartOutline} style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }} />
                  <div className="text-xs font-semibold text-gray-800">{d.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{d.description}</div>
                  <div className="text-sm font-bold text-primary mt-1">↑ {d.change}%</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No demand drivers available</p>
          )}
        </div>

        {/* AI Early Warning */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">AI Early Warning</h3>
            <button onClick={() => navigate('/hsa/alerts')} className="text-xs text-primary font-medium">View All</button>
          </div>
          {data.earlyWarning ? (
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
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <p className="text-sm text-gray-400">No early warnings at this time</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
