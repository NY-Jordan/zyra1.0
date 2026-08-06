'use client'

import { useLanguage } from './i18n/LanguageContext'
import type { Locale } from './i18n/dictionary'

const OPTIONS: Locale[] = ['fr', 'en']

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex h-9 items-center rounded-full border border-[#F0EAE4] bg-white p-0.5 text-[12px] font-semibold dark:border-slate-800 dark:bg-slate-900">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          className={`flex h-8 w-8 items-center justify-center rounded-full uppercase transition-colors ${
            locale === option
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
