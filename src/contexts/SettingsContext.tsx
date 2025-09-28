'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface Settings {
  profile: {
    fullName: string
    email: string
    title: string
  }
  documentSources: {
    googleDrive: boolean
    dropbox: boolean
    localFolder: string
  }
  searchSettings: {
    fullTextSearch: boolean
    aiPoweredSearch: boolean
  }
  languageAndDates: {
    language: string
    dateFormat: string
    automaticTimezone: boolean
  }
}

const defaultSettings: Settings = {
  profile: {
    fullName: 'Tom Cook',
    email: 'tom.cook@example.com',
    title: 'Document Manager',
  },
        documentSources: {
          googleDrive: false,
          dropbox: false,
          localFolder: '/Users/marcpla/Downloads/library',
        },
  searchSettings: {
    fullTextSearch: true,
    aiPoweredSearch: true,
  },
  languageAndDates: {
    language: 'English',
    dateFormat: 'DD-MM-YYYY',
    automaticTimezone: true,
  },
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  updateProfile: (profile: Partial<Settings['profile']>) => void
  updateDocumentSources: (sources: Partial<Settings['documentSources']>) => void
  updateSearchSettings: (search: Partial<Settings['searchSettings']>) => void
  updateLanguageAndDates: (lang: Partial<Settings['languageAndDates']>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('docfinder-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('docfinder-settings', JSON.stringify(settings))
      } catch (error) {
        console.error('Error saving settings to localStorage:', error)
      }
    }
  }, [settings, isLoaded])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const updateProfile = (profile: Partial<Settings['profile']>) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profile }
    }))
  }

  const updateDocumentSources = (sources: Partial<Settings['documentSources']>) => {
    setSettings(prev => ({
      ...prev,
      documentSources: { ...prev.documentSources, ...sources }
    }))
  }

  const updateSearchSettings = (search: Partial<Settings['searchSettings']>) => {
    setSettings(prev => ({
      ...prev,
      searchSettings: { ...prev.searchSettings, ...search }
    }))
  }

  const updateLanguageAndDates = (lang: Partial<Settings['languageAndDates']>) => {
    setSettings(prev => ({
      ...prev,
      languageAndDates: { ...prev.languageAndDates, ...lang }
    }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const value: SettingsContextType = {
    settings,
    updateSettings,
    updateProfile,
    updateDocumentSources,
    updateSearchSettings,
    updateLanguageAndDates,
    resetSettings,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
