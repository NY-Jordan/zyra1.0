/**
 * Pure cookie utilities for the site's consent system — no React here on
 * purpose, so this stays trivially reusable from contexts, hooks, or plain
 * client components (and easy to unit test in isolation).
 */

export const CONSENT_COOKIE_NAME = 'zyraa_cookie_consent'
// Bump this if the cookie policy/categories change — a version mismatch
// invalidates any stored consent and re-prompts the user.
export const CONSENT_VERSION = 1
const CONSENT_MAX_AGE_DAYS = 180
const PREFERENCE_MAX_AGE_DAYS = 365

export const LANGUAGE_COOKIE_NAME = 'zyraa_lang'
// The localStorage key next-themes persists the resolved theme under. RGPD
// treats localStorage the same as cookies, so it's wiped the same way.
export const THEME_STORAGE_KEY = 'theme'

export interface CookieConsent {
  necessary: true
  preferences: boolean
  version: number
  updatedAt: string
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function setRawCookie(name: string, value: string, maxAgeDays: number) {
  if (!isBrowser()) return
  const maxAge = maxAgeDays * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`
}

export function getRawCookie(name: string): string | null {
  if (!isBrowser()) return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1] !== undefined ? decodeURIComponent(match[1]) : null
}

export function deleteRawCookie(name: string) {
  if (!isBrowser()) return
  document.cookie = `${name}=; max-age=0; path=/`
}

export function getConsent(): CookieConsent | null {
  const raw = getRawCookie(CONSENT_COOKIE_NAME)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as CookieConsent
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function saveConsent(preferences: boolean): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    preferences,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  }
  setRawCookie(CONSENT_COOKIE_NAME, JSON.stringify(consent), CONSENT_MAX_AGE_DAYS)
  return consent
}

export function clearConsent() {
  deleteRawCookie(CONSENT_COOKIE_NAME)
}

/** Only persists if the user has accepted the "preferences" category. */
export function setPreferenceCookie(name: string, value: string): boolean {
  const consent = getConsent()
  if (!consent?.preferences) return false
  setRawCookie(name, value, PREFERENCE_MAX_AGE_DAYS)
  return true
}

/** Returns null (not just missing) whenever preferences aren't consented to. */
export function getPreferenceCookie(name: string): string | null {
  const consent = getConsent()
  if (!consent?.preferences) return null
  return getRawCookie(name)
}

/** Wipes every non-essential cookie/localStorage entry, e.g. on refusal. */
export function clearAllPreferenceStorage() {
  deleteRawCookie(LANGUAGE_COOKIE_NAME)
  if (isBrowser()) {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
  }
}
