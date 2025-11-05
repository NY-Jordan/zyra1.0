'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDocument } from '@zyra/conf/lib/query'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

export const useSalon = () => {
  const [salonId, setSalonId] = useState<string | null>(null)

  // Récupérer l'ID du salon depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSalonId = localStorage.getItem('salonId')
      setSalonId(storedSalonId)
    }
  }, [])

  // Query pour récupérer les données du salon
  const {
    data: salon,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['salon', salonId],
    queryFn: () => {
      if (!salonId) {
        throw new Error('Aucun salon sélectionné')
      }
      return getDocument('salons', salonId) as Promise<ISalon>
    },
    enabled: !!salonId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  // Fonction pour changer de salon
  const switchSalon = (newSalonId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('salonId', newSalonId)
      setSalonId(newSalonId)
    }
  }

  // Fonction pour déconnecter du salon
  const disconnectSalon = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salonId')
      setSalonId(null)
    }
  }

  return {
    salon,
    salonId,
    isLoading,
    error,
    refetch,
    switchSalon,
    disconnectSalon,
    isConnected: !!salonId
  }
}

export default useSalon
