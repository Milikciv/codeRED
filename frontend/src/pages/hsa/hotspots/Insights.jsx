import { useState } from 'react'
import PageLayout from '../../../components/layout/PageLayout'
import ConfirmModal from '../../../components/common/ConfirmModal'
import Toast from '../../../components/common/Toast'
import { X, MapPin, Calendar } from 'lucide-react'

const INITIAL_INSIGHTS = [
  {
    id: 1,
    potential: 'High Potential',
    potentialColor: 'bg-red-100 text-red-700 border-red-200',
    cardBg: 'bg-red-50 border-red-200',
    heatColor: '#EF4444',
    name: 'Ang Mo Kio Hotspot',
    region: 'North-East Region',
    regionColor: 'text-red-500',
    description: 'High concentration of active donors with strong engagement in the 3 months',
    trendPct: 40,
    trendDir: '↑',
    potentialDonors: 627,
    ageGroup: '31-50 Years Old',
    ageColor: 'text-red-600',
    donorPct: 63,
    recommendation: 'Deploy community donation drive at Ang Mo Kio Community Club',
    recLink: true,
    suggestedWindow: '1 August - 2 August 2026 (Weekend)',
    windowBg: 'bg-red-50 border-red-100',
  },
  {
    id: 2,
    potential: 'Medium Potential',
    potentialColor: 'bg-orange-100 text-orange-700 border-orange-200',
    cardBg: 'bg-orange-50 border-orange-200',
    heatColor: '#F59E0B',
    name: 'Youth Bedok Cluster',
    region: 'East Region',
    regionColor: 'text-orange-500',
    description: 'Strong presence of students and young professional in the area',
    trendPct: 32,
    trendDir: '↑',
    potentialDonors: 283,
    ageGroup: '16-30 Years Old',
    ageColor: 'text-orange-600',
    donorPct: 63,
    recommendation: 'Collaborate with schools in the area such as ITE College East, Temasek Junior College etc.',
    recLink: true,
    suggestedWindow: '1 August - 2 August 2026 (Weekend)',
    windowBg: 'bg-orange-50 border-orange-100',
  },
  {
    id: 3,
    potential: 'Emerging Potential',
    potentialColor: 'bg-green-100 text-green-700 border-green-200',
    cardBg: 'bg-green-50 border-green-200',
    heatColor: '#22C55E',
    name: 'Growing Jurong Cluster',
    region: 'West Region',
    regionColor: 'text-green-600',
    description: 'Strong presence of students and young professional in the area',
    trendPct: 32,
    trendDir: '↑',
    potentialDonors: 283,
    ageGroup: '16-30 Years Old',
    ageColor: 'text-green-600',
    donorPct: 63,
    recommendation: 'Consider mobile donation drives at areas with high human traffic such as MRT Stations',
    recLink: false,
    suggestedWindow: '1 August - 2 August 2026 (Weekend)',
    windowBg: 'bg-green-50 border-green-100',
  },
]

export default function HotspotInsights() {
  const [insights, setInsights] = useState(INITIAL_INSIGHTS)
  const [dismissTarget, setDismissTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const confirmDismiss = () => {
    setInsights(prev => prev.filter(i => i.id !== dismissTarget))
    setDismissTarget(null)
    setToast({ type: 'success', title: 'Success!', message: 'Blood units have been allocated and dispatch notification sent' })
  }

  return (
    <PageLayout
      title="Hotspots Insights and Suggestions"
      subtitle="Monitor blood donation hotspots to plan donation drives more efficiently"
      breadcrumb={['Hotspots', 'Hotspot Insights and Suggestions']}
    >
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {dismissTarget && (
        <ConfirmModal
          icon="warning"
          title="Confirm Dismissal of Recommendation?"
          message="Use this information to work with organisations to better plan blood drives."
          confirmLabel="Confirm"
          confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
          onCancel={() => setDismissTarget(null)}
          onConfirm={confirmDismiss}
        />
      )}

      <div className="space-y-4">
        {insights.map(ins => (
          <div key={ins.id} className={`border rounded-2xl p-5 ${ins.cardBg}`}>
            <div className="flex items-start gap-5">
              {/* Heatmap thumbnail */}
              <div className="w-28 h-24 bg-white/60 rounded-xl flex-shrink-0 overflow-hidden border border-white/80 relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-60">
                  <div className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full blur-lg -translate-x-1/2 -translate-y-1/2" style={{ background: ins.heatColor }} />
                </div>
                <span className="text-xs text-gray-400 relative z-10">🗺️</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ins.potentialColor}`}>
                      {ins.potential}
                    </span>
                  </div>
                  <button onClick={() => setDismissTarget(ins.id)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="font-bold text-gray-900 text-base">{ins.name}</div>
                <div className={`flex items-center gap-1 text-xs font-medium mb-2 ${ins.regionColor}`}>
                  <MapPin className="w-3 h-3" /> {ins.region}
                </div>
                <p className="text-xs text-gray-600 mb-3">{ins.description}<br />
                  <span className="font-medium">{ins.trendPct}% {ins.trendDir} in the last 3 months</span>
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Potential Donors</div>
                    <div className={`text-xl font-black ${ins.ageColor}`}>{ins.potentialDonors}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Age Group</div>
                    <div className={`text-xl font-black ${ins.ageColor}`}>{ins.ageGroup}</div>
                    <div className="text-xs text-gray-400">{ins.donorPct}% of all donors</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3 text-yellow-500" />
                      <span className="font-medium">Recommendation:</span>
                    </div>
                    <div className={`text-xs font-semibold leading-tight ${ins.recLink ? ins.regionColor + ' underline cursor-pointer' : 'text-gray-700'}`}>
                      {ins.recommendation}
                    </div>
                  </div>
                </div>

                {/* Suggested window */}
                <div className={`flex items-center gap-2 text-xs border rounded-lg px-3 py-2 ${ins.windowBg}`}>
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-600">Suggested Window:</span>
                  <span className="font-semibold text-gray-800">{ins.suggestedWindow}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="card p-10 text-center text-gray-400 text-sm">All hotspot recommendations have been dismissed.</div>
        )}
      </div>
    </PageLayout>
  )
}
