'use client'

import { Fragment, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  HomeIcon,
  DocumentTextIcon,
  FolderIcon,
  Cog6ToothIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import ThemeToggle from './ThemeToggle'

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon, current: true },
  { name: 'Clips', href: '#', icon: DocumentTextIcon, current: false },
  { name: 'Folders', href: '#', icon: FolderIcon, current: false },
  { name: 'Tags', href: '/tags', icon: TagIcon, current: false },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, current: false },
]

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

interface SidebarNavigationProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarWidth: number
  startResize: (e: React.MouseEvent) => void
  isResizing: boolean
}

export default function SidebarNavigation({ sidebarOpen, setSidebarOpen, sidebarWidth, startResize, isResizing }: SidebarNavigationProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    const mediaQuery = window.matchMedia('(max-width: 1023px)')

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    const legacyHandleChange: (this: MediaQueryList, event: MediaQueryListEvent) => void = function (event) {
      handleChange(event)
    }

    setIsMobile(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(legacyHandleChange)
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(legacyHandleChange)
      }
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted || !sidebarOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mounted, sidebarOpen, setSidebarOpen])

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Mobile sidebar */}
      {isMobile && (
        <Transition show={sidebarOpen} as={Fragment}>
          <div className="pointer-events-none fixed inset-y-0 left-0 z-50 flex lg:hidden">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="pointer-events-auto relative flex w-full max-w-xs flex-1">
                <button
                  type="button"
                  className="absolute left-full top-0 ml-2 mt-5 rounded-full bg-white/90 p-2 text-gray-700 shadow ring-1 ring-black/10 transition hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:ring-white/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/10">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">DocFinder</h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  item.current
                                    ? 'bg-gray-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    item.current
                                      ? 'text-indigo-600 dark:text-indigo-400'
                                      : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>

                  {/* Theme Toggle at bottom */}
                  <div className="flex justify-center pb-4">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Transition>
      )}

      {/* Static sidebar for desktop */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: `${sidebarWidth}px` }}
        data-sidebar
      >
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-end">
            {/* Desktop close button */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>

          {/* Theme Toggle at bottom */}
          <div className="flex justify-center pb-4">
            <ThemeToggle />
          </div>
        </div>

        {/* Resize handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-indigo-500 hover:opacity-50 transition-colors duration-200"
          onMouseDown={startResize}
          style={{
            backgroundColor: isResizing ? 'rgb(99 102 241)' : 'transparent',
            opacity: isResizing ? 0.5 : 1
          }}
        />
      </div>
    </>
  )
}
