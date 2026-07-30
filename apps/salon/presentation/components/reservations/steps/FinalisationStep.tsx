'use client'

import React from 'react'
import { Banknote, CreditCard, Smartphone } from 'lucide-react'
import { Textarea } from '@zyra/ui/components/textarea'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { reservationPaymentMethodEnum, reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { HairDresserWithSalonAssociation } from '@zyra/core/usecases/useHairDressers'
import { PersonBooking } from '../types'
import { FieldLabel, SelectableRow, Toggle } from '../ui/ReservationWizardPrimitives'

interface FinalisationStepProps {
  bookings: PersonBooking[]
  services: ISalonService[]
  hairDressers: HairDresserWithSalonAssociation[]
  paymentMethod: reservationPaymentMethodEnum
  isPaid: boolean
  initialStatus: reservationStatusEnum
  notes: string
  totalPrice: number
  onPaymentMethodChange: (m: reservationPaymentMethodEnum) => void
  onIsPaidToggle: () => void
  onStatusChange: (s: reservationStatusEnum) => void
  onNotesChange: (n: string) => void
}

const STATUS_OPTIONS = [
  { value: reservationStatusEnum.pending, label: 'En attente', sub: 'À confirmer plus tard', color: 'amber' },
  { value: reservationStatusEnum.confirmed, label: 'Confirmée', sub: 'Valider directement', color: 'emerald' },
] as const

export function FinalisationStep({
  bookings,
  services,
  hairDressers,
  paymentMethod,
  isPaid,
  initialStatus,
  notes,
  totalPrice,
  onPaymentMethodChange,
  onIsPaidToggle,
  onStatusChange,
  onNotesChange,
}: FinalisationStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Méthode de paiement *</FieldLabel>
        <div className="space-y-2">
          <SelectableRow
            selected={paymentMethod === reservationPaymentMethodEnum.cash}
            onClick={() => onPaymentMethodChange(reservationPaymentMethodEnum.cash)}
            icon={<Banknote className="w-4 h-4 text-slate-400" />}
            label="Espèces"
          />
          <SelectableRow
            selected={paymentMethod === reservationPaymentMethodEnum.mobile}
            onClick={() => onPaymentMethodChange(reservationPaymentMethodEnum.mobile)}
            icon={<Smartphone className="w-4 h-4 text-slate-400" />}
            label="Mobile Money"
          />
          <SelectableRow
            selected={paymentMethod === reservationPaymentMethodEnum.card}
            onClick={() => onPaymentMethodChange(reservationPaymentMethodEnum.card)}
            icon={<CreditCard className="w-4 h-4 text-slate-400" />}
            label="Carte bancaire"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-3.5 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
        <label htmlFor="isPaid" className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
          Paiement déjà effectué
        </label>
        <Toggle id="isPaid" checked={isPaid} onChange={onIsPaidToggle} />
      </div>

      <div>
        <FieldLabel>Statut initial</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`flex flex-col items-start px-3.5 py-3 rounded-xl border transition-all ${
                initialStatus === opt.value
                  ? opt.color === 'emerald'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-[#F0EAE4] dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="notes">Notes (optionnel)</FieldLabel>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="Informations complémentaires..."
          rows={2}
          className="rounded-xl border-[#E8E0D8] dark:border-slate-700"
        />
      </div>

      {/* Récapitulatif */}
      <div className="px-4 py-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-2">
        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Récapitulatif</p>
        <div className="space-y-1.5">
          {bookings.map((booking, i) => {
            const svc = services.find(s => s.id === booking.serviceId)
            const hd = hairDressers.find(h => h.id === booking.hairdresserId)
            const suppPrice = svc?.supplements
              ?.filter(s => booking.supplementNames.includes(s.name))
              .reduce((a, s) => a + s.price, 0) ?? 0
            const price = (svc?.price ?? 0) + suppPrice
            return (
              <div key={i} className="flex items-start justify-between gap-2 text-[12px] text-slate-600 dark:text-slate-300">
                <div className="min-w-0">
                  <span className="font-medium truncate block">{booking.clientName || `Personne ${i + 1}`}</span>
                  <span className="text-slate-400 truncate block">{svc?.name} · {hd?.name} · {booking.time}</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex-shrink-0">{price.toLocaleString()} XAF</span>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-[14px] font-bold text-slate-800 dark:text-white pt-1.5 border-t border-emerald-200 dark:border-emerald-800/50">
          <span>Total</span>
          <span className="text-emerald-600 dark:text-emerald-400">{totalPrice.toLocaleString()} XAF</span>
        </div>
      </div>
    </div>
  )
}
