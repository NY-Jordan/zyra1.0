'use client'

import { CheckCircle2 } from 'lucide-react'
import { Accent, SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import resevationsScreenshotDark from '@/assets/calendar-dark.png'
import resevationsScreenshotLight from '@/assets/calendar-light.png'
import Image from 'next/image'
import { useLanguage } from '../i18n/LanguageContext'

export function SolutionSection() {
  const { t } = useLanguage()

  return (
    <section className="overflow-hidden bg-slate-50/60 py-24 dark:bg-white/[0.02] sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] lg:gap-10">
        <div>
          <SectionHeading
            align="left"
            eyebrow={t.solution.eyebrow}
            title={
              <>
                {t.solution.titlePre}
                <Accent>{t.solution.titleAccent}</Accent>
                {t.solution.titlePost}
              </>
            }
            description={t.solution.description}
          />

          <ul className="mt-8 space-y-4">
            {t.solution.points.map((point, i) => (
              <Reveal key={point} delay={i * 80}>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" strokeWidth={1.75} />
                  <span className="text-[15px] text-slate-700 dark:text-slate-300">{point}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal
          delay={150}
          className="relative lg:-mr-10 xl:-mr-24 lg:scale-[1.12] lg:origin-left"
        >
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] transition-transform duration-500 hover:-translate-y-1 dark:border-white/10 dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
            <Image
              src={resevationsScreenshotDark}
              alt="Aperçu du calendrier de réservation"
              priority
              className="hidden w-full dark:block"
            />
            <Image
              src={resevationsScreenshotLight}
              alt="Aperçu du calendrier de réservation"
              priority
              className="w-full dark:hidden"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
