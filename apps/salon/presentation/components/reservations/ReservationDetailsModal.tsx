'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@zyra/ui/components/alert-dialog'
import { ScrollArea } from '@zyra/ui/components/scroll-area'
import { Calendar,Clock,User,Phone,Mail,DollarSign,Smartphone,Banknote,CreditCard,CheckCircle,XCircle,MessageCircle,Scissors,X,CalendarCheck } from 'lucide-react'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationPaymentMethodEnum, reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { useUpdateReservationStatus, useUpdateReservationPayment } from '@/usecases/useReservations'

interface ReservationDetailsModalProps {
  reservation: IReservation
  open: boolean
  onOpenChange: (open: boolean) => void
  onReservationUpdated?: (reservation: IReservation) => void
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: {
    label: 'En attente',
    cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  },
  confirmed: {
    label: 'Confirmée',
    cls: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/50',
  },
  completed: {
    label: 'Terminée',
    cls: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  },
  canceled: {
    label: 'Annulée',
    cls: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
  },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
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

export default function ReservationDetailsModal({
  reservation: initialReservation,
  open,
  onOpenChange,
  onReservationUpdated,
}: ReservationDetailsModalProps) {
  const [reservation, setReservation] = useState(initialReservation)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  useEffect(() => {
    setReservation(initialReservation)
  }, [initialReservation])

  // Mutations du useCase
  const updateStatusMutation = useUpdateReservationStatus()
  const updatePaymentMutation = useUpdateReservationPayment()

  const isConfirming = updateStatusMutation.isPending
  const isUpdatingPayment = updatePaymentMutation.isPending
  const isCanceling = updateStatusMutation.isPending
  const isCompleting = updateStatusMutation.isPending

  const syncUpdatedReservation = (updatedReservation: IReservation) => {
    setReservation(updatedReservation)
    onReservationUpdated?.(updatedReservation)
  }

  const handleConfirmReservation = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        reservationId: reservation.id,
        currentStatus: reservation.status as reservationStatusEnum,
        newStatus: reservationStatusEnum.confirmed
      })
      syncUpdatedReservation({
        ...reservation,
        status: reservationStatusEnum.confirmed,
      })
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error)
    }
  }

  const handleTogglePayment = async () => {
    try {
      await updatePaymentMutation.mutateAsync({
        reservationId: reservation.id,
        isPaid: true
      })
      syncUpdatedReservation({
        ...reservation,
        isPaid: true,
      })
      setShowPaymentDialog(false)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error)
    }
  }

  const handleCancelReservation = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        reservationId: reservation.id,
        currentStatus: reservation.status as reservationStatusEnum,
        newStatus: reservationStatusEnum.canceled
      })
      syncUpdatedReservation({
        ...reservation,
        status: reservationStatusEnum.canceled,
      })
      setShowCancelDialog(false)
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
    }
  }

  const handleCompleteReservation = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        reservationId: reservation.id,
        currentStatus: reservation.status as reservationStatusEnum,
        newStatus: reservationStatusEnum.completed
      })
      syncUpdatedReservation({
        ...reservation,
        status: reservationStatusEnum.completed,
      })
      setShowCompleteDialog(false)
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error)
    }
  }

  // Vérifier si la réservation a au moins un coiffeur associé
  const hasHairdresser = useMemo(() => {
    return reservation.people.some(person => person.hairdresserId)
  }, [reservation.people])

  const hairdresserIds = useMemo(() => {
    const ids = new Set<string>()
    reservation.people.forEach(person => {
      if (person.hairdresserId) {
        ids.add(person.hairdresserId)
      }
    })
    return Array.from(ids)
  }, [reservation.people])

  // Query pour récupérer tous les coiffeurs
  const { data: hairdressersData = [] } = useQuery({
    queryKey: ['hairdressers', hairdresserIds],
    queryFn: async () => {
      if (hairdresserIds.length === 0) return []
      try {
        const results = await fetchCollection('hair_dressers', [
          where('id', 'in', hairdresserIds)
        ])
        return results as IHairDresser[]
      } catch (error) {
        console.error('Erreur lors de la récupération des coiffeurs:', error)
        return []
      }
    },
    enabled: !!open && hairdresserIds.length > 0,
  })

  // Map des coiffeurs par ID
  const hairdressersMap = useMemo(() => {
    const map: Record<string, IHairDresser> = {}
    hairdressersData.forEach(hairdresser => {
      if (hairdresser.id) {
        map[hairdresser.id] = hairdresser
      }
    })
    return map
  }, [hairdressersData])

  const getHairdresserInfo = (hairdresserId?: string | null): IHairDresser | undefined => {
    if (!hairdresserId) return undefined
    return hairdressersMap[hairdresserId]
  }

  const getPaymentMethodIcon = (method: reservationPaymentMethodEnum) => {
    switch (method) {
      case reservationPaymentMethodEnum.cash:
        return <Banknote className="h-4 w-4" />
      case reservationPaymentMethodEnum.mobile:
        return <Smartphone className="h-4 w-4" />
      case reservationPaymentMethodEnum.card:
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: reservationPaymentMethodEnum) => {
    switch (method) {
      case reservationPaymentMethodEnum.cash:
        return 'Espèces'
      case reservationPaymentMethodEnum.mobile:
        return 'Mobile Money'
      case reservationPaymentMethodEnum.card:
        return 'Carte bancaire'
      default:
        return method
    }
  }

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate()
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const actionButtonBase = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

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
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={reservation.status} />
                  {reservation.isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3" />
                      Payé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50">
                      <XCircle className="h-3 w-3" />
                      Non payé
                    </span>
                  )}
                </div>
              </div>
            </div>
            <AlertDialogCancel className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0 border-0 p-0 h-7">
              <X className="w-3.5 h-3.5" />
            </AlertDialogCancel>
          </div>

          {/* Boutons d'actions */}
          <div className="flex items-center gap-2 flex-wrap mt-4">
            {reservation.status === reservationStatusEnum.pending && (
              <button
                type="button"
                onClick={() => setShowConfirmDialog(true)}
                disabled={!hasHairdresser}
                className={`${actionButtonBase} ${!hasHairdresser ? 'bg-[#F5F2EF] dark:bg-slate-700/50 text-slate-400 dark:text-slate-500' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Confirmer
              </button>
            )}
            {reservation.status === reservationStatusEnum.confirmed && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPaymentDialog(true)}
                  disabled={reservation.isPaid || !hasHairdresser}
                  className={`${actionButtonBase} ${reservation.isPaid || !hasHairdresser ? 'bg-[#F5F2EF] dark:bg-slate-700/50 text-slate-400 dark:text-slate-500' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  {reservation.isPaid ? 'Payée' : 'Marquer comme payé'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={!hasHairdresser}
                  className={`${actionButtonBase} ${!hasHairdresser ? 'bg-[#F5F2EF] dark:bg-slate-700/50 text-slate-400 dark:text-slate-500' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Terminer
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowCancelDialog(true)}
              disabled={reservation.status === reservationStatusEnum.canceled ||
                       reservation.status === reservationStatusEnum.completed}
              className={`${actionButtonBase} ${reservation.status === reservationStatusEnum.canceled ||
                       reservation.status === reservationStatusEnum.completed ? 'bg-[#F5F2EF] dark:bg-slate-700/50 text-slate-400 dark:text-slate-500' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Annuler
            </button>
          </div>
        </AlertDialogHeader>

        <ScrollArea className="h-[calc(90vh-150px)] px-6 py-5">
          <div className="space-y-5">
            {/* CLIENT INFO */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Informations du client</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Nom" value={reservation.clientName} />
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone" value={reservation.clientPhone} />
                {reservation.clientEmail && (
                  <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={reservation.clientEmail} />
                )}
                {reservation.isGuest && (
                  <span className="inline-flex items-center w-fit text-[10px] font-bold px-2.5 py-1 rounded-full border bg-[#F5F2EF] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-[#EDE8E3] dark:border-slate-700">
                    Invité (pas de compte)
                  </span>
                )}
              </div>
            </div>

            {/* SERVICES DETAILS */}
            <div className="space-y-3 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3">Services réservés</h3>
              <div className="space-y-3">
                {reservation.people.map((person, idx) => {
                    return (
                  <div key={idx} className="bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl p-4">
                    {!reservation.isSingleReservation && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-2">Personne {person.personNumber}</p>
                    )}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[13px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{person.serviceName}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{person.servicePrice.toLocaleString()} XAF</span>
                      </div>

                      {/* Hairdresser */}
                      {person.hairdresserId && (
                        (   ()=> {
                          const hairdresser =  getHairdresserInfo(String(person.hairdresserId))
                          return (
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-[#F0EAE4] dark:border-slate-700">
                              {hairdresser?.photo && (
                                <img
                                  src={hairdresser.photo}
                                  alt={'Coiffeur'}
                                  className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Coiffeur assigné</p>
                                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                                  {hairdresser?.name}
                                </p>
                              </div>
                              <Scissors className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            </div>
                          )
                        })()
                      )}

                      {/* Horaires */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(person.scheduledAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(person.scheduledAt)} - {formatTime(person.endsAt)}
                        </div>
                      </div>

                      {/* Supplements */}
                      {person.supplements && person.supplements.length > 0 && (
                        <div className="pt-1">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-1.5">Suppléments</p>
                          <div className="flex flex-wrap gap-1.5">
                            {person.supplements.map((sup, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#EDE8E3] dark:border-slate-700"
                              >
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

                      {/* Durée totale */}
                      <div className="text-right text-[11px] border-t border-[#EDE8E3] dark:border-slate-700 pt-1.5">
                        <p className="text-slate-400 dark:text-slate-500">Durée totale: {person.totalDuration}min</p>
                      </div>
                    </div>
                  </div>
                )
                })}
              </div>
            </div>

            {/* PAYMENT INFO */}
            <div className="space-y-3 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3">Paiement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-1">Montant total</p>
                  <p className="text-[22px] font-extrabold text-emerald-600 dark:text-emerald-400">{reservation.totalPrice.toLocaleString()} XAF</p>
                </div>
                <InfoRow
                  icon={getPaymentMethodIcon(reservation.paymentMethod)}
                  label="Méthode de paiement"
                  value={getPaymentMethodLabel(reservation.paymentMethod)}
                />
                <div className="sm:col-span-2">
                  {reservation.isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3" />
                      Payé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50">
                      <XCircle className="h-3 w-3" />
                      Non payé
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* NOTES */}
            {reservation.notes && (
              <div className="space-y-2 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Notes
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{reservation.notes}</p>
              </div>
            )}

            {/* METADATA */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <div className="flex items-center gap-2 pt-3">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  Créée le{' '}
                  {reservation.createdAt.toDate().toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Dialog de confirmation */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="rounded-2xl border-[#F0EAE4] dark:border-slate-800/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white">
                Confirmer la réservation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[13px]">
                Êtes-vous sûr de vouloir confirmer cette réservation ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isConfirming} className="rounded-xl text-[12px]">Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmReservation}
                disabled={isConfirming}
                className="rounded-xl text-[12px] bg-sky-500 hover:bg-sky-600"
              >
                {isConfirming ? 'Confirmation...' : 'Confirmer'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de paiement */}
        <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <AlertDialogContent className="rounded-2xl border-[#F0EAE4] dark:border-slate-800/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white">
                Marquer comme payé
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[13px]">
                Êtes-vous sûr de vouloir marquer cette réservation comme payée ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isUpdatingPayment} className="rounded-xl text-[12px]">Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleTogglePayment}
                disabled={isUpdatingPayment}
                className="rounded-xl text-[12px] bg-sky-500 hover:bg-sky-600"
              >
                {isUpdatingPayment ? 'Mise à jour...' : 'Marquer comme payé'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog d'annulation */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="rounded-2xl border-[#F0EAE4] dark:border-slate-800/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white">
                Annuler la réservation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[13px]">
                Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isCanceling} className="rounded-xl text-[12px]">Retour</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelReservation}
                disabled={isCanceling}
                className="rounded-xl text-[12px] bg-rose-500 hover:bg-rose-600"
              >
                {isCanceling ? 'Annulation...' : 'Annuler la réservation'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de finalisation */}
        <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <AlertDialogContent className="rounded-2xl border-[#F0EAE4] dark:border-slate-800/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white">
                Terminer la réservation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[13px]">
                Êtes-vous sûr de vouloir terminer cette réservation ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isCompleting} className="rounded-xl text-[12px]">Retour</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCompleteReservation}
                disabled={isCompleting}
                className="rounded-xl text-[12px] bg-emerald-500 hover:bg-emerald-600"
              >
                {isCompleting ? 'Finalisation...' : 'Terminer'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </AlertDialogContent>
    </AlertDialog>
  )
}
