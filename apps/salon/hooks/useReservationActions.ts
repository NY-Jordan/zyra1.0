'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { editDocument } from '@zyra/conf/lib/query'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { useUpdateReservationStatus, useUpdateReservationPayment } from '@/usecases/useReservations'
import { useSalon } from '@/hooks/useSalon'
import { useNow } from '@/hooks/useNow'
import { useHasPermission } from '@/hooks/useHasPermission'
import { logActivity, createNotification, getCurrentActor } from '@/usecases/notificationsUseCases'

/**
 * Toute la logique métier des actions sur une réservation (machine à états +
 * verrouillage à l'heure de début + handlers + état des dialogues), centralisée
 * pour être réutilisée par la carte ET le modal de détails.
 *
 * @param reservation la réservation concernée
 * @param opts.onUpdated callback optimiste (le modal de détails met à jour son état local)
 */
export function useReservationActions(
  reservation: IReservation,
  opts?: { onUpdated?: (reservation: IReservation) => void },
) {
  const queryClient = useQueryClient()
  const { salon } = useSalon()
  const now = useNow()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission('bookings.edit')
  const canCancelPermission = hasPermission('bookings.cancel')
  const canManagePayments = hasPermission('payments.manage')

  const updateStatusMutation = useUpdateReservationStatus()
  const updatePaymentMutation = useUpdateReservationPayment()

  // ── Dialog visibility ─────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showNoShow, setShowNoShow] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)
  const [showAssign, setShowAssign] = useState(false)

  // ── Derived state ─────────────────────────────────────────────────
  const hasHairdresser = useMemo(
    () => reservation.people.some(p => p.hairdresserId),
    [reservation.people],
  )

  const startMs = useMemo(() => {
    const ts = reservation.earliestScheduledAt ?? reservation.people?.[0]?.scheduledAt
    return ts ? ts.toDate().getTime() : 0
  }, [reservation.earliestScheduledAt, reservation.people])
  const hasStarted = startMs > 0 && now >= startMs

  const status = reservation.status
  const isPending = status === reservationStatusEnum.pending
  const isConfirmed = status === reservationStatusEnum.confirmed
  const isCheckedIn = status === reservationStatusEnum.checked_in
  const isNoShow = status === reservationStatusEnum.no_show
  const isActive = isPending || isConfirmed

  // ── Matrice d'actions (process validé + permissions du rôle) ───────
  const canAssign = !hasHairdresser && !hasStarted && isActive && canEdit
  const canConfirm = hasHairdresser && !hasStarted && isPending && canEdit
  const canCheckIn = isConfirmed && !hasStarted && canEdit
  const canNoShow = (isConfirmed || (isActive && hasStarted)) && canEdit
  const canReschedule = (isActive || isNoShow) && canEdit
  const canCancel = isActive && !hasStarted && canCancelPermission
  const canMarkPaid = isCheckedIn && !reservation.isPaid && canManagePayments
  const canComplete = isCheckedIn && reservation.isPaid && canEdit
  const hasAnyAction =
    canAssign || canConfirm || canCheckIn || canNoShow || canReschedule || canCancel || canMarkPaid || canComplete

  const busy = updateStatusMutation.isPending || updatePaymentMutation.isPending

  const reservationLabel = `Réservation #${reservation.reservationNumber} · ${reservation.clientName}`
  const logContext = salon?.id
    ? { salonId: salon.id, ...getCurrentActor(), resourceLabel: reservationLabel }
    : undefined

  // ── Handlers ──────────────────────────────────────────────────────
  const setStatus = async (newStatus: reservationStatusEnum, extra?: { startMs?: number }) => {
    await updateStatusMutation.mutateAsync({
      reservationId: reservation.id,
      currentStatus: status as reservationStatusEnum,
      newStatus,
      logContext,
      ...extra,
    })
    opts?.onUpdated?.({ ...reservation, status: newStatus })
  }

  const confirm = async () => {
    await setStatus(reservationStatusEnum.confirmed, { startMs })
    setShowConfirm(false)
  }
  const checkIn = async () => {
    await setStatus(reservationStatusEnum.checked_in)
    setShowCheckIn(false)
  }
  const noShow = async () => {
    await setStatus(reservationStatusEnum.no_show)
    setShowNoShow(false)
  }
  const cancel = async () => {
    await setStatus(reservationStatusEnum.canceled)
    setShowCancel(false)
  }
  const complete = async () => {
    await setStatus(reservationStatusEnum.completed)
    setShowComplete(false)
  }

  const markPaid = async () => {
    await updatePaymentMutation.mutateAsync({ reservationId: reservation.id, isPaid: true, logContext })
    opts?.onUpdated?.({ ...reservation, isPaid: true })
    setShowPayment(false)
  }

  /** Assigne le même coiffeur à toutes les personnes de la réservation. */
  const assignHairdresser = async (hairdresser: IHairDresser) => {
    const updatedPeople = reservation.people.map(p => ({ ...p, hairdresserId: hairdresser.id, hairdresserName: hairdresser.name }))
    await editDocument('reservations', reservation.id, { people: updatedPeople, updatedAt: new Date() })
    if (logContext) {
      await Promise.all([
        logActivity({ ...logContext, type: 'reservation_hairdresser_changed', action: 'hairdresser_changed', resourceId: reservation.id, resourceType: 'reservation', metadata: { hairdresser: hairdresser.name } }),
        createNotification({ salonId: logContext.salonId, type: 'reservation_hairdresser_changed', title: 'Coiffeur assigné', body: `${reservationLabel} → ${hairdresser.name}`, resourceId: reservation.id, resourceType: 'reservation' }),
      ])
    }
    opts?.onUpdated?.({ ...reservation, people: updatedPeople as IReservation['people'] })
    setShowAssign(false)
    await queryClient.invalidateQueries({ queryKey: ['reservations'] })
  }

  return {
    // état
    reservation, hasHairdresser, hasStarted, busy, reservationLabel,
    // capacités
    canAssign, canConfirm, canCheckIn, canNoShow, canReschedule, canCancel, canMarkPaid, canComplete, hasAnyAction,
    // dialogues
    showConfirm, setShowConfirm,
    showPayment, setShowPayment,
    showCancel, setShowCancel,
    showComplete, setShowComplete,
    showCheckIn, setShowCheckIn,
    showNoShow, setShowNoShow,
    showReschedule, setShowReschedule,
    showAssign, setShowAssign,
    // handlers
    confirm, checkIn, noShow, cancel, complete, markPaid, assignHairdresser,
  }
}

export type ReservationActions = ReturnType<typeof useReservationActions>
