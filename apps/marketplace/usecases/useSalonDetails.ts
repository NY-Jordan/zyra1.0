import { useQuery } from '@tanstack/react-query'
import { fetchDocument, fetchCollection } from '@zyra/conf/lib/query'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { where } from 'firebase/firestore'

/**
 * Hook pour récupérer les détails complets d'un salon
 */
export const useSalonDetails = (salonId: string) => {
  const { data: salon, isLoading: isSalonLoading } = useQuery({
    queryKey: ['salon-details', salonId],
    queryFn: async () => {
      if (!salonId) return null
      const data = await fetchDocument('salons', salonId)
      return data as ISalon
    },
    enabled: !!salonId,
  })

  const { data: hairDressers = [], isLoading: isTeamLoading } = useQuery({
    queryKey: ['salon-team', salonId],
    queryFn: async () => {
      if (!salonId) return []
      // Récupérer les coiffeurs associés à ce salon
      const data = await fetchCollection('hairdressers', [
        where('salonIds', 'array-contains', { salonId, active: true })
      ])
      return data as IHairDresser[]
    },
    enabled: !!salonId,
  })

  return {
    salon,
    hairDressers,
    isLoading: isSalonLoading || isTeamLoading,
  }
}
