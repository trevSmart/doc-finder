'use client'

import Image from 'next/image'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon as XMarkIconSolid } from '@heroicons/react/20/solid'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSearch } from '../contexts/SearchContext'

const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Calendar', href: '#', current: false },
  { name: 'Teams', href: '#', current: false },
  { name: 'Directory', href: '#', current: false },
]

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

interface NavigationProps {
  onSidebarOpen?: () => void
  sidebarOpen?: boolean
}

export default function Navigation({ onSidebarOpen, sidebarOpen }: NavigationProps) {
  const { searchQuery, setSearchQuery } = useSearch()

  return (
    <>
      {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
      <Popover
        as="header"
        className="relative bg-white dark:bg-gray-900 shadow-xs data-open:fixed data-open:inset-0 data-open:z-40 data-open:overflow-y-auto lg:overflow-y-visible dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10 dark:data-open:after:absolute dark:data-open:after:inset-x-0 dark:data-open:after:bottom-0"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between lg:gap-8 xl:grid xl:grid-cols-12">
            <div className="flex md:absolute md:inset-y-0 md:left-0 lg:static xl:col-span-2">
              <div className="flex shrink-0 items-center">
                {/* Sidebar toggle button for mobile */}
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
                  onClick={onSidebarOpen}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Desktop sidebar toggle button */}
                {!sidebarOpen && (
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 hidden lg:block"
                    onClick={onSidebarOpen}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>
                )}

                {/* Separator */}
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden ml-2" aria-hidden="true" />

                <a href="#" className="ml-2 lg:ml-0">
                  <Image
                    alt="Your Company"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    width={32}
                    height={32}
                    priority
                    sizes="(max-width: 1024px) 32px, 32px"
                    className="size-8 dark:hidden"
                  />
                  <Image
                    alt="Your Company"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    width={32}
                    height={32}
                    priority
                    sizes="(max-width: 1024px) 32px, 32px"
                    className="size-8 not-dark:hidden"
                  />
                </a>
              </div>
            </div>
            <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
              <div className="flex items-center px-6 py-3.5 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                <div className="relative w-full">
                  <input
                    name="search"
                    placeholder="Search clips"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSearchQuery('')
                      }
                    }}
                    className="block w-full rounded-md bg-white dark:bg-white/5 py-1.5 pr-10 pl-10 text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500 sm:text-sm/6"
                  />
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <XMarkIconSolid className="size-4" aria-hidden="true" />
                      <span className="sr-only">Clear search</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center md:absolute md:inset-y-0 md:right-0 lg:hidden">
              {/* Mobile menu button */}
              <PopoverButton className="group relative -mx-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white dark:focus:outline-indigo-500">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
              </PopoverButton>
            </div>
            <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
              <button
                type="button"
                className="relative ml-5 shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:text-gray-400 dark:hover:text-white dark:focus:outline-indigo-500"
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="size-6" />
              </button>


              <a
                href="#"
                className="ml-6 inline-flex items-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500"
              >
                New Project
              </a>
            </div>
          </div>
        </div>

        <PopoverPanel
          as="nav"
          aria-label="Global"
          className="absolute left-1/2 z-10 mt-2 w-full -translate-x-1/2 lg:hidden dark:bg-gray-900 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-gray-800/50"
        >
          <div className="relative mx-auto max-w-3xl space-y-1 px-2 pt-2 pb-3 sm:px-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={classNames(
                  item.current
                    ? 'bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white'
                    : 'text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium',
                )}
              >
                {item.name}
              </a>
            ))}
          </div>
        </PopoverPanel>
      </Popover>
    </>
  )
}
