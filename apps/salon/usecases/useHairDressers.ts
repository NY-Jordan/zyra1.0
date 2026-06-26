'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, fetchCollectionPaginate, createDocument, editDocument, deleteDocument, fetchSubCollection, fetchAllSubCollections, updateSubCollectionDocument } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IHairDresser, HairDresserSalonAssociation, hairDresserAssociationNameEnum } from '@zyra/conf/domain/entities/hairdressers.entities'
import { toast } from 'sonner'
import useSalon from '@/hooks/useSalon'
import { logActivity, createNotification, getCurrentActor } from '@/usecases/notificationsUseCases'


export interface HairDresserWithSalonAssociation extends IHairDresser {
  associationHairdresser: HairDresserSalonAssociation
}

export function useHairDressers() {
  const { salon } = useSalon()
  const queryClient = useQueryClient()

  // Récupérer les coiffeurs du salon (actifs et inactifs)
  const { data: hairDressers = [], isLoading, error } = useQuery({
    queryKey: ['salon-hairdressers', salon?.id],
    queryFn: async () => {
      if (!salon?.id) return []
      const hairDressersAssociationsList = await fetchAllSubCollections(hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, [where('salonId', '==', salon.id)]) as HairDresserSalonAssociation[];
      const updatedListPromises  = await  hairDressersAssociationsList.map(async sh => {
        const hair_dresser  = await fetchCollection('hair_dressers', [where('id', '==', sh.parentId)]) as unknown as IHairDresser[];
        return {
          ...hair_dresser[0],
          associationHairdresser : sh,
        }
      }) 
    const updatedList = await Promise.all(updatedListPromises) as HairDresserWithSalonAssociation[];
    return updatedList 
    },
    refetchOnWindowFocus: true,
    enabled: !!salon?.id,
  })


  

  // Mettre à jour un coiffeur
  const updateHairDresserMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<IHairDresser> & { id: string }) => {
      await editDocument('hair_dressers', id, data)
      if (salon?.id) {
        await logActivity({
          salonId: salon.id,
          ...getCurrentActor(),
          type: 'hairdresser_updated',
          action: 'updated',
          resourceId: id,
          resourceType: 'hairdresser',
          resourceLabel: (data as any).name ?? 'Coiffeur',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Coiffeur mis à jour avec succès!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })

  // Toggle association active/inactive pour ce salon spécifique
  const toggleStatusMutation = useMutation({
    mutationFn: async (hairDresser: IHairDresser) => {
      if (!salon?.id) throw new Error('Salon non trouvé')
      const subCollectionAssociate = await fetchSubCollection('hair_dressers', hairDresser.id, hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, [where('salonId', '==', salon.id)]) as HairDresserSalonAssociation[]
      if (!subCollectionAssociate || !subCollectionAssociate[0]) return
      const newActive = !subCollectionAssociate[0].active
      const updatedAssociation = subCollectionAssociate.map((item: HairDresserSalonAssociation) =>
        item.salonId === salon.id ? { ...item, active: newActive } : item
      )
      await updateSubCollectionDocument('hair_dressers', hairDresser.id, hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, updatedAssociation[0].salonId, updatedAssociation[0])
      await Promise.all([
        logActivity({
          salonId: salon.id,
          ...getCurrentActor(),
          type: 'hairdresser_status_changed',
          action: newActive ? 'activated' : 'deactivated',
          resourceId: hairDresser.id,
          resourceType: 'hairdresser',
          resourceLabel: hairDresser.name,
          metadata: { statut: newActive ? 'Actif' : 'Inactif' },
        }),
        createNotification({
          salonId: salon.id,
          type: 'hairdresser_status_changed',
          title: `Coiffeur ${newActive ? 'activé' : 'désactivé'}`,
          body: hairDresser.name,
          resourceId: hairDresser.id,
          resourceType: 'hairdresser',
        }),
      ])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Statut du coiffeur modifié avec succès!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du changement de statut')
    },
  })

  // Dissocier un coiffeur du salon (similaire à la logique admin)
  const deleteHairDresserMutation = useMutation({
    mutationFn: async ({ hairDresserId, hairDresserName }: { hairDresserId: string; hairDresserName?: string }) => {
      if (!salon?.id) throw new Error('Salon non trouvé')
      const subCollectionAssociate = await fetchSubCollection('hair_dressers', hairDresserId, hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, [where('salonId', '==', salon.id)]) as HairDresserSalonAssociation[]
      if (!subCollectionAssociate || !subCollectionAssociate[0]) return
      await deleteDocument('hair_dressers/' + hairDresserId + '/' + hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, subCollectionAssociate[0].salonId)
      await Promise.all([
        logActivity({
          salonId: salon.id,
          ...getCurrentActor(),
          type: 'hairdresser_removed',
          action: 'removed',
          resourceId: hairDresserId,
          resourceType: 'hairdresser',
          resourceLabel: hairDresserName ?? 'Coiffeur',
        }),
        createNotification({
          salonId: salon.id,
          type: 'hairdresser_removed',
          title: 'Coiffeur retiré du salon',
          body: hairDresserName ?? '',
          resourceId: hairDresserId,
          resourceType: 'hairdresser',
        }),
      ])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Coiffeur retiré du salon avec succès!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du retrait du coiffeur')
    },
  })

  return {
    // Data
    hairDressers,
    isLoading,
    error,
    // Mutations
    updateHairDresser: updateHairDresserMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    deleteHairDresser: (hairDresserId: string, hairDresserName?: string) =>
      deleteHairDresserMutation.mutate({ hairDresserId, hairDresserName }),
    // Loading states
    isUpdating: updateHairDresserMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isDeleting: deleteHairDresserMutation.isPending,
  }
}