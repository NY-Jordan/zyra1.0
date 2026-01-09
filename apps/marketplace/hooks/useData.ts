import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchAllSubCollections } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { HairDresserSalonAssociation, hairDresserAssociationNameEnum, IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { generateTimeSlots } from '@/config/utils'

export const useSalonData = (salonId: string) => {
  return useQuery({
    queryKey: ['salon', salonId],
    queryFn: async () => {
      const salons = await fetchCollection('salons', [where('id', '==', salonId)])
      return salons[0] as ISalon
    },
  })
}

export const useHairdressersData = (salonId: string, selectedService: any) => {
  return useQuery({
    queryKey: ['hairdressers', salonId, selectedService?.categoryId],
    queryFn: async () => {
      if (!salonId) return []
      
      const associations = await fetchAllSubCollections(
        hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
        [where('salonId', '==', salonId), where('active', '==', true)]
      ) as HairDresserSalonAssociation[]

      if (associations.length === 0) return []

      const hairdresserPromises = associations.map(async (assoc) => {
        const hairdressers = await fetchCollection('hair_dressers', [
          where('id', '==', assoc.parentId)
        ])
        return {
          hairdresser: hairdressers[0] as IHairDresser,
          association: assoc
        }
      })

      const results = await Promise.all(hairdresserPromises)
      let filtered = results.filter(r => r.hairdresser)

      if (selectedService?.categoryId) {
        filtered = filtered.filter(r => 
          r.association.salonServiceIds.includes(selectedService.categoryId)
        )
      }

      return filtered
    },
    enabled: !!salonId,
  })
}

export const useAvailableSlots = (salon: ISalon | null, selectedDate: Date | null) => {
  return useMemo(() => {
    if (!salon || !selectedDate) return []
    const dayOfWeek = selectedDate.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
    const daySchedule = salon.openingHours.find(h => h.day.toLowerCase() === dayOfWeek)
    if (!daySchedule || !daySchedule.openDay) return []
    return generateTimeSlots(daySchedule.open, daySchedule.close)
  }, [salon, selectedDate])
}
