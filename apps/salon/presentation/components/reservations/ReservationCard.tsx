'use client'

import React from 'react'
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
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zyra/ui/components/dropdown-menu'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum, reservationPaymentMethodEnum } from '@zyra/conf/domain/enums/ReservationEnum'

interface ReservationCardProps {
  reservation: IReservation
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const getStatusBadge = (status: reservationStatusEnum) => {
    switch (status) {
      case reservationStatusEnum.pending:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">En attente</Badge>
      case reservationStatusEnum.confirmed:
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Confirmée</Badge>
      case reservationStatusEnum.completed:
        return <Badge variant="default" className="bg-green-100 text-green-700">Terminée</Badge>
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Informations principales */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">{reservation.serviceName}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(reservation.status)}
                  {reservation.isPaid ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Payé
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      Non payé
                    </Badge>
                  )}
                  {reservation.isGuest && (
                    <Badge variant="outline">Invité</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{reservation.price.toLocaleString()} XAF</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  {getPaymentMethodIcon(reservation.paymentMethod)}
                  <span>{getPaymentMethodLabel(reservation.paymentMethod)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Client */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{reservation.clientName}</span>
              </div>

              {/* Téléphone */}
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.clientPhone}</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(reservation.scheduledAt)}</span>
              </div>

              {/* Heure */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(reservation.scheduledAt)} - {formatTime(reservation.endsAt)}</span>
              </div>
            </div>

            {/* Suppléments */}
            {reservation.supplements && reservation.supplements.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">Suppléments:</p>
                <div className="flex flex-wrap gap-2">
                  {reservation.supplements.map((supplement, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {supplement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {reservation.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                <p className="text-sm">{reservation.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Voir les détails
              </DropdownMenuItem>
              {reservation.status === reservationStatusEnum.pending && (
                <DropdownMenuItem>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer
                </DropdownMenuItem>
              )}
              {reservation.status !== reservationStatusEnum.canceled && 
               reservation.status !== reservationStatusEnum.completed && (
                <DropdownMenuItem className="text-destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
