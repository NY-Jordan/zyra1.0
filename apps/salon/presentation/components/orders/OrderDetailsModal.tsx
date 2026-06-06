'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import {
  User,
  Phone,
  Mail,
  Scissors,
  Users,
  Calendar,
  Banknote,
  Smartphone,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { IOrder } from '@zyra/conf/domain/entities/orders.entities'

interface OrderDetailsModalProps {
  order: IOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrderDetailsModal({ order, open, onOpenChange }: OrderDetailsModalProps) {
  if (!order) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">En attente</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Terminée</Badge>
      case 'canceled':
        return <Badge variant="destructive">Annulée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-5 w-5" />
      case 'mobile':
        return <Smartphone className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Espèces'
      case 'mobile':
        return 'Mobile Money'
      default:
        return method
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl">Détails de la commande</DialogTitle>
          <DialogDescription>
            Informations complètes sur la commande
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut et paiement */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              {order.isPaid ? (
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
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{order.totalPrice.toLocaleString()} XAF</p>
            </div>
          </div>

          {/* Service */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <Scissors className="h-5 w-5" />
              Service
            </h3>
            <div className="pl-7 space-y-2">
              <p className="text-lg font-medium">{order.serviceName}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-lg font-semibold">{formatTime(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Informations Client
            </h3>
            <div className="pl-7 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.clientPhone}</span>
              </div>
              {order.clientEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.clientEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Coiffeur */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Coiffeur
            </h3>
            <div className="pl-7">
              <p>{order.hairDresserName}</p>
            </div>
          </div>

          {/* Détails des prix */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Détails des prix
            </h3>
            <div className="pl-7 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix du service:</span>
                <span className="font-medium">{order.price.toLocaleString()} XAF</span>
              </div>
              {order.supplementsPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suppléments:</span>
                  <span className="font-medium">{order.supplementsPrice.toLocaleString()} XAF</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t dark:border-slate-700 text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-primary">{order.totalPrice.toLocaleString()} XAF</span>
              </div>
            </div>
          </div>

          {/* Suppléments */}
          {order.supplements && order.supplements.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Suppléments</h3>
              <div className="pl-7 flex flex-wrap gap-2">
                {order.supplements.map((supplement, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {supplement}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Paiement */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Méthode de paiement
            </h3>
            <div className="pl-7 flex items-center gap-2">
              {getPaymentMethodIcon(order.paymentMethod)}
              <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Notes</h3>
              <div className="pl-7">
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Date de création */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Date de création
            </h3>
            <div className="pl-7">
              <p>{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
