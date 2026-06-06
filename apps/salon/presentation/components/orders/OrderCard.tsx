'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import {
  User,
  Clock,
  DollarSign,
  Scissors,
  CheckCircle,
  XCircle,
  Eye,
  Banknote,
  Smartphone,
  Trash2
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@zyra/ui/components/alert-dialog'
import { IOrder } from '@zyra/conf/domain/entities/orders.entities'
import { useMarkOrderAsPaid, useDeleteOrder } from '@/usecases/ordersUseCases'
import OrderDetailsModal from './OrderDetailsModal'
import { formatDate, formatDateTime } from '@zyra/conf/lib/utils'

interface OrderCardProps {
  order: IOrder
  onViewDetails?: (order: IOrder) => void
}

export default function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const markAsPaidMutation = useMarkOrderAsPaid()
  const deleteOrderMutation = useDeleteOrder()
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">En attente</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-700">Terminée</Badge>
      case 'canceled':
        return <Badge variant="destructive">Annulée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleTogglePayment = () => {
    if (!order.isPaid) {
      markAsPaidMutation.mutate(order.id)
    }
  }

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true)
    if (onViewDetails) {
      onViewDetails(order)
    }
  }

  const handleDeleteOrder = () => {
    deleteOrderMutation.mutate(order.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
      }
    })
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* En-tête avec service et statut */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate mb-1.5">
                  {order.serviceName}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>

            {/* Prix et heure en grand */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-bold">{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {order.totalPrice.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">XAF</p>
              </div>
            </div>

            {/* Client */}
            <div className="flex items-center gap-2 text-sm border-t pt-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{order.clientName}</span>
            </div>

            {/* Coiffeur */}
            <div className="flex items-center gap-2 text-sm">
              <Scissors className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{order.hairDresserName}</span>
            </div>

            {/* Statut de paiement avec toggle */}
            <div className="pt-2 border-t">
              {order.isPaid ? (
                <Badge variant="outline" className="w-full justify-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Payé
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={handleTogglePayment}
                  disabled={markAsPaidMutation.isPending}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  {markAsPaidMutation.isPending ? 'Mise à jour...' : 'Marquer comme payé'}
                </Button>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir les détails
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal des détails */}
      <OrderDetailsModal
        order={order}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La commande de {order.clientName} pour {order.serviceName} sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOrderMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={deleteOrderMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteOrderMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
