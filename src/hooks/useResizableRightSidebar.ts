'use client'

import { useState, useEffect, useCallback } from 'react'

const MIN_WIDTH = 200
const MAX_WIDTH = 500
const DEFAULT_WIDTH = 384 // 96 * 4 (equivalent to w-96)

export function useResizableRightSidebar() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)

  // Load width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem('right-sidebar-width')
    if (savedWidth) {
      const width = parseInt(savedWidth, 10)
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        setSidebarWidth(width)
      }
    }
  }, [])

  // Save width to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('right-sidebar-width', sidebarWidth.toString())
  }, [sidebarWidth])

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      // For right sidebar, we calculate width from the right edge
      const newWidth = window.innerWidth - e.clientX
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth))
      setSidebarWidth(clampedWidth)
    },
    [isResizing]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add global event listeners when resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      // Disable transitions during resize for smooth dragging
      const rightSidebar = document.querySelector('[data-right-sidebar]') as HTMLElement
      const content = document.querySelector('[data-content]') as HTMLElement

      if (rightSidebar) rightSidebar.style.transition = 'none'
      if (content) content.style.transition = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''

        // Re-enable transitions after resize
        if (rightSidebar) rightSidebar.style.transition = 'width 0.1s ease-out'
        if (content) content.style.transition = 'padding-right 0.1s ease-out'
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return {
    sidebarWidth,
    isResizing,
    startResize,
  }
}
