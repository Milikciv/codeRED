import PageLayout from '../../../components/layout/PageLayout'

const COMMUNITY_DRIVES = [
  { name: 'Community Drive @ Boon Lay MRT Station',    donors: 3948, date: '11-12 November 2025' },
  { name: 'Community Drive @ Yew Tee CC',              donors: 3456, date: '19-20 November 2025' },
  { name: 'Community Drive @ Ang Mo Kio CC',           donors: 2876, date: '28-29 November 2025' },
  { name: 'Community Drive @ Serangoon CC',            donors: 2545, date: '1-2 December 2025' },
  { name: 'Community Drive @ Tampines MRT Station',    donors: 2344, date: '5-6 December 2025' },
  { name: 'Community Drive @ Raffles Place MRT Station', donors: 2219, date: '11-12 December 2026' },
  { name: 'Community Drive @ Woodlands CC',            donors: 2157, date: '11-12 January 2026' },
  { name: 'Community Drive @ Marine Parade CC',        donors: 2134, date: '15-16 January 2026' },
  { name: 'Community Drive @ Tiong Bahru MRT Station', donors: 2118, date: '19-20 January 2026' },
  { name: 'Community Drive @ Ghim Moh CC',             donors: 2104, date: '21-23 January 2026' },
  { name: 'Community Drive @ Toa Payoh West CC',       donors: 2056, date: '29-30 January 2026' },
  { name: 'Community Drive @ Sengkang General Hospital', donors: 2037, date: '1-2 February 2026' },
  { name: 'Community Drive @ Jurong Church of Christ', donors: 1948, date: '3-4 February 2026' },
  { name: 'Community Drive @ Buangkok CC',             donors: 1678, date: '7-9 February 2026' },
  { name: 'Community Drive @ CARC',                    donors: 1487, date: '11-12 February 2026' },
  { name: 'Community Drive @ Sengkang Sport Centre',   donors: 1377, date: '15-16 February 2026' },
  { name: 'Community Drive @ Bishan CC',               donors: 1290, date: '19-20 February 2026' },
  { name: 'Community Drive @ Bukit Panjang CC',        donors: 1214, date: '21-22 February 2026' },
  { name: 'Community Drive @ Jurong Spring CC',        donors: 1202, date: '23-24 February 2026' },
  { name: 'Community Drive @ Buona Vista CC',          donors: 1156, date: '26-27 February 2026' },
]

export default function BloodbankPerformance() {
  return (
    <PageLayout
      title="Performance Across Bloodbanks"
      subtitle="Monitor blood donation hotspots to plan donation drives more efficiently"
      breadcrumb={['Hotspots', 'Performance Across Bloodbanks']}
    >
      <div className="card p-5 overflow-x-auto">
        <p className="text-xs text-gray-500 mb-4">Only Top 20 Community Drives from at least 3 months ago are displayed.</p>
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Community Drive</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">No. of Donors</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Last Community Drive</th>
            </tr>
          </thead>
          <tbody>
            {COMMUNITY_DRIVES.map((d, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{d.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">{d.donors.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-500">{d.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  )
}
