import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import PageError from '../../components/common/PageError'
import api from '../../api/axios'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Calendar } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { peopleOutline, locationOutline, statsChartOutline, mapOutline, pinOutline } from 'ionicons/icons'
import DateRangePicker, { formatDateRange } from '../../components/common/DateRangePicker'
import LoadingScreen from '../../components/common/LoadingScreen'


const LOCATION_OPTIONS = ['Bloodbank @ HSA', 'SGH', 'NUH', 'KKH', 'CGH', 'TTSH', 'NGH']

export default function Hotspots() {
  const navigate = useNavigate()
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [dateStart, setDateStart]     = useState(new Date(2026, 1, 18))
  const [dateEnd, setDateEnd]         = useState(new Date(2026, 4, 17))
  const [location, setLocation]       = useState('Bloodbank @ HSA')

  const fetchData = () => {
    setError(false)
    setLoading(true)
    api.get('/hotspots')
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return (
    <PageLayout title="Hotspots" subtitle="Monitor blood donation hotspots to plan donation drives more efficiently">
      <LoadingScreen variant="general" />
    </PageLayout>
  )

  if (error) return (
    <PageLayout title="Hotspots" subtitle="Monitor blood donation hotspots to plan donation drives more efficiently">
      <PageError onRetry={fetchData} />
    </PageLayout>
  )

  return (
    <PageLayout title="Hotspots" subtitle="Monitor blood donation hotspots to plan donation drives more efficiently">
      {/* Date filter */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            {formatDateRange(dateStart, dateEnd)}
            <span className="text-gray-400">▾</span>
          </button>
          {openDropdown === 'date' && (
            <div className="absolute right-0 top-full mt-1 z-20">
              <DateRangePicker
                start={dateStart}
                end={dateEnd}
                onChange={(s, e) => { setDateStart(s); setDateEnd(e) }}
                onClose={() => setOpenDropdown(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center"><IonIcon icon={peopleOutline} style={{ fontSize: '1.5rem', color: '#f97316' }} /></div>
          <div>
            <div className="text-xs text-gray-500">Most Active Age Group</div>
            <div className="text-2xl font-bold text-primary">{data.mostActiveAgeGroup}</div>
            <div className="text-xs text-gray-400">{data.mostActiveAgeGroupPct}% of all donors</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><IonIcon icon={locationOutline} style={{ fontSize: '1.5rem', color: '#a855f7' }} /></div>
          <div>
            <div className="text-xs text-gray-500">Active Hotspots</div>
            <div className="text-2xl font-bold text-primary">{data.activeHotspots} areas</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"><IonIcon icon={statsChartOutline} style={{ fontSize: '1.5rem', color: '#ef4444' }} /></div>
          <div>
            <div className="text-xs text-gray-500">Highest Donor Zone</div>
            <div className="text-2xl font-bold text-primary">{data.highestDonorZone}</div>
            <div className="text-xs text-gray-400">{data.highestDonorZoneCount} active donors</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Map */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-800">Hotspot Insights and Suggestions</h3>
            <button onClick={() => navigate('/hsa/hotspots/map')} className="text-xs text-primary font-medium">View Detailed Map</button>
          </div>
          <div className="bg-gray-100 rounded-xl h-56 flex items-center justify-center text-gray-400 text-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[
                { top: '30%', left: '40%', size: 60, color: '#EF4444' },
                { top: '50%', left: '55%', size: 45, color: '#EF4444' },
                { top: '25%', left: '60%', size: 35, color: '#F59E0B' },
                { top: '60%', left: '35%', size: 40, color: '#F59E0B' },
                { top: '40%', left: '25%', size: 30, color: '#22C55E' },
              ].map((b, i) => (
                <div key={i} className="absolute rounded-full blur-xl"
                     style={{ top: b.top, left: b.left, width: b.size, height: b.size, background: b.color, transform: 'translate(-50%,-50%)' }} />
              ))}
            </div>
            <IonIcon icon={mapOutline} style={{ fontSize: '1rem', marginRight: '0.25rem' }} /> Singapore Donor Heatmap
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <div>
              <div className="font-semibold text-gray-700 mb-1">Density</div>
              {[['Low', '#22C55E'], ['Medium', '#F59E0B'], ['High', '#EF4444']].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />{l}</div>
              ))}
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-1">Legend</div>
              <div className="flex items-center gap-1"><IonIcon icon={locationOutline} style={{ fontSize: '1rem' }} /> Bloodbank (Collection Centre)</div>
              <div className="flex items-center gap-1"><IonIcon icon={pinOutline} style={{ fontSize: '1rem' }} /> Community Blood Drives</div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-800">Hotspot Insights and Suggestions</h3>
            <button onClick={() => navigate('/hsa/hotspots/insights')} className="text-xs text-primary font-medium">View All</button>
          </div>
          {data.insights?.length > 0 ? (
            <div className="space-y-3">
              {data.insights.map((ins, i) => (
                <div key={i} className={`rounded-xl p-3 border ${i === 0 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                  <div className={`font-semibold text-sm mb-1 ${i === 0 ? 'text-primary' : 'text-orange-600'}`}>
                    <IonIcon icon={locationOutline} style={{ fontSize: '1rem', marginRight: '0.25rem' }} /> {ins.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                    <div><div className="text-gray-400">Potential Donors</div><div className="font-semibold">{ins.potentialDonors}</div></div>
                    <div><div className="text-gray-400">Age Group</div><div className="font-semibold">{ins.ageGroup}</div></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Recommendation: </span>
                    <span className={i === 0 ? 'text-primary underline cursor-pointer' : ''}>{ins.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <IonIcon icon={locationOutline} style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#9ca3af' }} />
              <p className="text-sm text-gray-500">No hotspot insights available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Age group chart */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-800">Blood Donors by Age Group</h3>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
                className="flex items-center gap-1.5 px-2 py-1 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50"
              >
                {location} ▾
              </button>
              {openDropdown === 'location' && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-36">
                  {LOCATION_OPTIONS.map(l => (
                    <button
                      key={l}
                      onClick={() => { setLocation(l); setOpenDropdown(null) }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${location === l ? 'text-primary font-medium' : 'text-gray-700'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {data.ageGroupData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.ageGroupData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <ReferenceLine y={500} stroke="#EF4444" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="total" stroke="#111827" strokeWidth={2} dot={false} name="Total" />
                <Line type="monotone" dataKey="age16to30" stroke="#14B8A6" strokeWidth={2} dot={false} name="16-30 Years" />
                <Line type="monotone" dataKey="age31to50" stroke="#F59E0B" strokeWidth={2} dot={false} name="31-50 Years" />
                <Line type="monotone" dataKey="above50" stroke="#EF4444" strokeWidth={1.5} dot={false} name="Above 50" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No chart data available</div>
          )}
          <div className="flex gap-3 mt-1 text-xs text-gray-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 border-t-2 border-gray-900 inline-block" />Total</span>
            <span className="flex items-center gap-1"><span className="w-3 border-t-2 border-teal-400 inline-block" />16-30</span>
            <span className="flex items-center gap-1"><span className="w-3 border-t-2 border-yellow-400 inline-block" />31-50</span>
            <span className="flex items-center gap-1"><span className="w-3 border-t-2 border-red-400 inline-block" />50+</span>
          </div>
        </div>

        {/* Community drives table */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Top Performing Community Drives <span className="text-gray-400 font-normal text-xs">(3 Months Ago)</span></h3>
            <button onClick={() => navigate('/hsa/hotspots/bloodbank-performance')} className="text-xs text-primary font-medium">View All</button>
          </div>
          {data.communityDrives?.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="text-left pb-1.5 font-medium">Community Drive</th>
                  <th className="text-right pb-1.5 font-medium">No. of Donors</th>
                  <th className="text-right pb-1.5 font-medium">Last Community Drive</th>
                </tr>
              </thead>
              <tbody>
                {data.communityDrives.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-700">{d.name}</td>
                    <td className="py-1.5 text-right font-semibold text-gray-800">{d.donors.toLocaleString()}</td>
                    <td className="py-1.5 text-right text-gray-500">{d.lastDrive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-sm text-gray-400">No community drives to display</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
