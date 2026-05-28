import Sidebar from './Sidebar'
import PageBanner from './PageBanner'

export default function PageLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PageBanner title={title} subtitle={subtitle} />
        <main className="flex-1 p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
