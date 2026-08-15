'use client'

import React from 'react'
import { Clock, MapPin, ChevronDown } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import type { salonDetailsDictionary } from '../i18n'

interface SalonSidebarProps {
  salon: ISalon
  t: (typeof salonDetailsDictionary)['fr']['status']
  bookLabel: string
  directionsLabel: string
  days: Record<string, string>
}

export function SalonSidebar({ salon, t, bookLabel, directionsLabel, days }: SalonSidebarProps) {
  const [hoursOpen, setHoursOpen] = React.useState(false)

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const today = salon.openingHours?.find(h => h.day === todayName)
  const fullAddress = [salon.address, salon.city, salon.country].filter(Boolean).join(', ')

  return (
    <div className="sticky top-6">
      <div className="rounded-2xl border border-slate-200 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        {/* Réserver */}
        <div className="p-5">
          <button
            onClick={() => window.location.href = `/booking/${salon.id}`}
            className="w-full py-3.5 rounded-full text-[15px] font-bold text-white bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.99] transition-all"
          >
            {bookLabel}
          </button>
        </div>

        <div className="border-t border-slate-100" />

        {/* Hours */}
        {salon.openingHours && salon.openingHours.length > 0 && (
          <div className="px-5 py-4">
            <button
              onClick={() => setHoursOpen(v => !v)}
              className="w-full flex items-center gap-3 text-left"
            >
              <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <span className="flex-1 text-[14px]">
                <span className="font-semibold text-emerald-600">{t.open}</span>
                {today?.openDay && <span className="text-slate-600"> {t.until} {today.close}</span>}
                {today && !today.openDay && <span className="text-slate-600"> · {t.closedToday}</span>}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform ${hoursOpen ? 'rotate-180' : ''}`} />
            </button>

            {hoursOpen && (
              <div className="mt-3 pl-8 space-y-1.5">
                {salon.openingHours.map(hour => {
                  const isToday = hour.day === todayName
                  return (
                    <div key={hour.day} className="flex justify-between items-center">
                      <span className={`text-[13px] ${isToday ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                        {(days[hour.day as string] as string) || hour.day}
                      </span>
                      <span className={`text-[13px] ${hour.openDay ? (isToday ? 'font-semibold text-slate-900' : 'text-slate-600') : 'text-slate-400'}`}>
                        {hour.openDay ? `${hour.open} – ${hour.close}` : t.closed}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {fullAddress && <div className="border-t border-slate-100" />}

        {/* Address */}
        {fullAddress && (
          <div className="px-5 py-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-slate-600 leading-relaxed">{fullAddress}</p>
                <button
                  onClick={() => window.open(`https://maps.google.com/?daddr=${encodeURIComponent(fullAddress)}`, '_blank')}
                  className="text-[13px] font-semibold text-emerald-600 hover:underline mt-1"
                >
                  {directionsLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
