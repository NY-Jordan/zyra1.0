'use client'

import { BarChart3, Bell, CalendarDays, Users2 } from 'lucide-react'
import { Accent, SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import { useLanguage } from '../i18n/LanguageContext'

const ICONS = [CalendarDays, Users2, Bell, BarChart3]

export function FeaturesSection() {
  const { t } = useLanguage()

  return (
    <section id="fonctionnalites" className="bg-white py-24 dark:bg-[#0B0E12] sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title={
            <>
              {t.features.titlePre}
              <Accent>{t.features.titleAccent}</Accent>
              {t.features.titlePost}
            </>
          }
          description={t.features.description}
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70 dark:border-white/10 dark:bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {t.features.items.map((feature, i) => {
            const Icon = ICONS[i]!
            return (
              <Reveal
                key={feature.title}
                delay={i * 100}
                className="bg-white p-7 transition-colors duration-300 hover:bg-emerald-50/40 dark:bg-[#0B0E12] dark:hover:bg-emerald-950/10"
              >
                <Icon className="h-6 w-6 text-emerald-500" strokeWidth={1.5} />
                <p className="mt-5 text-[15px] font-semibold text-slate-800 dark:text-white">{feature.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
