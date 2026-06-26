import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editDocument, deleteDocument } from '@zyra/conf/lib/query'
import { toast } from 'sonner'
import { logActivity, getCurrentActor } from '@/usecases/notificationsUseCases'
import { LogContext } from '@/types/notifications.types'
import { useSalon } from '@/hooks/useSalon'

export const useMarkOrderAsPaid = () => {
  const queryClient = useQueryClient()
  const { salonId } = useSalon()

  return useMutation({
    mutationFn: async ({ orderId, orderLabel }: { orderId: string; orderLabel?: string }) => {
      await editDocument('orders', orderId, {
        isPaid: true,
        updatedAt: new Date().toISOString(),
      })

      if (salonId) {
        await logActivity({
          salonId,
          ...getCurrentActor(),
          type: 'order_paid',
          action: 'paid',
          resourceId: orderId,
          resourceType: 'order',
          resourceLabel: orderLabel ?? 'Commande',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Commande marquée comme payée')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  const { salonId } = useSalon()

  return useMutation({
    mutationFn: async ({ orderId, orderLabel }: { orderId: string; orderLabel?: string }) => {
      await editDocument('orders', orderId, {
        status: 'canceled',
        updatedAt: new Date().toISOString(),
      })

      if (salonId) {
        await logActivity({
          salonId,
          ...getCurrentActor(),
          type: 'order_canceled',
          action: 'canceled',
          resourceId: orderId,
          resourceType: 'order',
          resourceLabel: orderLabel ?? 'Commande',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Commande annulée')
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'annulation")
    },
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      logContext,
    }: {
      orderId: string
      status: string
      logContext?: LogContext
    }) => {
      await editDocument('orders', orderId, {
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'completed' && { completedAt: new Date().toISOString() }),
      })

      if (logContext) {
        const typeMap: Record<string, any> = {
          completed: 'order_completed',
          canceled: 'order_canceled',
        }
        const type = typeMap[status]
        if (type) {
          const titleMap: Record<string, string> = {
            order_completed: 'Commande complétée',
            order_canceled: 'Commande annulée',
          }
          await logActivity({ ...logContext, type, action: status, resourceId: orderId, resourceType: 'order' })
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Statut mis à jour')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  const { salonId } = useSalon()

  return useMutation({
    mutationFn: async ({ orderId, orderLabel }: { orderId: string; orderLabel?: string }) => {
      await deleteDocument('orders', orderId)

      if (salonId) {
        await logActivity({
          salonId,
          ...getCurrentActor(),
          type: 'order_deleted',
          action: 'deleted',
          resourceId: orderId,
          resourceType: 'order',
          resourceLabel: orderLabel ?? 'Commande',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Commande supprimée avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })
}
