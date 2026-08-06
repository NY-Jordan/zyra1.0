'use client'

import Image, { type StaticImageData } from 'next/image'
import { BellRing, ShieldCheck, Wifi } from 'lucide-react'
import { Accent, SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import screenLogin from '@/assets/screen1.jpeg'
import screenOrders from '@/assets/screen2.jpeg'
import screenDashboard from '@/assets/screen3.jpeg'
import { useLanguage } from '../i18n/LanguageContext'

const ICONS = [Wifi, ShieldCheck, BellRing]

export function MobileAppSection() {
  const { t } = useLanguage()

  return (
    <section id="app-mobile" className="overflow-hidden bg-white py-24 dark:bg-[#0B0E12] sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div className="order-2 lg:order-1">
          <SectionHeading
            align="left"
            eyebrow={t.mobileApp.eyebrow}
            title={
              <>
                {t.mobileApp.titlePre}
                <Accent>{t.mobileApp.titleAccent}</Accent>
                {t.mobileApp.titlePost}
              </>
            }
            description={t.mobileApp.description}
          />

          <ul className="mt-8 space-y-4">
            {t.mobileApp.points.map((point, i) => {
              const Icon = ICONS[i]!
              return (
                <Reveal key={point} delay={i * 80}>
                  <li className="flex items-start gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="mt-1.5 text-[15px] text-slate-700 dark:text-slate-300">{point}</span>
                  </li>
                </Reveal>
              )
            })}
          </ul>
        </div>

        <Reveal delay={150} className="relative order-1 mx-auto py-10 lg:order-2 lg:py-0">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />

          <div className="relative mx-auto">
            <Phone image={screenDashboard} alt="Écran du dashboard de l'app mobile Zyraa" className="relative z-10" size="large" />
            <Phone
              image={screenLogin}
              alt="Écran de connexion de l'app mobile Zyraa"
              className="absolute -left-[70px] top-12 hidden rotate-[-8deg] sm:block"
              size="small"
            />
            <Phone
              image={screenOrders}
              alt="Écran des commandes de l'app mobile Zyraa"
              className="absolute -right-[70px] top-12 hidden rotate-[8deg] sm:block"
              size="small"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Phone({
  image,
  alt,
  className = '',
  size = 'large',
}: {
  image: StaticImageData
  alt: string
  className?: string
  size?: 'large' | 'small'
}) {
  const width = size === 'large' ? 'w-[200px] sm:w-[220px]' : 'w-[130px] sm:w-[150px]'

  return (
    <div className={`${width} ${className} flex-shrink-0 overflow-hidden rounded-[32px] border-[6px] border-slate-900 bg-slate-900 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] dark:border-slate-100 dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]`}>
      <Image src={image} alt={alt} className="w-full" />
    </div>
  )
}
