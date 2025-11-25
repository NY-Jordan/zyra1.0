import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import { createDocument, deleteDocument, editDocument } from '@zyra/conf/lib/query'
import { toast } from 'sonner'

/**
 * Hook pour créer un nouveau client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientData: Omit<IClient, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newClient = {
        ...clientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return await createDocument('clients', newClient)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client créé avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création du client')
    }
  })
}

/**
 * Hook pour mettre à jour un client
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: Partial<IClient> }) => {
      await editDocument('clients', clientId, {
        ...data,
        updatedAt: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client mis à jour avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du client')
    }
  })
}

/**
 * Hook pour supprimer un client
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientId: string) => {
      await deleteDocument('clients', clientId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client supprimé avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression du client')
    }
  })
}
