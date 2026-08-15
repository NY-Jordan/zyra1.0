'use client'

import React from 'react'
import { Users, User, Check } from 'lucide-react'

interface ReservationTypeProps {
  selectedType: 'single' | 'multiple' | null
  onSelectType: (type: 'single' | 'multiple') => void
}

export default function ReservationType({ selectedType, onSelectType }: ReservationTypeProps) {
  const options = [
    {
      type: 'single' as const,
      icon: User,
      title: 'Réservation personnelle',
      desc: 'Un créneau pour moi-même',
      color: 'emerald',
    },
    {
      type: 'multiple' as const,
      icon: Users,
      title: 'Réservations multiples',
      desc: 'Plusieurs personnes en même temps',
      color: 'sky',
    },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-slate-900">Type de réservation</h2>
        <p className="text-[13px] text-slate-500">Choisissez si vous réservez seul ou en groupe</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(({ type, icon: Icon, title, desc, color }) => {
          const isSelected = selectedType === type
          return (
            <button
              key={type}
              onClick={() => onSelectType(type)}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? 'bg-slate-100' : 'bg-slate-50'
              }`}>
                <Icon className={`h-5 w-5 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`} />
              </div>
              <p className="text-[14px] font-bold text-slate-900">{title}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{desc}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
