'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where, orderBy } from 'firebase/firestore'
import { IActivity, ActivityType, ResourceType } from '@zyra/core/types/notifications.types'

export interface ActivityFilters {
  salonId: string | null
  resourceType?: ResourceType | 'all'
  type?: ActivityType | 'all'
  limit?: number
}

export const useActivities = (filters: ActivityFilters) => {
  const { salonId, resourceType = 'all', type = 'all', limit: lim = 60 } = filters

  return useQuery({
    queryKey: ['activities', salonId, resourceType, type],
    queryFn: async () => {
      if (!salonId) return []

      const constraints: any[] = [
        where('salonId', '==', salonId),
        orderBy('createdAt', 'desc'),
      ]

      const raw = await fetchCollection('activities', constraints)
      let data = raw as IActivity[]

      if (resourceType !== 'all') data = data.filter(a => a.resourceType === resourceType)
      if (type !== 'all') data = data.filter(a => a.type === type)

      return data.slice(0, lim)
    },
    enabled: !!salonId,
    staleTime: 30_000,
  })
}
