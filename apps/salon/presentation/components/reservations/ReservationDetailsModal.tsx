'use client'

import React, { useMemo, useState } from 'react'
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
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import { ScrollArea } from '@zyra/ui/components/scroll-area'
import { Separator } from '@zyra/ui/components/separator'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  Smartphone,
  Banknote,
  CreditCard,
  CheckCircle,
  XCircle,
  MessageCircle,
  Scissors,
} from 'lucide-react'
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
}

export default function ReservationDetailsModal({
  reservation,
  open,
  onOpenChange,
}: ReservationDetailsModalProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  // Mutations du useCase
  const updateStatusMutation = useUpdateReservationStatus()
  const updatePaymentMutation = useUpdateReservationPayment()

  const isConfirming = updateStatusMutation.isPending
  const isUpdatingPayment = updatePaymentMutation.isPending
  const isCanceling = updateStatusMutation.isPending
  const isCompleting = updateStatusMutation.isPending

  const handleConfirmReservation = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        reservationId: reservation.id,
        currentStatus: reservation.status as reservationStatusEnum,
        newStatus: reservationStatusEnum.confirmed
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh]">
        <AlertDialogHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <AlertDialogTitle className="text-xl mb-2">Réservation #{reservation.reservationNumber}</AlertDialogTitle>
              {/* Boutons d'actions */}
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {reservation.status === reservationStatusEnum.pending && (
                  <Button
                    size="sm"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!hasHairdresser}
                    className={!hasHairdresser ? '' : 'bg-blue-600 hover:bg-blue-700'}
                    variant={!hasHairdresser ? 'secondary' : 'default'}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirmer
                  </Button>
                )}
                {reservation.status === reservationStatusEnum.confirmed && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setShowPaymentDialog(true)}
                      disabled={reservation.isPaid || !hasHairdresser}
                      variant={reservation.isPaid || !hasHairdresser ? 'secondary' : 'default'}
                      className={!reservation.isPaid && hasHairdresser ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      {reservation.isPaid ? 'Payée' : 'Marquer comme payé'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowCompleteDialog(true)}
                      disabled={!hasHairdresser}
                      variant={!hasHairdresser ? 'secondary' : 'default'}
                      className={!hasHairdresser ? '' : 'bg-green-600 hover:bg-green-700'}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Terminer
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={reservation.status === reservationStatusEnum.canceled || 
                           reservation.status === reservationStatusEnum.completed}
                  variant={reservation.status === reservationStatusEnum.canceled || 
                          reservation.status === reservationStatusEnum.completed ? 'secondary' : 'destructive'}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
              </div>
            </div>
            <AlertDialogCancel className="h-8 w-8 p-0">×</AlertDialogCancel>
          </div>
        </AlertDialogHeader>

        <ScrollArea className="h-[calc(90vh-150px)] pr-4">
          <div className="space-y-6">
            {/* CLIENT INFO */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Informations du client</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nom</p>
                    <p className="font-medium">{reservation.clientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{reservation.clientPhone}</p>
                  </div>
                </div>
                {reservation.clientEmail && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{reservation.clientEmail}</p>
                    </div>
                  </div>
                )}
                {reservation.isGuest && (
                  <Badge variant="outline" className="w-fit">Invité (pas de compte)</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* SERVICES DETAILS */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Services réservés</h3>
              <div className="space-y-4">
                {reservation.people.map((person, idx) => {
                    return (
                  <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                    {!reservation.isSingleReservation && (
                      <p className="text-xs text-muted-foreground mb-2">Personne {person.personNumber}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{person.serviceName}</span>
                        <span className="font-bold">{person.servicePrice.toLocaleString()} XAF</span>
                      </div>

                      {/* Hairdresser */}
                      {person.hairdresserId && (
                        (   ()=> {
                          const hairdresser =  getHairdresserInfo(String(person.hairdresserId))
                          return (
                            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                              {hairdresser?.photo && (
                                <img
                                  src={hairdresser.photo}
                                  alt={'Coiffeur'}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Coiffeur assigné</p>
                                <p className="font-semibold text-sm truncate">
                                  {hairdresser?.name}
                                </p>
                              </div>
                              <Scissors className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            </div>
                          )
                        })()
                      )}

                      {/* Horaires */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground mb-1">Suppléments:</p>
                          <div className="flex flex-wrap gap-1">
                            {person.supplements.map((sup, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {sup.name} ({sup.price.toLocaleString()} XAF)
                              </Badge>
                            ))}
                          </div>
                          {person.supplementsTotalPrice > 0 && (
                            <p className="text-xs text-right mt-1 font-medium">
                              Total suppléments: {person.supplementsTotalPrice.toLocaleString()} XAF
                            </p>
                          )}
                        </div>
                      )}

                      {/* Durée totale */}
                      <div className="text-right text-xs border-t pt-1">
                        <p className="text-muted-foreground">Durée totale: {person.totalDuration}min</p>
                      </div>
                    </div>
                  </div>
                )
                })}
              </div>
            </div>

            <Separator />

            {/* PAYMENT INFO */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Paiement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Montant total</p>
                  <p className="text-2xl font-bold text-primary">{reservation.totalPrice.toLocaleString()} XAF</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Méthode de paiement</p>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(reservation.paymentMethod)}
                    <span className="font-medium">{getPaymentMethodLabel(reservation.paymentMethod)}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 text-sm">
                    {reservation.isPaid ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">Payé</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-700">Non payé</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* NOTES */}
            {reservation.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">Notes</h3>
                  </div>
                  <p className="text-sm p-3 bg-muted rounded-md">{reservation.notes}</p>
                </div>
              </>
            )}

            {/* METADATA */}
            <Separator />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
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
        </ScrollArea>

        {/* Dialog de confirmation */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la réservation</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir confirmer cette réservation ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isConfirming}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmReservation}
                disabled={isConfirming}
                className="bg-green-600 hover:bg-green-700"
              >
                {isConfirming ? 'Confirmation...' : 'Confirmer'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de paiement */}
        <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Marquer comme payé</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir marquer cette réservation comme payée ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isUpdatingPayment}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleTogglePayment}
                disabled={isUpdatingPayment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdatingPayment ? 'Mise à jour...' : 'Marquer comme payé'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog d'annulation */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Annuler la réservation</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isCanceling}>Retour</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelReservation}
                disabled={isCanceling}
                className="bg-red-600 hover:bg-red-700"
              >
                {isCanceling ? 'Annulation...' : 'Annuler la réservation'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de finalisation */}
        <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Terminer la réservation</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir terminer cette réservation ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isCompleting}>Retour</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCompleteReservation}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700"
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
