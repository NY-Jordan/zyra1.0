'use client'

import React from 'react'
import {
  Calendar, Clock, User, DollarSign, Smartphone, Banknote, CreditCard, Scissors, UserPlus,
  CheckCircle2, XCircle, LogIn, UserX, Award,
} from 'lucide-react'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationPaymentMethodEnum, reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { personStatus } from '@zyra/core/usecases/useReservations'
import { useNow } from '@/hooks/useNow'
import { useHasPermission } from '@/hooks/useHasPermission'

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

const PERSON_STATUS_LABEL: Record<string, string> = {
  pending: 'en attente',
  confirmed: 'confirmée(s)',
  checked_in: 'arrivée(s)',
  no_show: 'absente(s)',
  completed: 'terminée(s)',
  canceled: 'annulée(s)',
}

/**
 * Résumé "1 confirmée(s) · 2 en attente" pour une réservation groupée dont
 * les personnes n'ont pas toutes le même statut — le statut global affiché
 * seul (le plus "en retard") ne montre pas la progression déjà faite.
 * Retourne null pour une réservation à une personne ou un groupe homogène.
 */
export function personStatusBreakdown(reservation: Pick<IReservation, 'people' | 'status' | 'isSingleReservation'>): string | null {
  if (reservation.isSingleReservation || reservation.people.length <= 1) return null

  const counts = new Map<string, number>()
  reservation.people.forEach(p => {
    const s = personStatus(p, reservation)
    counts.set(s, (counts.get(s) ?? 0) + 1)
  })

  if (counts.size <= 1) return null

  return Array.from(counts.entries())
    .map(([status, count]) => `${count} ${PERSON_STATUS_LABEL[status] ?? status}`)
    .join(' · ')
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
  onConfirmPerson?: (personIndex: number) => void
  onCancelPerson?: (personIndex: number) => void
  onCheckInPerson?: (personIndex: number) => void
  onNoShowPerson?: (personIndex: number) => void
  onCompletePerson?: (personIndex: number) => void
}

const PERSON_ACTION_BTN = 'flex items-center justify-center h-6 w-6 rounded-full transition-colors'

export function ReservationServicesList({
  reservation, hairdressersMap, editable, onChangeHairdresser,
  onConfirmPerson, onCancelPerson, onCheckInPerson, onNoShowPerson, onCompletePerson,
}: ServicesListProps) {
  const now = useNow()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission('bookings.edit')
  const canCancelPermission = hasPermission('bookings.cancel')

  return (
    <div className="space-y-3">
      {reservation.people.map((person, idx) => {
        const hairdresser = person.hairdresserId ? hairdressersMap[String(person.hairdresserId)] : undefined
        const status = personStatus(person, reservation)

        // Même logique que useReservationActions (matrice du bandeau du haut),
        // appliquée au coiffeur/statut/horaire de CETTE personne uniquement.
        const hasStartedPerson = now >= person.scheduledAt.toDate().getTime()
        const isPendingP = status === reservationStatusEnum.pending
        const isConfirmedP = status === reservationStatusEnum.confirmed
        const isCheckedInP = status === reservationStatusEnum.checked_in
        const isActiveP = isPendingP || isConfirmedP

        const canConfirmPerson = editable && !!person.hairdresserId && !hasStartedPerson && isPendingP && canEdit
        const canCheckInPerson = editable && isConfirmedP && !hasStartedPerson && canEdit
        const canNoShowPerson = editable && (isConfirmedP || (isActiveP && hasStartedPerson)) && canEdit
        const canCompletePerson = editable && isCheckedInP && reservation.isPaid && canEdit
        const canCancelPerson = editable && isActiveP && !hasStartedPerson && canCancelPermission
        // Reprogrammer cette personne (coiffeur + date + heure) — même règle
        // que la reprogrammation globale d'avant : pas sur une personne déjà
        // dans un état final (completed/canceled), sauf no-show (rattrapable).
        const canReschedulePerson = editable && (isActiveP || status === reservationStatusEnum.no_show) && canEdit
        return (
          <div key={idx} className="bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl p-4">
            {!reservation.isSingleReservation && (
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">
                  Personne {person.personNumber}
                </p>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={status} />
                  {onConfirmPerson && canConfirmPerson && (
                    <button
                      type="button"
                      onClick={() => onConfirmPerson(idx)}
                      title="Confirmer cette personne"
                      className={`${PERSON_ACTION_BTN} bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/40`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onCheckInPerson && canCheckInPerson && (
                    <button
                      type="button"
                      onClick={() => onCheckInPerson(idx)}
                      title="Client arrivé"
                      className={`${PERSON_ACTION_BTN} bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40`}
                    >
                      <LogIn className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onNoShowPerson && canNoShowPerson && (
                    <button
                      type="button"
                      onClick={() => onNoShowPerson(idx)}
                      title="Client absent"
                      className={`${PERSON_ACTION_BTN} bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/40`}
                    >
                      <UserX className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onCompletePerson && canCompletePerson && (
                    <button
                      type="button"
                      onClick={() => onCompletePerson(idx)}
                      title="Terminer cette personne"
                      className={`${PERSON_ACTION_BTN} bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40`}
                    >
                      <Award className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onCancelPerson && canCancelPerson && (
                    <button
                      type="button"
                      onClick={() => onCancelPerson(idx)}
                      title="Annuler cette personne"
                      className={`${PERSON_ACTION_BTN} bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
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
                {canReschedulePerson ? (
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
