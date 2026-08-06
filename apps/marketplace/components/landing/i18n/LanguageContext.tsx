'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dictionary, type Locale, type LandingDictionary } from './dictionary'
import { getPreferenceCookie, setPreferenceCookie, LANGUAGE_COOKIE_NAME } from '@/lib/cookieConsent'
import { broadcastLocaleChange, useCookieConsent } from '@/components/cookies/CookieConsentContext'

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
  const { consent } = useCookieConsent()

  // Restore the visitor's language only if they've already consented to
  // preference cookies — otherwise every visit starts from the default until
  // they opt in, per "no non-essential cookies before consent".
  useEffect(() => {
    const stored = getPreferenceCookie(LANGUAGE_COOKIE_NAME)
    if (stored === 'fr' || stored === 'en') setLocaleState(stored)
  }, [])

  // If the visitor accepts preferences later (via the cookie banner/modal),
  // persist whatever language they're already using at that moment.
  useEffect(() => {
    if (consent?.preferences) {
      setPreferenceCookie(LANGUAGE_COOKIE_NAME, locale)
    }
  }, [consent?.preferences])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    setPreferenceCookie(LANGUAGE_COOKIE_NAME, next)
    broadcastLocaleChange(next)
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
