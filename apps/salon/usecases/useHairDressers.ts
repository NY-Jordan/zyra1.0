'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, fetchCollectionPaginate, createDocument, editDocument, deleteDocument } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IHairDresser, HairDresserSalonAssociation } from '@zyra/conf/domain/entities/hairdressers.entities'
import { toast } from 'sonner'
import useSalon from '@/hooks/useSalon'

export interface IHairDresserWithSalonStatus extends IHairDresser {
  active: boolean
}

export function useHairDressers() {
  const { salon } = useSalon()
  const queryClient = useQueryClient()

  // Récupérer les coiffeurs du salon (actifs et inactifs)
  const { data: hairDressers = [], isLoading, error } = useQuery({
    queryKey: ['salon-hairdressers', salon?.id],
    queryFn: async () => {
      if (!salon?.id) return []
      const hairDressersList = await fetchCollection('hair_dressers', [
        where('salonIds', 'array-contains-any', [
          { salonId: salon.id, active: true },
          { salonId: salon.id, active: false },
        ])
      ])
      const updatedList = hairDressersList.map(h => {
        const salonLink = h.salonIds.find(s => s.salonId === salon.id)
        return {
          ...h,
          active: salonLink?.active ?? false,
        }
      })
      console.log(updatedList)
    return updatedList as IHairDresserWithSalonStatus[]
    },
    refetchOnWindowFocus: true,
    enabled: !!salon?.id,
  })

  // Créer un coiffeur
  const createHairDresserMutation = useMutation({
    mutationFn: async (data: Omit<IHairDresser, 'id'>) => {
      if (!salon?.id) throw new Error('Salon non trouvé')
      const payload = {
        ...data,
        salonIds: [salon.id],
        reservationsTaken: 0,
        reservationsConfirmed: 0,
        reservationsDone: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
      }
      return await createDocument('hair_dressers', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
      toast.success('Coiffeur ajouté avec succès!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du coiffeur')
    },
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
      const doc = await fetchCollection('hair_dressers', [where('id', '==', hairDresser.id)])
      if (!doc || !doc[0]) return
      const currentSalonIds = doc[0].salonIds || []
      const updatedSalonIds = currentSalonIds.map((item: HairDresserSalonAssociation) =>
        item.salonId === salon.id
          ? { ...item, active: !item.active }
          : item
      )
      return await editDocument('hair_dressers', hairDresser.id, { salonIds: updatedSalonIds })
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
      const doc = await fetchCollection('hair_dressers', [where('id', '==', hairDresserId)])
      if (!doc || !doc[0]) return
      const currentSalonIds = doc[0].salonIds || []
      const updatedSalonIds = currentSalonIds.filter((item: HairDresserSalonAssociation) => 
        item.salonId !== salon.id
      )
      return await editDocument('hair_dressers', hairDresserId, { salonIds: updatedSalonIds })
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
    createHairDresser: createHairDresserMutation.mutate,
    updateHairDresser: updateHairDresserMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    deleteHairDresser: deleteHairDresserMutation.mutate,
    
    // Loading states
    isCreating: createHairDresserMutation.isPending,
    isUpdating: updateHairDresserMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isDeleting: deleteHairDresserMutation.isPending,
  }
}