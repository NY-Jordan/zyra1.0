'use client'

import { useCookieConsent } from './CookieConsentContext'
import type { CookieBannerCopy } from './cookieCopy'

export function CookieBanner({ copy }: { copy: CookieBannerCopy }) {
  const { acceptAll, rejectNonEssential, openSettings } = useCookieConsent()

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={copy.title}
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-[#11151C] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] sm:flex-row sm:items-center sm:p-6">
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-slate-900 dark:text-white">{copy.title}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={openSettings}
            className="h-10 rounded-full px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {copy.customize}
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className="h-10 rounded-full border border-slate-200 px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            {copy.rejectAll}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="h-10 rounded-full bg-[#22C55E] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#16A34A]"
          >
            {copy.acceptAll}
          </button>
        </div>
      </div>
    </div>
  )
}
