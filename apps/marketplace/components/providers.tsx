"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { CookieConsentProvider, useCookieConsent } from "./cookies/CookieConsentContext"
import { THEME_STORAGE_KEY } from "@/lib/cookieConsent"

/** RGPD treats localStorage the same as cookies: if the visitor hasn't
 *  accepted the "preferences" category, next-themes must not be allowed to
 *  persist a choice across sessions. next-themes has no storage-adapter hook,
 *  so this wipes its key back out right after it writes it. */
function ThemeConsentSync() {
  const { theme } = useTheme()
  const { consent } = useCookieConsent()

  React.useEffect(() => {
    if (consent && !consent.preferences) {
      window.localStorage.removeItem(THEME_STORAGE_KEY)
    }
  }, [theme, consent])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <ThemeConsentSync />
        {children}
      </NextThemesProvider>
    </CookieConsentProvider>
  )
}
