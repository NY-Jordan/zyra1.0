'use client'

import React from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import type { salonDetailsDictionary } from '../i18n'

interface SalonLocationProps {
  salon: ISalon
  t: (typeof salonDetailsDictionary)['fr']['location']
}

export function SalonLocation({ salon, t }: SalonLocationProps) {
  const fullAddress = [salon.address, salon.city, salon.country].filter(Boolean).join(', ')
  const query = encodeURIComponent(fullAddress || salon.city || '')
  const embedUrl = `https://maps.google.com/maps?q=${query}&z=15&output=embed`
  const directionsUrl = `https://maps.google.com/?daddr=${query}`

  if (!fullAddress) return null

  return (
    <section id="localisation" className="scroll-mt-20">
      <h2 className="text-slate-900 mb-5">{t.title}</h2>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Map */}
        <div className="relative h-52 sm:h-64 bg-slate-100">
          <iframe
            title={t.mapTitle}
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Address + directions */}
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-2.5 min-w-0">
            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-slate-600 leading-relaxed">{fullAddress}</p>
          </div>
          <button
            onClick={() => window.open(directionsUrl, '_blank')}
            className="flex items-center gap-1.5 h-10 px-4 rounded-full text-[12px] font-bold text-slate-900 border border-slate-300 hover:bg-[#22C55E] hover:text-white hover:border-[#22C55E] transition-all flex-shrink-0"
          >
            <Navigation className="h-3.5 w-3.5" />
            {t.directions}
          </button>
        </div>
      </div>
    </section>
  )
}
