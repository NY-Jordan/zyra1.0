'use client'

import { useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import dashboardLight from '@/assets/dashboard-light.png'
import dashboardDark from '@/assets/dashboard-dark.png'
import reservationsLight from '@/assets/reservations-light.png'
import reservationsDark from '@/assets/reservations-dark.png'
import clientLight from '@/assets/client-light.png'
import clientDark from '@/assets/client-dark.png'
import { Accent, SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import { useLanguage } from '../i18n/LanguageContext'

const TAB_IMAGES = [
  { id: 'dashboard', light: dashboardLight, dark: dashboardDark },
  { id: 'reservations', light: reservationsLight, dark: reservationsDark },
  { id: 'clients', light: clientLight, dark: clientDark },
] as const

type TabId = (typeof TAB_IMAGES)[number]['id']

export function DemoSection() {
  const { t } = useLanguage()
  const [active, setActive] = useState<TabId>('dashboard')

  const tabs = TAB_IMAGES.map((image, i) => ({ ...image, label: t.demo.tabs[i]! }))
  const activeTab = tabs.find((tab) => tab.id === active)!

  return (
    <section className="bg-slate-50/60 py-24 dark:bg-white/[0.02] sm:py-28">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <SectionHeading
          title={
            <>
              {t.demo.titlePre}
              <Accent>{t.demo.titleAccent}</Accent>
              {t.demo.titlePost}
            </>
          }
          description={t.demo.description}
        />

        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-slate-200 p-1 dark:border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                active === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Reveal key={active} className="relative mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-slate-200/70 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.15)] dark:border-white/10">
          <ScreenshotPair light={activeTab.light} dark={activeTab.dark} label={activeTab.label} />
        </Reveal>
      </div>
    </section>
  )
}

function ScreenshotPair({ light, dark, label }: { light: StaticImageData; dark: StaticImageData; label: string }) {
  return (
    <>
      <Image src={light} alt={`Écran ${label} de Zyraa`} className="w-full dark:hidden" />
      <Image src={dark} alt={`Écran ${label} de Zyraa`} className="hidden w-full dark:block" />
    </>
  )
}
