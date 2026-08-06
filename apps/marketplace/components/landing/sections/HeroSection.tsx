'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import heroScreenshotDark from '@/assets/dashboard-dark.png'
import heroScreenshotLight from '@/assets/dashboard-light.png'
import { CONTACT_ANCHOR } from '../links'
import { Reveal } from '../Reveal'
import { useLanguage } from '../i18n/LanguageContext'

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0B0E12]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(34,197,94,0.08),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:pb-32 lg:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h1 className="font-[family-name:var(--font-heading)] text-[44px] font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-[64px]">
              {t.hero.titleLine1}
              <br />
              <span className="font-black text-[#16A34A] dark:text-emerald-400">{t.hero.titleAccent}</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-xl text-[18px] leading-relaxed text-slate-500 dark:text-slate-400">
              {t.hero.description}
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={CONTACT_ANCHOR}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#22C55E] px-7 py-3.5 text-[15px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#16A34A]"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-7 py-3.5 text-[15px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>
            <p className="mt-4 text-[13px] text-slate-400 dark:text-slate-500">{t.hero.note}</p>
          </Reveal>
        </div>

        <Reveal delay={320} className="relative mx-auto mt-16 max-w-3xl sm:mt-20">
          <div className="pointer-events-none absolute -inset-x-10 -inset-y-10 -z-10 rounded-[48px] bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
          <Image
            src={heroScreenshotDark}
            alt="Aperçu du dashboard Zyraa"
            priority
            className="hidden w-full rounded-2xl border border-slate-200/70 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] dark:block dark:border-white/10 dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
          />
          <Image
            src={heroScreenshotLight}
            alt="Aperçu du dashboard Zyraa"
            priority
            className="w-full rounded-2xl border border-slate-200/70 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] dark:hidden dark:border-white/10 dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
          />
        </Reveal>
      </div>
    </section>
  )
}
