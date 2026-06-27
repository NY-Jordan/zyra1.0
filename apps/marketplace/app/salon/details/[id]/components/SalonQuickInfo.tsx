'use client'

import React from 'react'
import { MapPin, Clock, Phone } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface SalonQuickInfoProps {
  salon: ISalon
}

const DAY_LABELS: Record<string, string> = {
  Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi',
  Friday: 'Vendredi', Saturday: 'Samedi', Sunday: 'Dimanche',
}

export function SalonQuickInfo({ salon }: SalonQuickInfoProps) {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const today = salon.openingHours?.find(h => h.day === todayName)
  const todayLabel = today
    ? (today.openDay ? `Ouvert · ${today.open} – ${today.close}` : 'Fermé aujourd\'hui')
    : 'Horaires sur demande'

  const items = [
    {
      icon: MapPin,
      label: 'Adresse',
      value: [salon.address, salon.city].filter(Boolean).join(', ') || salon.city || '—',
    },
    {
      icon: Clock,
      label: 'Horaires',
      value: todayLabel,
    },
    {
      icon: Phone,
      label: 'Contact',
      value: salon.phone || salon.email || '—',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3 bg-white border border-[#F0EAE4] rounded-2xl p-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#F5F2EF] flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400">{label}</p>
            <p className="text-[13px] font-semibold text-slate-800 truncate">{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
