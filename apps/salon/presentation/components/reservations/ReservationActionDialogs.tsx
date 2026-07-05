'use client'

import React from 'react'
import ReservationConfirmModal from './ReservationConfirmModal'
import RescheduleModal from './RescheduleModal'
import AssignHairdresserModal from './AssignHairdresserModal'
import type { ReservationActions } from '@/hooks/useReservationActions'

/**
 * Toutes les modales d'action d'une réservation, pilotées par useReservationActions.
 * Partagé entre la carte et le modal de détails — un seul endroit à maintenir.
 */
export default function ReservationActionDialogs({ actions: a }: { actions: ReservationActions }) {
  return (
    <>
      <ReservationConfirmModal
        open={a.showConfirm}
        title="Confirmer la réservation"
        description="Êtes-vous sûr de vouloir confirmer cette réservation ?"
        onCancel={() => a.setShowConfirm(false)}
        onConfirm={a.confirm}
        confirmLabel="Confirmer"
        loading={a.busy}
        confirmVariant="default"
      />

      <ReservationConfirmModal
        open={a.showPayment}
        title="Marquer comme payé"
        description="Êtes-vous sûr de vouloir marquer cette réservation comme payée ?"
        onCancel={() => a.setShowPayment(false)}
        onConfirm={a.markPaid}
        confirmLabel="Marquer comme payé"
        loading={a.busy}
        confirmVariant="default"
      />

      <ReservationConfirmModal
        open={a.showCheckIn}
        title="Client arrivé"
        description="Confirmer que le client est présent au salon ?"
        onCancel={() => a.setShowCheckIn(false)}
        onConfirm={a.checkIn}
        confirmLabel="Client arrivé"
        loading={a.busy}
        confirmVariant="default"
      />

      <ReservationConfirmModal
        open={a.showNoShow}
        title="Client absent"
        description="Marquer ce rendez-vous comme absence (no-show) ? Cette action est définitive."
        onCancel={() => a.setShowNoShow(false)}
        onConfirm={a.noShow}
        confirmLabel="Marquer absent"
        loading={a.busy}
        confirmVariant="destructive"
      />

      <ReservationConfirmModal
        open={a.showCancel}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler cette réservation ? Le créneau sera libéré. Cette action est irréversible."
        onCancel={() => a.setShowCancel(false)}
        onConfirm={a.cancel}
        confirmLabel="Annuler la réservation"
        loading={a.busy}
        confirmVariant="destructive"
      />

      <ReservationConfirmModal
        open={a.showComplete}
        title="Terminer la réservation"
        description="Êtes-vous sûr de vouloir terminer cette réservation ?"
        onCancel={() => a.setShowComplete(false)}
        onConfirm={a.complete}
        confirmLabel="Terminer"
        loading={a.busy}
        confirmVariant="default"
      />

      <RescheduleModal
        open={a.showReschedule}
        onOpenChange={a.setShowReschedule}
        reservation={a.reservation}
      />

      <AssignHairdresserModal
        open={a.showAssign}
        onOpenChange={a.setShowAssign}
        onSelect={a.assignHairdresser}
      />
    </>
  )
}
