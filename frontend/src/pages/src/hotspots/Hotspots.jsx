import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../../components/layout/PageLayout'
import { Calendar, ChevronDown } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { peopleOutline, locationOutline, statsChartOutline, mapOutline, pinOutline } from 'ionicons/icons'
import DateRangePicker, { formatDateRange } from '../../../components/common/DateRangePicker'

const MOCK_DATA = {
  mostActiveAgeGroup: '31-50 Years Old',
  mostActiveAgeGroupPct: 52,
  activeHotspots: 20,
  highestDonorZone: 'Central (Outram)',
  highestDonorZoneCount: 1726,
  insights: [
    { name: 'Ang Mo Kio Hotspot', potentialDonors: 627, ageGroup: '31-50 Years Old', recommendation: 'Deploy community donation drive at Ang Mo Kio Community Club' },
    { name: 'Youth Bedok Cluster', potentialDonors: 283, ageGroup: '16-30 Years Old', recommendation: 'Partner with nearby institutions' },
  ],
  communityDrives: [
    { name: 'Community Drive @ Boon Lay MRT...', donors: 3948, lastDrive: '11-12 November 2025' },
    { name: 'Community Drive @ Yew Tee CC', donors: 3456, lastDrive: '19-20 November 2025' },
    { name: 'Community Drive @ Ang Mo Kio CC', donors: 2876, lastDrive: '28-29 November 2025' },
    { name: 'Community Drive @ Serangoon CC', donors: 2545, lastDrive: '1-2 December 2025' },
    { name: 'Community Drive @ Tampines M...', donors: 2344, lastDrive: '5-6 December 2025' },
  ],
}

export default function Hotspots() {
  const navigate = useNavigate()
  const [openDropdown, setOpenDropdown] = useState(null)
  const [dateStart, setDateStart] = useState(new Date(2026, 1, 18))
  const [dateEnd, setDateEnd] = useState(new Date(2026, 4, 17))

  const dateActions = (
    <div className="relative">
      <button
        onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-white shadow-sm"
      >
        <Calendar className="w-3.5 h-3.5 text-gray-500" />
        {formatDateRange(dateStart, dateEnd)}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'date' ? 'rotate-180' : ''}`} />
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
  )

  return (
    <PageLayout title="Hotspots" subtitle="Monitor blood donation hotspots to plan donation drives more efficiently" actions={dateActions}>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center"><IonIcon icon={peopleOutline} style={{ fontSize: '1.5rem', color: '#f97316' }} /></div>
          <div>
            <div className="text-xs text-gray-500">Most Active Age Group</div>
            <div className="text-2xl font-bold text-primary">{MOCK_DATA.mostActiveAgeGroup}</div>
            <div className="text-xs text-gray-400">{MOCK_DATA.mostActiveAgeGroupPct}% of all donors</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><IonIcon icon={locationOutline} style={{ fontSize: '1.5rem', color: '#a855f7' }} /></div>
          <div>
            <div className="text-xs text-gray-500">Active Hotspots</div>
            <div className="text-2xl font-bold text-primary">{MOCK_DATA.activeHotspots} areas</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"><IonIcon icon={statsChartOutline} style={{ fontSize: '1.5rem', color: '#ef4444' }} /></div>
          <div>
            <div className="text-xs text-gray-500">Highest Donor Zone</div>
            <div className="text-2xl font-bold text-primary">{MOCK_DATA.highestDonorZone}</div>
            <div className="text-xs text-gray-400">{MOCK_DATA.highestDonorZoneCount} active donors</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Map */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-800">Hotspot Map</h3>
            <button onClick={() => navigate('/src/hotspots/map')} className="text-xs text-primary font-medium">View Detailed Map</button>
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
            <button onClick={() => navigate('/src/hotspots/insights')} className="text-xs text-primary font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {MOCK_DATA.insights.map((ins, i) => (
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
        </div>
      </div>

      {/* Community drives table */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-800">Top Performing Community Drives <span className="text-gray-400 font-normal text-xs">(3 Months Ago)</span></h3>
          <button onClick={() => navigate('/src/hotspots/bloodbank-performance')} className="text-xs text-primary font-medium">View All</button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="text-left pb-1.5 font-medium">Community Drive</th>
              <th className="text-right pb-1.5 font-medium">No. of Donors</th>
              <th className="text-right pb-1.5 font-medium">Last Community Drive</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.communityDrives.map((d, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-1.5 text-gray-700">{d.name}</td>
                <td className="py-1.5 text-right font-semibold text-gray-800">{d.donors.toLocaleString()}</td>
                <td className="py-1.5 text-right text-gray-500">{d.lastDrive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  )
}
