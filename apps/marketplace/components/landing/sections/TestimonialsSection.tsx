'use client'

import { Accent, SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import { useLanguage } from '../i18n/LanguageContext'

export function TestimonialsSection() {
  const { t } = useLanguage()

  return (
    <section id="temoignages" className="bg-slate-50/60 py-24 dark:bg-white/[0.02] sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title={
            <>
              {t.testimonials.titlePre}
              <Accent>{t.testimonials.titleAccent}</Accent>
              {t.testimonials.titlePost}
            </>
          }
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {t.testimonials.items.map((testimonial, i) => (
            <Reveal key={testimonial.name} delay={i * 120} className="flex flex-col">
              <p className="flex-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                "{testimonial.quote}"
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-[12px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{testimonial.name}</p>
                  <p className="text-[12px] text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
