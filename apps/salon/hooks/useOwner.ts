'use client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { ownerAuthService } from '@/services/ownerAuthService'
import { IOwner } from '@zyra/conf/domain/entities/owners.entities'



/**
 * Hook pour récupérer et mettre en cache les informations du propriétaire connecté
 * Utilise useQuery pour un cache persistant et une synchronisation automatique
 */
export function useOwner() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const ownerQuery = useQuery({
    queryKey: ['owner', user?.uid],
    queryFn: () => ownerAuthService.getOwnerById(user!.uid),
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5, // Les données restent fraîches pendant 5 minutes
    gcTime: 1000 * 60 * 30, // Garde les données en cache pendant 30 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Ne refetch pas automatiquement au focus
  })

  return {
    owner: ownerQuery.data as IOwner | undefined,
    isLoading: authLoading || ownerQuery.isLoading,
    isError: ownerQuery.isError,
    error: ownerQuery.error,
    refetch: ownerQuery.refetch,
    isAuthenticated: !!user && !authLoading,
    user,
  }
}

/**
 * Hook pour récupérer les informations d'un propriétaire spécifique par ID
 * @param ownerId ID du propriétaire à récupérer
 */
export function useOwnerById(ownerId: string | null) {
  return useQuery({
    queryKey: ['owner', ownerId],
    queryFn: () => ownerAuthService.getOwnerById(ownerId!),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 heure
    retry: 1,
  })
}
