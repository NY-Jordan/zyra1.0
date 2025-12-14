import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { where } from 'firebase/firestore'

/**
 * Hook pour récupérer tous les salons actifs de la marketplace
 */
export const useSalons = () => {
  const { data: salons = [], isLoading, error } = useQuery({
    queryKey: ['marketplace-salons'],
    queryFn: async () => {
      // Récupérer uniquement les salons avec un statut "approved" ou "active"
      const data = await fetchCollection('salons', [
        where('status.name', '==', 'active')
      ])
      return data as ISalon[]
    },
  })

  return { salons, isLoading, error }
}
