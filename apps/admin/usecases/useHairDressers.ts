import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollectionPaginate, fetchCollection, createDocument, editDocument, deleteDocument } from '@zyra/conf/lib/query'
import { HairDresserSalonAssociation, IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { where } from 'firebase/firestore'

export function useHairDressers(page: number = 1, pageSize: number = 25) {
  const queryClient = useQueryClient()

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<IHairDresser> & { id: string }) =>
      editDocument('hair_dressers', id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-dressers'] })
    },
  })

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteDocument('hair_dressers', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-dressers'] })
    },
  })

  // Toggle status (active/suspended)
  const toggleStatusMutation = useMutation({
    mutationFn: async (hairDresser: IHairDresser) =>
      editDocument('hair_dressers', hairDresser.id, {
        status: hairDresser.status === "active" ? "suspended" : "active"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-dressers'] })
    },
  })

  // Dissociate hairdresser from a salon
  const dissociateMutation = useMutation({
    mutationFn: async ({ hairDresserId, salonId }: { hairDresserId: string, salonId: string }) => {
      const doc = await fetchCollection("hair_dressers", [where('id', '==', hairDresserId)])
      if (!doc) return
      const newSalonIds = (doc[0]?.salonIds || []).filter((id: string) => id !== salonId)
      await editDocument("hair_dressers", hairDresserId, { salonIds: newSalonIds })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-dressers'] })
      queryClient.invalidateQueries({ queryKey: ['hairdressers-by-salon'] })
    },
  })

  // Toggle association active/inactive for a specific salon
  const toggleAssociationStatusMutation = useMutation({
    mutationFn: async ({ hairDresserId, salonId }: { hairDresserId: string, salonId: string }) => {
      const doc = await fetchCollection("hair_dressers", [where('id', '==', hairDresserId)])
      if (!doc || !doc[0]) return
      const currentSalonIds = doc[0].salonIds || []
      const updatedSalonIds = currentSalonIds.map((item: HairDresserSalonAssociation) =>
        item.salonId === salonId
          ? { ...item, active: !item.active }
          : item
      )
      await editDocument("hair_dressers", hairDresserId, { salonIds: updatedSalonIds })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-dressers'] })
      queryClient.invalidateQueries({ queryKey: ['hairdressers-by-salon'] })
    },
  })

  return {
    updateHairDresser: updateMutation.mutate,
    deleteHairDresser: deleteMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    dissociateHairDresserFromSalon: dissociateMutation.mutate,
    toggleAssociationStatus: toggleAssociationStatusMutation.mutate,
    updatePending: updateMutation.isPending,
    deletePending: deleteMutation.isPending,
    togglePending: toggleStatusMutation.isPending,
    dissociatePending: dissociateMutation.isPending,
    toggleAssociationPending: toggleAssociationStatusMutation.isPending,
  }
}