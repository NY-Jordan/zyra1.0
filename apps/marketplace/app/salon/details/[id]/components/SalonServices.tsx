'use client'

import React from 'react'
import { List } from 'lucide-react'
import type { salonDetailsDictionary } from '../i18n'

interface SalonService {
  name: string
  price: number | string
  duration: number
  categoryId?: string
}

interface ServicesCategory {
  id: string
  name: string
}

type ServicesCopy = (typeof salonDetailsDictionary)['fr']['services']

interface SalonServicesProps {
  salonId: string
  serviceCategories: ServicesCategory[]
  services: SalonService[]
  t: ServicesCopy
}

function formatDuration(min: number, t: ServicesCopy['duration']) {
  const m = min || 30
  if (m < 60) return t.minutes(m)
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? t.hours(h) : t.hoursAndMinutes(h, rem)
}

export function SalonServices({ salonId, serviceCategories, services, t }: SalonServicesProps) {
  const [selectedCategory, setSelectedCategory] = React.useState(serviceCategories[0]?.id || '')
  const [showAll, setShowAll] = React.useState(false)

  if (!serviceCategories || serviceCategories.length === 0) return null

  const filtered = services.filter(s => s.categoryId === selectedCategory)
  const visible = showAll ? filtered : filtered.slice(0, 6)

  return (
    <section id="services" className="scroll-mt-20">
      <h2 className="text-slate-900 mb-5">{t.title}</h2>

      {/* Pill category tabs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 min-w-0">
          {serviceCategories.map(cat => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setShowAll(false) }}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition-all duration-300 ease-out ${
                  active
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
        <button
          aria-label={t.allCategories}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors flex-shrink-0"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Service cards — re-keyed to animate on category switch */}
      <div key={selectedCategory} className="zyra-fade space-y-3">
        {visible.map((service, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-slate-900 leading-snug">{service.name}</p>
              <p className="text-[14px] text-slate-500 mt-1">{formatDuration(service.duration, t.duration)}</p>
              <p className="text-[15px] font-semibold text-slate-900 mt-2">
                {t.from} {Number(service.price).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <button
              onClick={() => window.location.href = `/booking/${salonId}`}
              className="h-10 px-5 rounded-full text-slate-900 border border-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {t.book}
            </button>
          </div>
        ))}
      </div>

      {filtered.length > 6 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-4 text-slate-900 hover:underline"
        >
          {showAll ? t.showLess : t.showMore(filtered.length)}
        </button>
      )}

      {filtered.length === 0 && (
        <p className="text-[14px] text-slate-400 py-2">{t.empty}</p>
      )}
    </section>
  )
}
