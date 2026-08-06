'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useCookieConsent } from './CookieConsentContext'
import { CookieToggle } from './CookieToggle'
import type { CookieSettingsCopy } from './cookieCopy'

export function CookieSettingsModal({ copy }: { copy: CookieSettingsCopy }) {
  const { consent, savePreferences, acceptAll, closeSettings } = useCookieConsent()
  const [preferences, setPreferences] = useState(consent?.preferences ?? false)

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-[#11151C]">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-white/10">
          <p className="text-[15px] font-bold text-slate-900 dark:text-white">{copy.title}</p>
          <button
            type="button"
            onClick={closeSettings}
            aria-label={copy.cancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{copy.description}</p>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 p-4 dark:border-white/10">
            <div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{copy.necessary.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                {copy.necessary.description}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {copy.alwaysActive}
              </p>
            </div>
            <CookieToggle checked disabled label={copy.necessary.title} />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 p-4 dark:border-white/10">
            <div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{copy.preferences.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                {copy.preferences.description}
              </p>
            </div>
            <CookieToggle checked={preferences} onChange={setPreferences} label={copy.preferences.title} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-5 dark:border-white/10 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => savePreferences(preferences)}
            className="h-10 rounded-full border border-slate-200 px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            {copy.save}
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
