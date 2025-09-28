'use client'

import { useState } from 'react'
import SidebarNavigation from './SidebarNavigation'
import Navigation from './Navigation'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div>
      <SidebarNavigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-72">
        <Navigation onSidebarOpen={() => setSidebarOpen(true)} />

        <main className="py-10 bg-white dark:bg-gray-900 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
