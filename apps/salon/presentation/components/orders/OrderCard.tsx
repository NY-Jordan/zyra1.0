'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import {
  User,
  Clock,
  Scissors,
  CheckCircle,
  Eye,
  Trash2,
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
import { useMarkOrderAsPaid, useDeleteOrder } from '@zyra/core/usecases/ordersUseCases'
import { useHasPermission } from '@/hooks/useHasPermission'
import OrderDetailsModal from './OrderDetailsModal'
import { formatDateTime } from '@zyra/conf/lib/utils'

interface OrderCardProps {
  order: IOrder
  onViewDetails?: (order: IOrder) => void
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: {
    label: 'En attente',
    cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
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
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

export default function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const markAsPaidMutation = useMarkOrderAsPaid()
  const deleteOrderMutation = useDeleteOrder()
  const { hasPermission } = useHasPermission()
  const canManagePayments = hasPermission('payments.manage')
  const canDelete = hasPermission('orders.delete')

  const handleTogglePayment = () => {
    if (!order.isPaid) {
      markAsPaidMutation.mutate({ orderId: order.id, orderLabel: `${order.clientName} · ${order.serviceName}` })
    }
  }

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true)
    if (onViewDetails) {
      onViewDetails(order)
    }
  }

  const handleDeleteOrder = () => {
    deleteOrderMutation.mutate({ orderId: order.id, orderLabel: `${order.clientName} · ${order.serviceName}` }, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
      },
    })
  }

  return (
    <>
      <Card className="border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* En-tête */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[14px] text-slate-800 dark:text-white truncate mb-1.5">
                  {order.serviceName}
                </h3>
                <StatusBadge status={order.status} />
              </div>
            </div>

            {/* Prix et heure */}
            <div className="flex items-center justify-between py-1.5 px-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[12px] font-semibold">{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  {order.totalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">XAF</span>
              </div>
            </div>

            {/* Client / coiffeur */}
            <div className="space-y-1.5 px-0.5">
              <div className="flex items-center gap-2 text-[12px]">
                <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{order.clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <Scissors className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 truncate">{order.hairDresserName}</span>
              </div>
            </div>

            {/* Statut de paiement */}
            <div className="pt-1">
              {order.isPaid ? (
                <span className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                  <CheckCircle className="h-3 w-3" />
                  Payé
                </span>
              ) : canManagePayments ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-xl text-[11px] font-bold text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40"
                  onClick={handleTogglePayment}
                  disabled={markAsPaidMutation.isPending}
                >
                  {markAsPaidMutation.isPending ? 'Mise à jour...' : 'Marquer comme payé'}
                </Button>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#F5F2EF] dark:hover:bg-slate-800"
                onClick={handleViewDetails}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Voir les détails
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderDetailsModal
        order={order}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-[#F0EAE4] dark:border-slate-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white">
              Supprimer la commande ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              Cette action est irréversible. La commande de {order.clientName} pour {order.serviceName} sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOrderMutation.isPending} className="rounded-xl text-[12px]">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={deleteOrderMutation.isPending}
              className="rounded-xl text-[12px] bg-rose-500 hover:bg-rose-600"
            >
              {deleteOrderMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
