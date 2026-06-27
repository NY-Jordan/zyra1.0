'use client'

import React from 'react'
import { Clock, MapPin, ChevronDown } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface SalonSidebarProps {
  salon: ISalon
}

const DAY_LABELS: Record<string, string> = {
  Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi',
  Friday: 'Vendredi', Saturday: 'Samedi', Sunday: 'Dimanche',
}

export function SalonSidebar({ salon }: SalonSidebarProps) {
  const [hoursOpen, setHoursOpen] = React.useState(false)

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const today = salon.openingHours?.find(h => h.day === todayName)
  const fullAddress = [salon.address, salon.city, salon.country].filter(Boolean).join(', ')

  return (
    <div className="sticky top-6">
      <div className="rounded-2xl border border-gray-200 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        {/* Réserver */}
        <div className="p-5">
          <button
            onClick={() => window.location.href = `/booking/${salon.id}`}
            className="w-full py-3.5 rounded-full text-[15px] font-bold text-white bg-gray-900 hover:bg-gray-800 active:scale-[0.99] transition-all"
          >
            Réserver
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* Hours */}
        {salon.openingHours && salon.openingHours.length > 0 && (
          <div className="px-5 py-4">
            <button
              onClick={() => setHoursOpen(v => !v)}
              className="w-full flex items-center gap-3 text-left"
            >
              <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-[14px]">
                <span className="font-semibold text-emerald-600">Ouvert</span>
                {today?.openDay && <span className="text-gray-600"> jusqu'à {today.close}</span>}
                {today && !today.openDay && <span className="text-gray-600"> · fermé aujourd'hui</span>}
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${hoursOpen ? 'rotate-180' : ''}`} />
            </button>

            {hoursOpen && (
              <div className="mt-3 pl-8 space-y-1.5">
                {salon.openingHours.map(hour => {
                  const isToday = hour.day === todayName
                  return (
                    <div key={hour.day} className="flex justify-between items-center">
                      <span className={`text-[13px] ${isToday ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {(DAY_LABELS[hour.day as string] as string) || hour.day}
                      </span>
                      <span className={`text-[13px] ${hour.openDay ? (isToday ? 'font-semibold text-gray-900' : 'text-gray-600') : 'text-gray-400'}`}>
                        {hour.openDay ? `${hour.open} – ${hour.close}` : 'Fermé'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {fullAddress && <div className="border-t border-gray-100" />}

        {/* Address */}
        {fullAddress && (
          <div className="px-5 py-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-gray-600 leading-relaxed">{fullAddress}</p>
                <button
                  onClick={() => window.open(`https://maps.google.com/?daddr=${encodeURIComponent(fullAddress)}`, '_blank')}
                  className="text-[13px] font-semibold text-violet-600 hover:underline mt-1"
                >
                  Afficher l'itinéraire
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
