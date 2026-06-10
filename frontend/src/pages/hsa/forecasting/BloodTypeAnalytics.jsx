import { useState } from 'react'
import PageLayout from '../../../components/layout/PageLayout'
import { ChevronDown, Calendar, Clock } from 'lucide-react'
import { IonIcon } from '@ionic/react'
import { waterOutline } from 'ionicons/icons'
import DateRangePicker, { formatDateRange } from '../../../components/common/DateRangePicker'

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

const HOSPITAL_DEMAND = [
  { hospital: 'Singapore General Hospital', demand: 620, surplus: -150, risk: 'High Risk', riskColor: 'text-red-600' },
  { hospital: 'National University Hospital', demand: 410, surplus: -40, risk: 'Medium', riskColor: 'text-yellow-600' },
  { hospital: 'Tan Tock Seng Hospital', demand: 210, surplus: 20, risk: 'Good', riskColor: 'text-green-600' },
  { hospital: 'Changi General Hospital', demand: 210, surplus: 10, risk: 'Good', riskColor: 'text-green-600' },
  { hospital: 'Khoo Teck Puat Hospital', demand: 90, surplus: -70, risk: 'High Risk', riskColor: 'text-red-600' },
  { hospital: 'KK Women and Children Hospital', demand: 90, surplus: -10, risk: 'Medium', riskColor: 'text-yellow-600' },
]

const HOSPITAL_OPTIONS = [
  'All hospitals',
  'Singapore General Hospital',
  'National University Hospital',
  'Tan Tock Seng Hospital',
  'Changi General Hospital',
  'Khoo Teck Puat Hospital',
  'KK Women and Children Hospital',
]

export default function BloodTypeAnalytics() {
  const [selectedType, setSelectedType] = useState('O-')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [hospital, setHospital] = useState('All hospitals')
  const [dateStart, setDateStart] = useState(new Date(2026, 4, 14))
  const [dateEnd, setDateEnd] = useState(new Date(2026, 4, 17))
  const [activePreset, setActivePreset] = useState(null)

  const applyPreset = (days) => {
    const end = new Date()
    const start = new Date(); start.setDate(end.getDate() - days)
    setDateStart(start); setDateEnd(end); setActivePreset(days)
  }

  const visibleDemand = hospital === 'All hospitals'
    ? HOSPITAL_DEMAND
    : HOSPITAL_DEMAND.filter(row => row.hospital.includes(hospital))

  const analyticsActions = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'bloodType' ? null : 'bloodType')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-white shadow-sm"
        >
          <IonIcon icon={waterOutline} style={{ fontSize: '0.875rem', color: '#C20000' }} />
          <span className="font-medium">{selectedType}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'bloodType' ? 'rotate-180' : ''}`} />
        </button>
        {openDropdown === 'bloodType' && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-32">
            {BLOOD_TYPES.map(t => (
              <button
                key={t}
                onClick={() => { setSelectedType(t); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${selectedType === t ? 'text-primary font-medium' : 'text-gray-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'hospital' ? null : 'hospital')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-white shadow-sm"
        >
          {hospital}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'hospital' ? 'rotate-180' : ''}`} />
        </button>
        {openDropdown === 'hospital' && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-36">
            {HOSPITAL_OPTIONS.map(h => (
              <button
                key={h}
                onClick={() => { setHospital(h); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${hospital === h ? 'text-primary font-medium' : 'text-gray-700'}`}
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg shadow-sm p-0.5">
        {[14, 30].map(d => (
          <button
            key={d}
            onClick={() => applyPreset(d)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activePreset === d ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-3 h-3" />
            {d}d
          </button>
        ))}
      </div> */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-white shadow-sm"
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
              onChange={(s, e) => { setDateStart(s); setDateEnd(e); setActivePreset(null) }}
              onClose={() => setOpenDropdown(null)}
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <PageLayout
      title="Blood Type Analytics"
      subtitle="Detailed insights by blood group"
      breadcrumb={['Forecasting', 'Blood Type Analytics']}
      actions={analyticsActions}
    >
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
            {visibleDemand.map(row => (
              <tr key={row.hospital} className="border-b border-gray-50">
                <td className="py-2 font-semibold">{row.hospital}</td>
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
    </PageLayout>
  )
}
