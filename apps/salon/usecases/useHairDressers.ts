'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, fetchCollectionPaginate, createDocument, editDocument, deleteDocument, fetchSubCollection, fetchAllSubCollections, updateSubCollectionDocument } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IHairDresser, HairDresserSalonAssociation, hairDresserAssociationNameEnum } from '@zyra/conf/domain/entities/hairdressers.entities'
import { toast } from 'sonner'
import useSalon from '@/hooks/useSalon'


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
      return await editDocument('hair_dressers', id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
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
      const subCollectionAssociate = await fetchSubCollection('hair_dressers',hairDresser.id, hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, [where('salonId', '==', salon.id)]) as HairDresserSalonAssociation[];
      if (!subCollectionAssociate || !subCollectionAssociate[0]) return
      const updatedAssociation = subCollectionAssociate.map((item: HairDresserSalonAssociation) =>
        item.salonId === salon.id
          ? { ...item, active: !item.active }
          : item
      )
      return await updateSubCollectionDocument('hair_dressers', hairDresser.id, hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,updatedAssociation[0].salonId, updatedAssociation[0])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
      toast.success('Statut du coiffeur modifié avec succès!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du changement de statut')
    },
  })

  // Dissocier un coiffeur du salon (similaire à la logique admin)
  const deleteHairDresserMutation = useMutation({
    mutationFn: async (hairDresserId: string) => {
      if (!salon?.id) throw new Error('Salon non trouvé')
      const subCollectionAssociate = await fetchSubCollection('hair_dressers', hairDresserId, hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, [where('salonId', '==', salon.id)]) as HairDresserSalonAssociation[];
      if (!subCollectionAssociate || !subCollectionAssociate[0]) return
      return await deleteDocument('hair_dressers/' + hairDresserId + '/' + hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, subCollectionAssociate[0].salonId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
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
    deleteHairDresser: deleteHairDresserMutation.mutate,
    // Loading states
    isUpdating: updateHairDresserMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isDeleting: deleteHairDresserMutation.isPending,
  }
}