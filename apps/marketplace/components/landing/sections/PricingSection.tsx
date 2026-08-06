'use client'

import { Check } from 'lucide-react'
import { Accent, SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import { CONTACT_ANCHOR } from '../links'
import { useLanguage } from '../i18n/LanguageContext'

export function PricingSection() {
  const { t } = useLanguage()

  return (
    <section id="tarifs" className="bg-white py-24 dark:bg-[#0B0E12] sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title={
            <>
              {t.pricing.titlePre}
              <Accent>{t.pricing.titleAccent}</Accent>
              {t.pricing.titlePost}
            </>
          }
          description={t.pricing.description}
        />

        <Reveal delay={100} className="mx-auto mt-14 max-w-md rounded-2xl border-2 border-emerald-500 bg-white p-8 text-center transition-transform duration-500 hover:-translate-y-1 dark:bg-[#11151C]">
          <p className="text-[15px] font-semibold text-slate-800 dark:text-white">{t.pricing.planName}</p>
          <p className="mt-3 flex items-baseline justify-center gap-1.5">
            <span className="font-[family-name:var(--font-heading)] text-[44px] font-black tracking-tight text-slate-900 dark:text-white">
              15 000
            </span>
            <span className="text-[13px] text-slate-400">{t.pricing.priceSuffix}</span>
          </p>
          <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">{t.pricing.planDescription}</p>

          <ul className="mt-7 space-y-3 text-left">
            {t.pricing.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" strokeWidth={2} />
                <span className="text-[13px] text-slate-600 dark:text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>

          <a
            href={CONTACT_ANCHOR}
            className="mt-8 flex h-11 items-center justify-center rounded-full bg-[#22C55E] text-[14px] font-semibold text-white transition-colors hover:bg-[#16A34A]"
          >
            {t.pricing.cta}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
