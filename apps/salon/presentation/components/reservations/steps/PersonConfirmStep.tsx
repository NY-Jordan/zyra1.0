'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { HairDresserWithSalonAssociation } from '@/usecases/useHairDressers'
import { PersonBooking } from '../types'
import { PersonSummaryCard } from '../ui/ReservationWizardPrimitives'

interface PersonConfirmStepProps {
  bookings: PersonBooking[]
  services: ISalonService[]
  hairDressers: HairDresserWithSalonAssociation[]
  onAddPerson: () => void
  onRemovePerson: (index: number) => void
}

export function PersonConfirmStep({ bookings, services, hairDressers, onAddPerson, onRemovePerson }: PersonConfirmStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
        Personnes ajoutées
      </p>
      {bookings.map((booking, i) => {
        const svc = services.find(s => s.id === booking.serviceId)
        const hd = hairDressers.find(h => h.id === booking.hairdresserId)
        return (
          <PersonSummaryCard
            key={i}
            booking={booking}
            index={i}
            serviceName={svc?.name}
            hairdresserName={hd?.name}
            canRemove={bookings.length > 1}
            onRemove={() => onRemovePerson(i)}
          />
        )
      })}
      <button
        type="button"
        onClick={onAddPerson}
        className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[13px] font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ajouter une autre personne
      </button>
    </div>
  )
}
