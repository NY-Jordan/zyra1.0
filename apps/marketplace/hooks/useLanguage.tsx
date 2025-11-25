'use client'
import { useState, useContext, createContext, ReactNode } from 'react'
import { LanguageCode } from '../data/featuresTranslations'

interface LanguageContextType {
  currentLanguage: LanguageCode
  setLanguage: (language: LanguageCode) => void
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'fr',
  setLanguage: () => {}
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('fr')

  const setLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language)
    // Optionnel: sauvegarder en localStorage
    localStorage.setItem('preferred-language', language)
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
