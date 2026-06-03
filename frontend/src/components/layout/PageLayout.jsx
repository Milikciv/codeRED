import { useState } from 'react'
import Sidebar from './Sidebar'
import PageBanner from './PageBanner'

export default function PageLayout({ title, subtitle, breadcrumb, isHome, actions, children, footer }) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile backdrop — closes sidebar on tap outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto">
          <PageBanner
            title={title}
            subtitle={subtitle}
            breadcrumb={breadcrumb}
            isHome={isHome}
            actions={actions}
            onMenuToggle={() => setSidebarOpen(o => !o)}
          />
          <div className="p-4 lg:p-5 page-enter-animate">
            {children}
          </div>
        </main>
        {footer}
      </div>
    </div>
  )
}
