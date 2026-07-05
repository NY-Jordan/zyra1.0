'use client'

import React from 'react'
import {
  Calendar, Clock, User, DollarSign, Smartphone, Banknote, CreditCard, Scissors, UserPlus,
} from 'lucide-react'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationPaymentMethodEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

// ── Formatters / payment helpers ───────────────────────────────────────────────

export const fmtDate = (ts: any) =>
  ts.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

export const fmtTime = (ts: any) =>
  ts.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export const paymentMethodIcon = (method: reservationPaymentMethodEnum) => {
  switch (method) {
    case reservationPaymentMethodEnum.cash: return <Banknote className="h-4 w-4" />
    case reservationPaymentMethodEnum.mobile: return <Smartphone className="h-4 w-4" />
    case reservationPaymentMethodEnum.card: return <CreditCard className="h-4 w-4" />
    default: return <DollarSign className="h-4 w-4" />
  }
}

export const paymentMethodLabel = (method: reservationPaymentMethodEnum) => {
  switch (method) {
    case reservationPaymentMethodEnum.cash: return 'Espèces'
    case reservationPaymentMethodEnum.mobile: return 'Mobile Money'
    case reservationPaymentMethodEnum.card: return 'Carte bancaire'
    default: return method
  }
}

// ── Status badge ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: 'En attente', cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' },
  confirmed: { label: 'Confirmée', cls: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/50' },
  checked_in: { label: 'Client arrivé', cls: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' },
  no_show: { label: 'Absent', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  completed: { label: 'Terminée', cls: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' },
  canceled: { label: 'Annulée', cls: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

export function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

// ── Services list ─────────────────────────────────────────────────────────────

interface ServicesListProps {
  reservation: IReservation
  hairdressersMap: Record<string, IHairDresser>
  editable: boolean
  onChangeHairdresser: (personIndex: number) => void
}

export function ReservationServicesList({ reservation, hairdressersMap, editable, onChangeHairdresser }: ServicesListProps) {
  return (
    <div className="space-y-3">
      {reservation.people.map((person, idx) => {
        const hairdresser = person.hairdresserId ? hairdressersMap[String(person.hairdresserId)] : undefined
        return (
          <div key={idx} className="bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl p-4">
            {!reservation.isSingleReservation && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-2">
                Personne {person.personNumber}
              </p>
            )}
            <div className="space-y-2.5">
              <div className="flex justify-between text-[13px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{person.serviceName}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{person.servicePrice.toLocaleString()} XAF</span>
              </div>

              {/* Coiffeur */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-[#F0EAE4] dark:border-slate-700">
                {hairdresser?.photo ? (
                  <img src={hairdresser.photo} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Coiffeur assigné</p>
                  <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {hairdresser?.name ?? person.hairdresserName ?? 'Non assigné'}
                  </p>
                </div>
                {editable ? (
                  <button
                    type="button"
                    onClick={() => onChangeHairdresser(idx)}
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors flex-shrink-0"
                  >
                    {person.hairdresserId
                      ? <><Scissors className="h-3 w-3" />Changer</>
                      : <><UserPlus className="h-3 w-3" />Assigner</>}
                  </button>
                ) : (
                  <Scissors className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                )}
              </div>

              {/* Horaire */}
              <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {fmtDate(person.scheduledAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {fmtTime(person.scheduledAt)} - {fmtTime(person.endsAt)}
                </div>
              </div>

              {/* Suppléments */}
              {person.supplements && person.supplements.length > 0 && (
                <div className="pt-1">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-1.5">Suppléments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {person.supplements.map((sup, i) => (
                      <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#EDE8E3] dark:border-slate-700">
                        {sup.name} ({sup.price.toLocaleString()} XAF)
                      </span>
                    ))}
                  </div>
                  {person.supplementsTotalPrice > 0 && (
                    <p className="text-[11px] text-right mt-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      Total suppléments: {person.supplementsTotalPrice.toLocaleString()} XAF
                    </p>
                  )}
                </div>
              )}

              <div className="text-right text-[11px] border-t border-[#EDE8E3] dark:border-slate-700 pt-1.5">
                <p className="text-slate-400 dark:text-slate-500">Durée totale: {person.totalDuration}min</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
