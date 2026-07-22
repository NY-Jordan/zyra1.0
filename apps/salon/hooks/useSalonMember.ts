'use client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalonMember } from '@zyra/conf/domain/entities/permissions.entities'

/**
 * Hook pour récupérer le membre d'équipe (non-owner) associé à l'utilisateur
 * Firebase Auth courant. Contrairement à `useOwner()`, l'absence de doc
 * `salon_members` est un état normal (cas d'un owner connecté) : ne lève pas
 * d'erreur, `member` reste simplement `null`.
 */
export function useSalonMember() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const memberQuery = useQuery({
    queryKey: ['salon-member', user?.uid],
    queryFn: async () => {
      const members = await fetchCollection('salon_members', [where('uid', '==', user!.uid)])
      return members.length > 0 ? (members[0] as ISalonMember) : null
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 0,
    refetchOnWindowFocus: false,
  })

  return {
    member: (memberQuery.data ?? null) as ISalonMember | null,
    isLoading: authLoading || memberQuery.isLoading,
    refetch: memberQuery.refetch,
  }
}

export default useSalonMember
