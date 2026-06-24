'use client'

import React from 'react'
import { Scissors } from 'lucide-react'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { FieldLabel, SelectableRow } from '../ui/ReservationWizardPrimitives'

interface ServiceStepProps {
  services: ISalonService[]
  selectedServiceId: string
  supplementNames: string[]
  selectedService: ISalonService | undefined
  totalDuration: number
  totalPrice: number
  onServiceSelect: (id: string) => void
  onSupplementToggle: (name: string) => void
}

export function ServiceStep({
  services,
  selectedServiceId,
  supplementNames,
  selectedService,
  totalDuration,
  totalPrice,
  onServiceSelect,
  onSupplementToggle,
}: ServiceStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Service *</FieldLabel>
        {services.length === 0 ? (
          <p className="text-[12px] text-slate-400">Aucun service configuré pour ce salon.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {services.map(service => (
              <SelectableRow
                key={service.id}
                selected={selectedServiceId === service.id}
                onClick={() => onServiceSelect(service.id)}
                icon={
                  service.imageUrl
                    ? <img src={service.imageUrl} alt={service.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-lg bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Scissors className="w-4 h-4 text-slate-400" />
                      </div>
                }
                label={service.name}
                meta={<span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{service.price.toLocaleString()} XAF</span>}
              />
            ))}
          </div>
        )}
      </div>

      {selectedService?.supplements && selectedService.supplements.length > 0 && (
        <div>
          <FieldLabel>Suppléments (optionnels)</FieldLabel>
          <div className="space-y-2">
            {selectedService.supplements.map(supp => (
              <SelectableRow
                key={supp.name}
                selected={supplementNames.includes(supp.name)}
                onClick={() => onSupplementToggle(supp.name)}
                label={supp.name}
                meta={
                  <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                    +{supp.duration} min · {supp.price.toLocaleString()} XAF
                  </span>
                }
              />
            ))}
          </div>
        </div>
      )}

      {selectedService && (
        <div className="px-4 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl space-y-1.5">
          <div className="flex justify-between text-[12px] text-slate-500 dark:text-slate-400">
            <span>{selectedService.name}</span>
            <span>{selectedService.price.toLocaleString()} XAF · {selectedService.duration} min</span>
          </div>
          {supplementNames.length > 0 && (
            <div className="flex justify-between text-[12px] text-slate-500 dark:text-slate-400">
              <span>Suppléments ({supplementNames.length})</span>
              <span>+{(totalPrice - selectedService.price).toLocaleString()} XAF</span>
            </div>
          )}
          <div className="flex justify-between text-[13px] font-bold text-slate-800 dark:text-white pt-1.5 border-t border-[#EDE8E3] dark:border-slate-700">
            <span>Total · {totalDuration} min</span>
            <span className="text-emerald-600 dark:text-emerald-400">{totalPrice.toLocaleString()} XAF</span>
          </div>
        </div>
      )}
    </div>
  )
}
