'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@zyra/ui/components/alert-dialog'
import { ScrollArea } from '@zyra/ui/components/scroll-area'
import {
  Calendar, User, Phone, Mail, CheckCircle, XCircle, MessageCircle, X, CalendarCheck,
  CheckCircle as CheckIcon, LogIn, UserX, CalendarClock, DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { useReservationActions } from '@/hooks/useReservationActions'
import { useUpdatePersonStatus } from '@zyra/core/usecases/useReservations'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { getCurrentActor } from '@zyra/core/usecases/notificationsUseCases'
import ReservationActionDialogs from './ReservationActionDialogs'
import ReservationConfirmModal from './ReservationConfirmModal'
import ChangeHairdresserDialog from './ChangeHairdresserDialog'
import {
  StatusBadge, InfoRow, ReservationServicesList,
  fmtDate, paymentMethodIcon, paymentMethodLabel, personStatusBreakdown,
} from './ReservationDetailsParts'

interface ReservationDetailsModalProps {
  reservation: IReservation
  open: boolean
  onOpenChange: (open: boolean) => void
  onReservationUpdated?: (reservation: IReservation) => void
}

const actionBtn =
  'inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold transition-colors text-white'

export default function ReservationDetailsModal({
  reservation: initialReservation,
  open,
  onOpenChange,
  onReservationUpdated,
}: ReservationDetailsModalProps) {
  const [reservation, setReservation] = useState(initialReservation)
  const [changingPersonIdx, setChangingPersonIdx] = useState<number | null>(null)
  const [personAction, setPersonAction] = useState<{ index: number; type: 'confirm' | 'cancel' | 'checkin' | 'noshow' | 'complete' } | null>(null)

  useEffect(() => { setReservation(initialReservation) }, [initialReservation])

  const syncUpdated = (updated: IReservation) => {
    setReservation(updated)
    onReservationUpdated?.(updated)
  }

  // Toute la machine à états + handlers (partagée avec la carte)
  const a = useReservationActions(reservation, { onUpdated: syncUpdated })

  // Confirmation / annulation d'UNE personne, sans affecter les autres
  const { salon } = useSalon()
  const updatePersonStatus = useUpdatePersonStatus()
  const PERSON_ACTION_STATUS: Record<NonNullable<typeof personAction>['type'], reservationStatusEnum> = {
    confirm: reservationStatusEnum.confirmed,
    cancel: reservationStatusEnum.canceled,
    checkin: reservationStatusEnum.checked_in,
    noshow: reservationStatusEnum.no_show,
    complete: reservationStatusEnum.completed,
  }
  const PERSON_ACTION_LABEL: Record<NonNullable<typeof personAction>['type'], string> = {
    confirm: 'Confirmer cette personne',
    cancel: 'Annuler cette personne',
    checkin: 'Marquer cette personne comme arrivée',
    noshow: 'Marquer cette personne comme absente',
    complete: 'Terminer cette personne',
  }
  const PERSON_ACTION_SUCCESS: Record<NonNullable<typeof personAction>['type'], string> = {
    confirm: 'Personne confirmée',
    cancel: 'Personne annulée',
    checkin: 'Personne marquée comme arrivée',
    noshow: 'Personne marquée comme absente',
    complete: 'Personne marquée comme terminée',
  }
  const personActionLabel = personAction ? PERSON_ACTION_LABEL[personAction.type] : ''
  const handlePersonAction = async () => {
    if (!personAction) return
    const newStatus = PERSON_ACTION_STATUS[personAction.type]
    try {
      const result = await updatePersonStatus.mutateAsync({
        reservation,
        personIndex: personAction.index,
        newStatus,
        logContext: salon?.id
          ? { salonId: salon.id, ...getCurrentActor(), resourceLabel: `Réservation #${reservation.reservationNumber} · ${reservation.clientName}` }
          : undefined,
      })
      syncUpdated({ ...reservation, people: result.updatedPeople, status: result.newGroupStatus })
      setPersonAction(null)
      toast.success(PERSON_ACTION_SUCCESS[personAction.type])
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la personne:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
  }

  // Coiffeurs assignés → infos d'affichage
  const hairdresserIds = useMemo(() => {
    const ids = new Set<string>()
    reservation.people.forEach(p => { if (p.hairdresserId) ids.add(p.hairdresserId) })
    return Array.from(ids)
  }, [reservation.people])

  const { data: hairdressersData = [] } = useQuery({
    queryKey: ['hairdressers', hairdresserIds],
    queryFn: async () => {
      if (hairdresserIds.length === 0) return []
      try {
        return await fetchCollection('hair_dressers', [where('id', 'in', hairdresserIds)]) as IHairDresser[]
      } catch { return [] }
    },
    enabled: !!open && hairdresserIds.length > 0,
  })

  const hairdressersMap = useMemo(() => {
    const map: Record<string, IHairDresser> = {}
    hairdressersData.forEach(hd => { if (hd.id) map[hd.id] = hd })
    return map
  }, [hairdressersData])

  const isEditable =
    reservation.status !== reservationStatusEnum.canceled &&
    reservation.status !== reservationStatusEnum.completed &&
    reservation.status !== reservationStatusEnum.no_show

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0 max-h-[90vh]">

        {/* Header */}
        <AlertDialogHeader className="px-6 pt-6 pb-4 border-b border-[#F0EAE4] dark:border-slate-800/50 gap-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight">
                  Réservation #{reservation.reservationNumber}
                </AlertDialogTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge status={reservation.status} />
                  {personStatusBreakdown(reservation) && (
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      {personStatusBreakdown(reservation)}
                    </span>
                  )}
                  {reservation.wasRescheduled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/50">
                      <CalendarClock className="h-3 w-3" />Reprogrammée
                    </span>
                  )}
                  {reservation.isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3" />Payé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50">
                      <XCircle className="h-3 w-3" />Non payé
                    </span>
                  )}
                </div>
              </div>
            </div>
            <AlertDialogCancel className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0 border-0 p-0 h-7">
              <X className="w-3.5 h-3.5" />
            </AlertDialogCancel>
          </div>

          {/* Actions — même process que la carte (useReservationActions) */}
          <div className="flex items-center gap-2 flex-wrap mt-4">
            {a.canConfirm && (
              <button type="button" onClick={() => a.setShowConfirm(true)} className={`${actionBtn} bg-sky-500 hover:bg-sky-600`}>
                <CheckIcon className="h-3.5 w-3.5" />Confirmer
              </button>
            )}
            {a.canCheckIn && (
              <button type="button" onClick={() => a.setShowCheckIn(true)} className={`${actionBtn} bg-emerald-500 hover:bg-emerald-600`}>
                <LogIn className="h-3.5 w-3.5" />Client arrivé
              </button>
            )}
            {a.canNoShow && (
              <button type="button" onClick={() => a.setShowNoShow(true)} className={`${actionBtn} bg-orange-500 hover:bg-orange-600`}>
                <UserX className="h-3.5 w-3.5" />Client absent
              </button>
            )}
            {a.canReschedule && (
              <button type="button" onClick={() => a.setShowReschedule(true)} className={`${actionBtn} bg-violet-500 hover:bg-violet-600`}>
                <CalendarClock className="h-3.5 w-3.5" />Reprogrammer
              </button>
            )}
            {a.canMarkPaid && (
              <button type="button" onClick={() => a.setShowPayment(true)} className={`${actionBtn} bg-sky-500 hover:bg-sky-600`}>
                <DollarSign className="h-3.5 w-3.5" />Marquer comme payé
              </button>
            )}
            {a.canComplete && (
              <button type="button" onClick={() => a.setShowComplete(true)} className={`${actionBtn} bg-emerald-500 hover:bg-emerald-600`}>
                <CheckIcon className="h-3.5 w-3.5" />Terminer
              </button>
            )}
            {a.canCancel && (
              <button type="button" onClick={() => a.setShowCancel(true)} className={`${actionBtn} bg-rose-500 hover:bg-rose-600`}>
                <XCircle className="h-3.5 w-3.5" />Annuler
              </button>
            )}
          </div>
        </AlertDialogHeader>

        <ScrollArea className="h-[calc(90vh-150px)] px-6 py-5">
          <div className="space-y-5">

            {/* CLIENT */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Informations du client</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Nom" value={reservation.clientName} />
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone" value={reservation.clientPhone} />
                {reservation.clientEmail && <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={reservation.clientEmail} />}
                {reservation.isGuest && (
                  <span className="inline-flex items-center w-fit text-[10px] font-bold px-2.5 py-1 rounded-full border bg-[#F5F2EF] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-[#EDE8E3] dark:border-slate-700">
                    Invité (pas de compte)
                  </span>
                )}
              </div>
            </div>

            {/* SERVICES */}
            <div className="space-y-3 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3">Services réservés</h3>
              <ReservationServicesList
                reservation={reservation}
                hairdressersMap={hairdressersMap}
                editable={isEditable}
                onChangeHairdresser={setChangingPersonIdx}
                onConfirmPerson={(index) => setPersonAction({ index, type: 'confirm' })}
                onCancelPerson={(index) => setPersonAction({ index, type: 'cancel' })}
                onCheckInPerson={(index) => setPersonAction({ index, type: 'checkin' })}
                onNoShowPerson={(index) => setPersonAction({ index, type: 'noshow' })}
                onCompletePerson={(index) => setPersonAction({ index, type: 'complete' })}
              />
            </div>

            {/* PAYMENT */}
            <div className="space-y-3 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3">Paiement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-1">Montant total</p>
                  <p className="text-[22px] font-extrabold text-emerald-600 dark:text-emerald-400">{reservation.totalPrice.toLocaleString()} XAF</p>
                </div>
                <InfoRow icon={paymentMethodIcon(reservation.paymentMethod)} label="Méthode de paiement" value={paymentMethodLabel(reservation.paymentMethod)} />
              </div>
            </div>

            {/* NOTES */}
            {reservation.notes && (
              <div className="space-y-2 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />Notes
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{reservation.notes}</p>
              </div>
            )}

            {/* METADATA */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <div className="flex items-center gap-2 pt-3">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[12px] text-slate-500 dark:text-slate-400">Créée le {fmtDate(reservation.createdAt)}</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Dialogues d'action partagés */}
        <ReservationActionDialogs actions={a} />

        {/* Changement de coiffeur (par personne) */}
        <ChangeHairdresserDialog
          open={changingPersonIdx !== null}
          onOpenChange={o => { if (!o) setChangingPersonIdx(null) }}
          reservation={reservation}
          personIndex={changingPersonIdx}
          onUpdated={syncUpdated}
        />

        {/* Confirmation / annulation d'une personne */}
        <ReservationConfirmModal
          open={personAction !== null}
          title={personActionLabel}
          description={
            personAction
              ? `Personne ${reservation.people[personAction.index]?.personNumber} — ${reservation.people[personAction.index]?.serviceName}. ${
                  personAction.type === 'cancel'
                    ? 'Le créneau de cette personne sera libéré. '
                    : ''
                }Les autres personnes de la réservation ne sont pas affectées.`
              : ''
          }
          onCancel={() => setPersonAction(null)}
          onConfirm={handlePersonAction}
          confirmLabel={personActionLabel}
          loading={updatePersonStatus.isPending}
          confirmVariant={personAction?.type === 'cancel' ? 'destructive' : 'default'}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}
