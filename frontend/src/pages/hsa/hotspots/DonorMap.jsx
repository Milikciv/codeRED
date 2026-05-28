import PageLayout from '../../../components/layout/PageLayout'

const BLOODBANKS = [
  { name: 'Bloodbank @ Westgate', x: 22, y: 55 },
  { name: 'Bloodbank @ Dhoby Ghaut', x: 48, y: 52 },
  { name: 'Bloodbank @ HSA', x: 50, y: 58 },
  { name: 'Bloodbank @ Woodlands', x: 42, y: 12 },
  { name: 'Bloodbank @ Punggol', x: 72, y: 20 },
]

const COMMUNITY_DRIVES = [
  { name: 'Community Drive @ Boon Lay CC', x: 18, y: 52 },
  { name: 'Community Drive @ Kranji CC', x: 30, y: 20 },
  { name: 'Community Drive @ Commonwealth CC', x: 38, y: 55 },
  { name: 'Community Drive @ Toa Payoh CC', x: 52, y: 35 },
  { name: 'Community Drive @ Marine Parade CC', x: 68, y: 62 },
]

const HEATSPOTS = [
  { x: 42, y: 18, color: '#EF4444', size: 60 },   // Woodlands — high
  { x: 72, y: 22, color: '#EF4444', size: 55 },   // Punggol — high
  { x: 68, y: 48, color: '#F59E0B', size: 50 },   // Tampines — medium
  { x: 48, y: 52, color: '#EF4444', size: 65 },   // Central — high
  { x: 22, y: 52, color: '#F59E0B', size: 45 },   // Boon Lay — medium
  { x: 35, y: 58, color: '#EF4444', size: 58 },   // Bukit Merah — high
  { x: 52, y: 65, color: '#F59E0B', size: 40 },   // Marine Parade
  { x: 30, y: 42, color: '#22C55E', size: 35 },   // Choa Chu Kang — low
  { x: 55, y: 38, color: '#22C55E', size: 30 },   // Toa Payoh — low
  { x: 42, y: 45, color: '#EF4444', size: 50 },   // Jurong East — high
  { x: 62, y: 28, color: '#F59E0B', size: 38 },   // Yishun — medium
]

const DISTRICT_LABELS = [
  { name: 'Woodlands', x: 40, y: 10 },
  { name: 'Yishun', x: 60, y: 16 },
  { name: 'Kranji', x: 28, y: 22 },
  { name: 'Punggol', x: 72, y: 14 },
  { name: 'Choa Chu Kang', x: 22, y: 38 },
  { name: 'Bishan', x: 48, y: 32 },
  { name: 'Toa Payoh', x: 58, y: 34 },
  { name: 'Tampines', x: 74, y: 44 },
  { name: 'Boon Lay', x: 14, y: 50 },
  { name: 'Jurong East', x: 32, y: 52 },
  { name: 'Orchard', x: 48, y: 50 },
  { name: 'Marine Parade', x: 66, y: 60 },
  { name: 'Bukit Merah', x: 38, y: 64 },
]

export default function DonorMap() {
  return (
    <PageLayout
      title="Donor Hotspot Map"
      subtitle="Monitor blood donation hotspots to plan donation drives more efficiently"
      breadcrumb={['Hotspots', 'Donor Hotspot Map']}
    >
      {/* Bloodbank pills — top */}
      <div className="flex flex-wrap gap-2 mb-4">
        {BLOODBANKS.map(b => (
          <div key={b.name} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <span className="text-red-500">📍</span> {b.name}
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="card p-2 mb-4">
        <div className="relative bg-gradient-to-br from-sky-50 to-green-50 rounded-xl overflow-hidden" style={{ height: 480 }}>
          {/* Singapore outline (simplified SVG) */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20">
            <path
              d="M15,40 Q18,25 30,18 Q40,12 55,14 Q70,16 78,24 Q85,32 82,48 Q80,58 72,65 Q62,72 50,70 Q35,70 25,62 Q15,55 15,40 Z"
              fill="#93C5FD" stroke="#60A5FA" strokeWidth="0.5"
            />
          </svg>

          {/* Heatmap blobs */}
          {HEATSPOTS.map((h, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-2xl opacity-50"
              style={{
                left: `${h.x}%`, top: `${h.y}%`,
                width: h.size, height: h.size,
                background: h.color,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* District labels */}
          {DISTRICT_LABELS.map(d => (
            <div
              key={d.name}
              className="absolute text-gray-600 font-medium"
              style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: 9, transform: 'translate(-50%,-50%)' }}
            >
              {d.name}
            </div>
          ))}

          {/* Bloodbank pins */}
          {BLOODBANKS.map(b => (
            <div
              key={b.name}
              className="absolute flex flex-col items-center"
              style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%,-100%)' }}
            >
              <span className="text-lg drop-shadow">🔴</span>
            </div>
          ))}

          {/* Community Drive pins */}
          {COMMUNITY_DRIVES.map(c => (
            <div
              key={c.name}
              className="absolute flex flex-col items-center"
              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-100%)' }}
            >
              <span className="text-lg drop-shadow">🟢</span>
            </div>
          ))}

          {/* Density legend */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2.5 shadow text-xs">
            <div className="font-semibold text-gray-700 mb-1.5">Density</div>
            {[['Low', '#22C55E'], ['Medium', '#F59E0B'], ['High', '#EF4444']].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c }} />
                <span className="text-gray-600">{l}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <div className="font-semibold text-gray-700 mb-1">Legend</div>
              <div className="flex items-center gap-1 mb-0.5"><span>🔴</span><span className="text-gray-600">Bloodbank (Collection Centre)</span></div>
              <div className="flex items-center gap-1"><span>🟢</span><span className="text-gray-600">Community Blood Drives</span></div>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1">
            <button className="w-7 h-7 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow">+</button>
            <button className="w-7 h-7 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow">−</button>
          </div>
        </div>
      </div>

      {/* Community Drive pills — bottom */}
      <div className="flex flex-wrap gap-2">
        {COMMUNITY_DRIVES.map(c => (
          <div key={c.name} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <span className="text-green-500">📍</span> {c.name}
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
