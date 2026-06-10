import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import PageBanner from './PageBanner'
import { pageContent, reducedTransition } from '../../lib/motion'

export default function PageLayout({ title, subtitle, breadcrumb, isHome, actions, children, footer }) {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  )

  return (
    <div className="flex h-screen bg-[#e0e0e0]">
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
          <motion.div
            key={location.pathname}
            className="p-4 lg:p-5"
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            variants={prefersReducedMotion ? { visible: { opacity: 1, transition: reducedTransition } } : pageContent}
          >
            {children}
          </motion.div>
        </main>
        {footer}
      </div>
    </div>
  )
}
