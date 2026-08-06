'use client'

import { PhoneMissed, FileX2, Clock3 } from 'lucide-react'
import { Accent, SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import { useLanguage } from '../i18n/LanguageContext'

const ICONS = [PhoneMissed, FileX2, Clock3]

export function ProblemSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-white py-24 dark:bg-[#0B0E12] sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t.problem.eyebrow}
          title={
            <>
              {t.problem.titlePre}
              <Accent>{t.problem.titleAccent}</Accent>
              {t.problem.titlePost}
            </>
          }
          description={t.problem.description}
        />

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-3">
          {t.problem.points.map((point, i) => {
            const Icon = ICONS[i]!
            return (
              <Reveal key={point.title} delay={i * 100}>
                <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                <p className="mt-4 text-[16px] font-semibold text-slate-800 dark:text-white">{point.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {point.description}
                </p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
