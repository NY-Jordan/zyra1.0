'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dictionary, type Locale, type LandingDictionary } from './dictionary'

const STORAGE_KEY = 'zyraa-landing-locale'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: LandingDictionary
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'fr',
  setLocale: () => {},
  t: dictionary.fr,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') setLocaleState(stored)
  }, [])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dictionary[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
