'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'
import { CONTACT_ANCHOR, SALON_LOGIN_URL } from './links'
import { useLanguage } from './i18n/LanguageContext'
import { ManageCookiesButton } from '@/components/cookies/ManageCookiesButton'

export function LandingFooter() {
  const { t } = useLanguage()

  const FOOTER_COLUMNS = [
    {
      title: t.footer.columns[0].title,
      links: [
        { label: t.footer.columns[0].links[0], href: '#fonctionnalites' },
        { label: t.footer.columns[0].links[1], href: '#tarifs' },
        { label: t.footer.columns[0].links[2], href: '#temoignages' },
      ],
    },
    {
      title: t.footer.columns[1].title,
      links: [
        { label: t.footer.columns[1].links[0], href: SALON_LOGIN_URL },
        { label: t.footer.columns[1].links[1], href: CONTACT_ANCHOR },
      ],
    },
    {
      title: t.footer.columns[2].title,
      links: [
        { label: t.footer.columns[2].links[0], href: 'mailto:support@zyra.app' },
        { label: t.footer.columns[2].links[1], href: 'mailto:support@zyra.app' },
      ],
    },
  ]

  return (
    <footer className="border-t border-slate-100 bg-white dark:border-white/[0.06] dark:bg-[#0B0E12]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <img src="/images/full-logo-light.png" alt="Zyraa" className="h-[22px] w-auto dark:hidden" />
            <img src="/images/full-logo-dark.png" alt="Zyraa" className="hidden h-[22px] w-auto dark:block" />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              {t.footer.description}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-white/[0.06] sm:flex-row">
          <p className="text-[12px] text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} Zyraa · {t.footer.copyright}
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-[12px] text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400">
              {t.footer.privacy}
            </Link>
            <Link href="#" className="text-[12px] text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400">
              {t.footer.terms}
            </Link>
            <ManageCookiesButton className="text-[12px] text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400" />
          </div>
        </div>
      </div>
    </footer>
  )
}
