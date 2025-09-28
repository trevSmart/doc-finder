'use client'

import { useState } from 'react'
import SidebarNavigation from './SidebarNavigation'
import Navigation from './Navigation'
import FileDetailsSidebar from './FileDetailsSidebar'
import { useFileDetails } from '../contexts/FileDetailsContext'
import { useResizableSidebar } from '../hooks/useResizableSidebar'
import { useResizableRightSidebar } from '../hooks/useResizableRightSidebar'
import { useFileTags } from '../contexts/FileTagsContext'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isOpen, selectedFile, closeFileDetails } = useFileDetails()
  const { sidebarWidth, startResize, isResizing } = useResizableSidebar()
  const { sidebarWidth: rightSidebarWidth, startResize: startRightResize, isResizing: isRightResizing } = useResizableRightSidebar()
  const { setFileTags } = useFileTags()

  return (
    <div>
      <SidebarNavigation
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarWidth={sidebarWidth}
        startResize={startResize}
        isResizing={isResizing}
      />

      <div
        style={{
          paddingLeft: sidebarOpen ? `${sidebarWidth}px` : '0px',
          paddingRight: isOpen ? `${rightSidebarWidth}px` : '0px'
        }}
        data-content
      >
        <Navigation
          onSidebarOpen={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
        />

        <main
          className="py-10 min-h-screen"
          onClick={(e) => {
            // Només tancar si es clica directament al main (no a un fill)
            if (e.target === e.currentTarget && isOpen) {
              closeFileDetails()
            }
          }}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <FileDetailsSidebar
        isOpen={isOpen}
        onClose={closeFileDetails}
        file={selectedFile}
        sidebarWidth={rightSidebarWidth}
        startResize={startRightResize}
        isResizing={isRightResizing}
        onFileTagsChange={setFileTags}
      />
    </div>
  )
}
