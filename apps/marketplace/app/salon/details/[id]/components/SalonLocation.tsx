'use client'

import React from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface SalonLocationProps {
  salon: ISalon
}

export function SalonLocation({ salon }: SalonLocationProps) {
  const fullAddress = [salon.address, salon.city, salon.country].filter(Boolean).join(', ')
  const query = encodeURIComponent(fullAddress || salon.city || '')
  const embedUrl = `https://maps.google.com/maps?q=${query}&z=15&output=embed`
  const directionsUrl = `https://maps.google.com/?daddr=${query}`

  if (!fullAddress) return null

  return (
    <section id="localisation" className="scroll-mt-20">
      <h2 className="text-gray-900 mb-5">Localisation</h2>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Map */}
        <div className="relative h-52 sm:h-64 bg-gray-100">
          <iframe
            title="Carte du salon"
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Address + directions */}
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-2.5 min-w-0">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-gray-600 leading-relaxed">{fullAddress}</p>
          </div>
          <button
            onClick={() => window.open(directionsUrl, '_blank')}
            className="flex items-center gap-1.5 h-10 px-4 rounded-full text-[12px] font-bold text-gray-900 border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex-shrink-0"
          >
            <Navigation className="h-3.5 w-3.5" />
            Itinéraire
          </button>
        </div>
      </div>
    </section>
  )
}
