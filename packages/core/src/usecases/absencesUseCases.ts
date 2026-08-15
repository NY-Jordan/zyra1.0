'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { where } from 'firebase/firestore'
import { createDocument, deleteDocument, fetchCollection } from '@zyra/conf/lib/query'
import { IHairdresserAbsence } from '@zyra/conf/domain/entities/availability.entities'

/** Absences (congés, indisponibilités) d'un coiffeur — utilisé pour la gestion et pris en compte en temps réel par `useAvailableSlots`. */
export const useHairdresserAbsences = (hairdresserId: string | null | undefined) => {
  return useQuery({
    queryKey: ['hairdresser-absences', hairdresserId],
    queryFn: async () => {
      if (!hairdresserId) return []
      const results = await fetchCollection('hairdresser_absences', [where('hairdresserId', '==', hairdresserId)])
      return results as IHairdresserAbsence[]
    },
    enabled: !!hairdresserId,
  })
}

export const useCreateHairdresserAbsence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (absence: Omit<IHairdresserAbsence, 'id' | 'createdAt'>) =>
    createDocument('hairdresser_absences', { ...absence, createdAt: new Date() }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hairdresser-absences', variables.hairdresserId] })
    },
  })
}

export const useDeleteHairdresserAbsence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; hairdresserId: string }) => deleteDocument('hairdresser_absences', id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hairdresser-absences', variables.hairdresserId] })
    },
  })
}
