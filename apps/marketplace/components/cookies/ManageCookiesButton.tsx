'use client'

import { useCookieConsent } from './CookieConsentContext'

export function ManageCookiesButton({ className }: { className?: string }) {
  const { openSettings, copy } = useCookieConsent()

  return (
    <button type="button" onClick={openSettings} className={className}>
      {copy.manage}
    </button>
  )
}
