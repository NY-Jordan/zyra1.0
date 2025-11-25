import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editDocument, deleteDocument } from '@zyra/conf/lib/query'
import { toast } from 'sonner'

/**
 * Hook pour marquer une commande comme payée
 */
export const useMarkOrderAsPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      await editDocument('orders', orderId, {
        isPaid: true,
        updatedAt: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Commande marquée comme payée')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  })
}

/**
 * Hook pour annuler une commande
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      await editDocument('orders', orderId, {
        status: 'canceled',
        updatedAt: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Commande annulée')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'annulation')
    }
  })
}

/**
 * Hook pour mettre à jour le statut d'une commande
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await editDocument('orders', orderId, {
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'completed' && { completedAt: new Date().toISOString() })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Statut mis à jour')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  })
}

/**
 * Hook pour supprimer une commande
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      await deleteDocument('orders', orderId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Commande supprimée avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  })
}
