'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  type CookieConsent,
  getConsent,
  saveConsent,
  clearAllPreferenceStorage,
  getRawCookie,
  LANGUAGE_COOKIE_NAME,
} from '@/lib/cookieConsent'
import { cookieCopy, type CookieCopy, type CookieLocale } from './cookieCopy'
import { CookieBanner } from './CookieBanner'
import { CookieSettingsModal } from './CookieSettingsModal'

interface CookieConsentContextValue {
  /** null means "no decision yet" — distinct from an explicit refusal. */
  consent: CookieConsent | null
  copy: CookieCopy
  isSettingsOpen: boolean
  acceptAll: () => void
  rejectNonEssential: () => void
  savePreferences: (preferences: boolean) => void
  openSettings: () => void
  closeSettings: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

const LOCALE_CHANGE_EVENT = 'zyraa:locale-change'

/** Fired by the landing's LanguageContext so this banner/modal — mounted
 *  above it in the tree — can still match the language the visitor is
 *  actively using, without the two systems being coupled. */
export function broadcastLocaleChange(locale: CookieLocale) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }))
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [locale, setLocale] = useState<CookieLocale>('fr')

  useEffect(() => {
    setConsent(getConsent())
    const storedLang = getRawCookie(LANGUAGE_COOKIE_NAME)
    if (storedLang === 'en' || storedLang === 'fr') setLocale(storedLang)
    setHydrated(true)

    const onLocaleChange = (event: Event) => {
      const detail = (event as CustomEvent<CookieLocale>).detail
      if (detail === 'en' || detail === 'fr') setLocale(detail)
    }
    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange)
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange)
  }, [])

  const applyConsent = (preferences: boolean) => {
    const next = saveConsent(preferences)
    setConsent(next)
    if (!preferences) clearAllPreferenceStorage()
  }

  const copy = cookieCopy[locale]

  const value: CookieConsentContextValue = {
    consent,
    copy,
    isSettingsOpen,
    acceptAll: () => {
      applyConsent(true)
      setIsSettingsOpen(false)
    },
    rejectNonEssential: () => {
      applyConsent(false)
      setIsSettingsOpen(false)
    },
    savePreferences: (preferences) => {
      applyConsent(preferences)
      setIsSettingsOpen(false)
    },
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
  }

  const showBanner = hydrated && consent === null && !isSettingsOpen

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {showBanner && <CookieBanner copy={copy.banner} />}
      {isSettingsOpen && <CookieSettingsModal copy={copy.settings} />}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  return ctx
}
