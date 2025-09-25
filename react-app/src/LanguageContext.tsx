import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Language } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Cargar idioma desde localStorage o usar catalán por defecto
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('docFinder.language')
      return (stored as Language) || 'ca'
    }
    return 'ca'
  })

  useEffect(() => {
    // Guardar idioma en localStorage cuando cambie
    if (typeof window !== 'undefined') {
      localStorage.setItem('docFinder.language', language)
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
