import { useState } from 'react'
import Sidebar from './Sidebar'
import PageBanner from './PageBanner'

export default function PageLayout({ title, subtitle, breadcrumb, isHome, actions, children, footer }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto">
          <PageBanner title={title} subtitle={subtitle} breadcrumb={breadcrumb} isHome={isHome} actions={actions} />
          <div className="p-5">
            {children}
          </div>
        </main>
        {footer}
      </div>
    </div>
  )
}
