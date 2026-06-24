'use client'

import React, { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import {
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  UserX
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zyra/ui/components/dropdown-menu'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum, reservationPaymentMethodEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { editDocument } from '@zyra/conf/lib/query'
import ReservationDetailsModal from './ReservationDetailsModal'
import ReservationConfirmModal from './ReservationConfirmModal'
import AssignHairdresserModal from './AssignHairdresserModal'
import { useUpdateReservationStatus, useUpdateReservationPayment } from '@/usecases/useReservations'

interface ReservationCardProps {
  reservation: IReservation
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const queryClient = useQueryClient()
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showAssignHairdresserModal, setShowAssignHairdresserModal] = useState(false)

  // Vérifier si la réservation a au moins un coiffeur associé
  const hasHairdresser = useMemo(() => {
    return reservation.people.some(person => person.hairdresserId)
  }, [reservation.people])

  // Mutations du useCase
  const updateStatusMutation = useUpdateReservationStatus()
  const updatePaymentMutation = useUpdateReservationPayment()

  const isConfirming = updateStatusMutation.isPending
  const isUpdatingPayment = updatePaymentMutation.isPending
  const isCanceling = updateStatusMutation.isPending
  const isCompleting = updateStatusMutation.isPending

  const getStatusBadge = (status: reservationStatusEnum) => {
    switch (status) {
      case reservationStatusEnum.pending:
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">En attente</Badge>
      case reservationStatusEnum.confirmed:
        return <Badge variant="default" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Confirmée</Badge>
      case reservationStatusEnum.completed:
        return <Badge variant="default" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Terminée</Badge>
      case reservationStatusEnum.canceled:
        return <Badge variant="destructive">Annulée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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

  const handleAssignHairdresser = async (hairdresser: IHairDresser) => {
    try {
      // Mettre à jour tous les people de la réservation avec le coiffeur
      const updatedPeople = reservation.people.map(person => ({
        ...person,
        hairdresserId: hairdresser.id
      }))
      await editDocument('reservations', reservation.id, {
        people: updatedPeople,
        updatedAt: new Date()
      })
      setShowAssignHairdresserModal(false)
      
      // Rafraîchir les données des réservations
      await queryClient.invalidateQueries({ queryKey: ['reservations'] })
    } catch (error) {
      console.error('Erreur lors de l\'assignation du coiffeur:', error)
      throw error
    }
  }

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate()
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get first person's info as summary
  const firstPerson = reservation.people[0]
  const startTime = firstPerson ? formatTime(firstPerson.scheduledAt) : ''
  const startDate = firstPerson ? formatDate(firstPerson.scheduledAt) : ''

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${!hasHairdresser ? 'border-orange-200 dark:border-orange-900/50' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Informations principales */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-base">#{reservation.reservationNumber}</h3>
                    {!hasHairdresser && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                        <UserX className="h-3 w-3" />
                        Sans coiffeur
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(reservation.status)}
                    {reservation.isPaid ? (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Payé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Non payé
                      </Badge>
                    )}
                    {reservation.isSingleReservation ? (
                      <Badge variant="outline" className="bg-blue-50">1 personne</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50">{reservation.people.length} personnes</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{reservation.totalPrice.toLocaleString()} XAF</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 justify-end">
                    {getPaymentMethodIcon(reservation.paymentMethod)}
                    <span>{getPaymentMethodLabel(reservation.paymentMethod)}</span>
                  </div>
                </div>
              </div>

              {/* Infos clés - Compact */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t dark:border-slate-700">
                {/* Client */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{reservation.clientName}</span>
                </div>

                {/* Téléphone */}
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{reservation.clientPhone}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{startDate}</span>
                </div>

                {/* Heure */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{startTime}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetailsModal(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les détails
                </DropdownMenuItem>

                {/* Bouton d'assignation de coiffeur si pas de coiffeur */}
                {!hasHairdresser && (
                  <DropdownMenuItem onClick={() => setShowAssignHairdresserModal(true)} className="text-orange-600">
                    <User className="h-4 w-4 mr-2" />
                    Assigner un coiffeur
                  </DropdownMenuItem>
                )}

                {/* Actions désactivées si pas de coiffeur */}
                {hasHairdresser && reservation.status === reservationStatusEnum.pending && (
                  <DropdownMenuItem onClick={() => setShowConfirmDialog(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </DropdownMenuItem>
                )}
                {hasHairdresser && reservation.status === reservationStatusEnum.confirmed && (
                  <>
                    <DropdownMenuItem onClick={() => setShowPaymentDialog(true)} disabled={reservation.isPaid}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Marquer comme payé
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowCompleteDialog(true)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Terminer
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem 
                  onClick={() => setShowCancelDialog(true)}
                  className="text-destructive"
                  disabled={reservation.status === reservationStatusEnum.canceled || 
                           reservation.status === reservationStatusEnum.completed}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <ReservationDetailsModal
        reservation={reservation}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      <ReservationConfirmModal
        open={showConfirmDialog}
        title="Confirmer la réservation"
        description="Êtes-vous sûr de vouloir confirmer cette réservation ?"
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmReservation}
        confirmLabel="Confirmer"
        loading={isConfirming}
        confirmVariant="default"
      />

      <ReservationConfirmModal
        open={showPaymentDialog}
        title="Marquer comme payé"
        description="Êtes-vous sûr de vouloir marquer cette réservation comme payée ?"
        onCancel={() => setShowPaymentDialog(false)}
        onConfirm={handleTogglePayment}
        confirmLabel="Marquer comme payé"
        loading={isUpdatingPayment}
        confirmVariant="default"
      />

      <ReservationConfirmModal
        open={showCancelDialog}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée."
        onCancel={() => setShowCancelDialog(false)}
        onConfirm={handleCancelReservation}
        confirmLabel="Annuler la réservation"
        loading={isCanceling}
        confirmVariant="destructive"
      />

      <ReservationConfirmModal
        open={showCompleteDialog}
        title="Terminer la réservation"
        description="Êtes-vous sûr de vouloir terminer cette réservation ?"
        onCancel={() => setShowCompleteDialog(false)}
        onConfirm={handleCompleteReservation}
        confirmLabel="Terminer"
        loading={isCompleting}
        confirmVariant="default"
      />

      <AssignHairdresserModal
        open={showAssignHairdresserModal}
        onOpenChange={setShowAssignHairdresserModal}
        onSelect={handleAssignHairdresser}
      />
    </>
  )
}
