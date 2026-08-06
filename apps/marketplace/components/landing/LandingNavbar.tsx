'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { CONTACT_ANCHOR, SALON_LOGIN_URL } from './links'
import { useLanguage } from './i18n/LanguageContext'

export function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  const NAV_LINKS = [
    { label: t.nav.features, href: '#fonctionnalites' },
    { label: t.nav.pricing, href: '#tarifs' },
    { label: t.nav.testimonials, href: '#temoignages' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0B0E12]/70">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center">
          <img src="/images/full-logo-light.png" alt="Zyraa" className="h-[17px] w-auto dark:hidden" />
          <img src="/images/full-logo-dark.png" alt="Zyraa" className="hidden h-[17px] w-auto dark:block" />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <ThemeToggle />
          <a
            href={SALON_LOGIN_URL}
            className="ml-2 text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {t.nav.login}
          </a>
          <a
            href={CONTACT_ANCHOR}
            className="ml-2 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#22C55E] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#16A34A]"
          >
            {t.nav.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 md:hidden"
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 dark:border-white/[0.06] dark:bg-[#0B0E12] md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
            <LanguageToggle />
            <ThemeToggle />
            <a
              href={SALON_LOGIN_URL}
              className="flex-1 rounded-xl px-3 py-2.5 text-center text-[14px] font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
            >
              {t.nav.login}
            </a>
          </div>
          <a
            href={CONTACT_ANCHOR}
            className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-full bg-slate-900 text-[14px] font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            {t.nav.cta}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </header>
  )
}
