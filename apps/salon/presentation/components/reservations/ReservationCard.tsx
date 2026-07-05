'use client'

import React, { useState } from 'react'
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
  UserX,
  LogIn,
  CalendarClock,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zyra/ui/components/dropdown-menu'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum, reservationPaymentMethodEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import ReservationDetailsModal from './ReservationDetailsModal'
import ReservationActionDialogs from './ReservationActionDialogs'
import { useReservationActions } from '@/hooks/useReservationActions'

interface ReservationCardProps {
  reservation: IReservation
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const a = useReservationActions(reservation)

  const getStatusBadge = (status: reservationStatusEnum) => {
    switch (status) {
      case reservationStatusEnum.pending:
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">En attente</Badge>
      case reservationStatusEnum.confirmed:
        return <Badge variant="default" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Confirmée</Badge>
      case reservationStatusEnum.checked_in:
        return <Badge variant="default" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Client arrivé</Badge>
      case reservationStatusEnum.no_show:
        return <Badge variant="default" className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Absent</Badge>
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
      case reservationPaymentMethodEnum.cash: return <Banknote className="h-4 w-4" />
      case reservationPaymentMethodEnum.mobile: return <Smartphone className="h-4 w-4" />
      case reservationPaymentMethodEnum.card: return <CreditCard className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: reservationPaymentMethodEnum) => {
    switch (method) {
      case reservationPaymentMethodEnum.cash: return 'Espèces'
      case reservationPaymentMethodEnum.mobile: return 'Mobile Money'
      case reservationPaymentMethodEnum.card: return 'Carte bancaire'
      default: return method
    }
  }

  const formatDate = (timestamp: any) =>
    timestamp.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatTime = (timestamp: any) =>
    timestamp.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const firstPerson = reservation.people[0]
  const startTime = firstPerson ? formatTime(firstPerson.scheduledAt) : ''
  const startDate = firstPerson ? formatDate(firstPerson.scheduledAt) : ''

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${!a.hasHairdresser ? 'border-orange-200 dark:border-orange-900/50' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Informations principales */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-base">#{reservation.reservationNumber}</h3>
                    {reservation.wasRescheduled && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                        <CalendarClock className="h-3 w-3" />
                        Reprogrammée
                      </span>
                    )}
                    {!a.hasHairdresser && (
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
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{reservation.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{reservation.clientPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{startDate}</span>
                </div>
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

                {a.canAssign && (
                  <DropdownMenuItem onClick={() => a.setShowAssign(true)} className="text-orange-600">
                    <User className="h-4 w-4 mr-2" />
                    Assigner un coiffeur
                  </DropdownMenuItem>
                )}
                {a.canConfirm && (
                  <DropdownMenuItem onClick={() => a.setShowConfirm(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </DropdownMenuItem>
                )}
                {a.canCheckIn && (
                  <DropdownMenuItem onClick={() => a.setShowCheckIn(true)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Client arrivé
                  </DropdownMenuItem>
                )}
                {a.canNoShow && (
                  <DropdownMenuItem onClick={() => a.setShowNoShow(true)} className="text-orange-600">
                    <UserX className="h-4 w-4 mr-2" />
                    Client absent
                  </DropdownMenuItem>
                )}
                {a.canReschedule && (
                  <DropdownMenuItem onClick={() => a.setShowReschedule(true)}>
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Reprogrammer
                  </DropdownMenuItem>
                )}
                {a.canMarkPaid && (
                  <DropdownMenuItem onClick={() => a.setShowPayment(true)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Marquer comme payé
                  </DropdownMenuItem>
                )}
                {a.canComplete && (
                  <DropdownMenuItem onClick={() => a.setShowComplete(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer
                  </DropdownMenuItem>
                )}
                {a.canCancel && (
                  <DropdownMenuItem onClick={() => a.setShowCancel(true)} className="text-destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Annuler
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <ReservationDetailsModal
        reservation={reservation}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      <ReservationActionDialogs actions={a} />
    </>
  )
}
