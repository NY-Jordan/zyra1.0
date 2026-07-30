'use client'

import React from 'react'
import { HairDresserWithSalonAssociation } from '@zyra/core/usecases/useHairDressers'
import { FieldLabel, SelectableRow } from '../ui/ReservationWizardPrimitives'

interface HairdresserStepProps {
  personIndex: number
  qualifiedHairDressers: HairDresserWithSalonAssociation[]
  selectedId: string
  onSelect: (id: string) => void
}

export function HairdresserStep({ personIndex, qualifiedHairDressers, selectedId, onSelect }: HairdresserStepProps) {
  return (
    <div className="space-y-3">
      <FieldLabel>Coiffeur pour la personne {personIndex + 1} *</FieldLabel>
      {qualifiedHairDressers.length === 0 ? (
        <div className="px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-[12px] text-amber-700 dark:text-amber-400">
          Aucun coiffeur n&apos;est associé à ce service. Vérifiez les associations dans les paramètres.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {qualifiedHairDressers.map(hd => (
            <SelectableRow
              key={hd.id}
              selected={selectedId === hd.id}
              onClick={() => onSelect(hd.id)}
              icon={
                hd.photo
                  ? <img src={hd.photo} alt={hd.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                      {hd.name.charAt(0).toUpperCase()}
                    </div>
              }
              label={hd.name}
              meta={<span className="text-[11px] text-slate-400 dark:text-slate-500">{hd.speciality}</span>}
            />
          ))}
        </div>
      )}
    </div>
  )
}
