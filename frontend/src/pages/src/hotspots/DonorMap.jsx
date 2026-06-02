import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import PageLayout from '../../../components/layout/PageLayout'

const BLOODBANKS = [
  { name: 'Bloodbank @ Westgate', pos: [1.3347, 103.7426] },
  { name: 'Bloodbank @ Dhoby Ghaut', pos: [1.2993, 103.8458] },
  { name: 'Bloodbank @ HSA', pos: [1.2943, 103.8351] },
  { name: 'Bloodbank @ Woodlands', pos: [1.4382, 103.7891] },
  { name: 'Bloodbank @ Punggol', pos: [1.4043, 103.9022] },
]

const COMMUNITY_DRIVES = [
  { name: 'Community Drive @ Boon Lay CC', pos: [1.3387, 103.7059] },
  { name: 'Community Drive @ Kranji CC', pos: [1.4254, 103.7631] },
  { name: 'Community Drive @ Commonwealth CC', pos: [1.3064, 103.7978] },
  { name: 'Community Drive @ Toa Payoh CC', pos: [1.3343, 103.8496] },
  { name: 'Community Drive @ Marine Parade CC', pos: [1.3038, 103.9062] },
]

const HEATSPOTS = [
  { pos: [1.4382, 103.7891], color: '#EF4444', radius: 900, label: 'Woodlands — High' },
  { pos: [1.4043, 103.9022], color: '#EF4444', radius: 800, label: 'Punggol — High' },
  { pos: [1.2993, 103.8458], color: '#EF4444', radius: 950, label: 'Central — High' },
  { pos: [1.2760, 103.8219], color: '#EF4444', radius: 850, label: 'Bukit Merah — High' },
  { pos: [1.3333, 103.7420], color: '#EF4444', radius: 750, label: 'Jurong East — High' },
  { pos: [1.3540, 103.9440], color: '#F59E0B', radius: 650, label: 'Tampines — Medium' },
  { pos: [1.4290, 103.8350], color: '#F59E0B', radius: 600, label: 'Yishun — Medium' },
  { pos: [1.3390, 103.7060], color: '#F59E0B', radius: 580, label: 'Boon Lay — Medium' },
  { pos: [1.3840, 103.7470], color: '#22C55E', radius: 500, label: 'Choa Chu Kang — Low' },
  { pos: [1.3343, 103.8496], color: '#22C55E', radius: 450, label: 'Toa Payoh — Low' },
  { pos: [1.3038, 103.9062], color: '#F59E0B', radius: 520, label: 'Marine Parade — Medium' },
]

const SG_CENTER = [1.3521, 103.8198]

export default function DonorMap() {
  return (
    <PageLayout
      title="Donor Hotspot Map"
      subtitle="Monitor blood donation hotspots to plan donation drives more efficiently"
      breadcrumb={['Hotspots', 'Donor Hotspot Map']}
    >
      {/* Bloodbank pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {BLOODBANKS.map(b => (
          <div key={b.name} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {b.name}
          </div>
        ))}
      </div>

      {/* Leaflet Map */}
      <div className="card p-2 mb-4">
        <div className="rounded-xl overflow-hidden" style={{ height: 480 }}>
          <MapContainer center={SG_CENTER} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Heatspot density blobs */}
            {HEATSPOTS.map((h, i) => (
              <Circle
                key={i}
                center={h.pos}
                radius={h.radius}
                pathOptions={{ color: 'transparent', fillColor: h.color, fillOpacity: 0.35 }}
              >
                <Tooltip sticky>{h.label}</Tooltip>
              </Circle>
            ))}

            {/* Bloodbank markers — red */}
            {BLOODBANKS.map(b => (
              <CircleMarker
                key={b.name}
                center={b.pos}
                radius={9}
                pathOptions={{ color: '#991B1B', fillColor: '#EF4444', fillOpacity: 1, weight: 2 }}
              >
                <Popup><strong>{b.name}</strong></Popup>
              </CircleMarker>
            ))}

            {/* Community drive markers — green */}
            {COMMUNITY_DRIVES.map(c => (
              <CircleMarker
                key={c.name}
                center={c.pos}
                radius={8}
                pathOptions={{ color: '#15803D', fillColor: '#22C55E', fillOpacity: 1, weight: 2 }}
              >
                <Popup><strong>{c.name}</strong></Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="card px-4 py-3 mb-4">
        <div className="flex items-center gap-8 text-xs flex-wrap">
          <div>
            <div className="font-semibold text-gray-700 mb-1.5">Donor Density</div>
            <div className="flex gap-4">
              {[['Low', '#22C55E'], ['Medium', '#F59E0B'], ['High', '#EF4444']].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block opacity-60" style={{ background: c }} />
                  <span className="text-gray-600">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <div className="font-semibold text-gray-700 mb-1.5">Locations</div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block bg-red-500" />
                <span className="text-gray-600">Bloodbank (Collection Centre)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block bg-green-500" />
                <span className="text-gray-600">Community Blood Drives</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community drive pills */}
      <div className="flex flex-wrap gap-2">
        {COMMUNITY_DRIVES.map(c => (
          <div key={c.name} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {c.name}
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
