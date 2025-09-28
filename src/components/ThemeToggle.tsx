'use client'

import { useEffect, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme)
    }

    // Apply theme
    applyTheme(savedTheme || 'system')
  }, [])

  const applyTheme = (newTheme: Theme) => {
    let shouldBeDark = false

    if (newTheme === 'dark') {
      shouldBeDark = true
    } else if (newTheme === 'light') {
      shouldBeDark = false
    } else {
      // system
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    setIsDark(shouldBeDark)

    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return <ComputerDesktopIcon className="h-5 w-5" />
    }
    return isDark ? (
      <SunIcon className="h-5 w-5 text-yellow-400" />
    ) : (
      <MoonIcon className="h-5 w-5" />
    )
  }

  const getCurrentLabel = () => {
    if (theme === 'system') {
      return 'System theme'
    }
    return isDark ? 'Switch to light mode' : 'Switch to dark mode'
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="relative rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:text-gray-400 dark:hover:text-white dark:focus:outline-indigo-500"
        aria-label={getCurrentLabel()}
      >
        <span className="absolute -inset-1.5" />
        {getCurrentIcon()}
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg outline-1 outline-black/5 dark:outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <MenuItem>
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex w-full items-center px-4 py-2 text-sm ${
              theme === 'light'
                ? 'bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <SunIcon className="mr-3 h-4 w-4" />
            Light
          </button>
        </MenuItem>
        <MenuItem>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex w-full items-center px-4 py-2 text-sm ${
              theme === 'dark'
                ? 'bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <MoonIcon className="mr-3 h-4 w-4" />
            Dark
          </button>
        </MenuItem>
        <MenuItem>
          <button
            onClick={() => handleThemeChange('system')}
            className={`flex w-full items-center px-4 py-2 text-sm ${
              theme === 'system'
                ? 'bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <ComputerDesktopIcon className="mr-3 h-4 w-4" />
            System
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
