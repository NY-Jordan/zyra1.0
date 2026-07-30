import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import { createDocument, deleteDocument, editDocument } from '@zyra/conf/lib/query'
import { toast } from 'sonner'
import { logActivity, getCurrentActor } from './notificationsUseCases'
import { useSalon } from '../hooks/useSalon'

export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientData: Omit<IClient, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newClient = {
        ...clientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const clientId = await createDocument('clients', newClient)

      if (clientData.salonId) {
        const actor = getCurrentActor()
        await logActivity({
          salonId: clientData.salonId,
          ...actor,
          type: 'client_created',
          action: 'created',
          resourceId: clientId,
          resourceType: 'client',
          resourceLabel: clientData.name || clientData.phone,
        })
      }

      return clientId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Client créé avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création du client')
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  const { salonId } = useSalon()

  return useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: Partial<IClient> }) => {
      await editDocument('clients', clientId, {
        ...data,
        updatedAt: new Date().toISOString(),
      })

      if (salonId) {
        await logActivity({
          salonId,
          ...getCurrentActor(),
          type: 'client_updated',
          action: 'updated',
          resourceId: clientId,
          resourceType: 'client',
          resourceLabel: (data as any).name ?? 'Client',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Client mis à jour avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du client')
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  const { salonId } = useSalon()

  return useMutation({
    mutationFn: async ({ clientId, clientName }: { clientId: string; clientName?: string }) => {
      await deleteDocument('clients', clientId)

      if (salonId) {
        await logActivity({
          salonId,
          ...getCurrentActor(),
          type: 'client_deleted',
          action: 'deleted',
          resourceId: clientId,
          resourceType: 'client',
          resourceLabel: clientName ?? 'Client',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Client supprimé avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression du client')
    },
  })
}
