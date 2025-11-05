'use client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { ownerAuthService } from '@/services/ownerAuthService'
import { fetchCollection } from '@zyra/conf/lib/query'
import { IOwner } from '@zyra/conf/domain/entities/owners.entities'
import { where } from 'firebase/firestore'
import { ISubscription, SubscriptionStatus } from '@zyra/conf/domain/entities/subscriptions.entities'


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

  // Query pour récupérer la souscription active de l'utilisateur
  const subscriptionQuery = useQuery({
      queryKey: ['subscription', user?.uid],
      queryFn: async () => {
        if (!user?.uid) return null
        try {
          // Récupérer toutes les souscriptions de l'utilisateur
          const subscriptions = await fetchCollection('subscriptions', [
            where('userId', '==', user?.uid)
          ])
          if (subscriptions.length === 0) return null
          // Trouver la souscription active ou la plus récente
          const activeSubscription = subscriptions.find((sub: any) => sub.status === SubscriptionStatus.ACTIVE)
  
          if (activeSubscription) {
            return activeSubscription as ISubscription
          }
          // Si pas de souscription active, retourner la plus récente
          const sortedSubscriptions = subscriptions.sort((a: any, b: any) => {
            const dateA = a.createdAt?.seconds || 0
            const dateB = b.createdAt?.seconds || 0
            return dateB - dateA
          })
          return sortedSubscriptions[0] as ISubscription
        } catch (error) {
          console.error('Erreur lors de la récupération de la souscription:', error)
          return null
        }
      },
      enabled: !!user?.uid,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2
    })

  // Fonctions utilitaires pour la souscription
  const isSubscriptionActive = () => {
    if (!subscriptionQuery.data) return false
    const subscription = subscriptionQuery.data
    if (subscription.status !== 'active') return false
    // Vérifier si la souscription n'est pas expirée
    if (subscription.endDate) {
      const endDate = new Date(subscription.endDate.seconds * 1000)
      const now = new Date()
      return endDate > now
    }
    return true
  }

  const getSubscriptionDaysRemaining = () => {
    if (!subscriptionQuery.data?.endDate) return null
    const endDate = new Date(subscriptionQuery.data.endDate.seconds * 1000)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const isSubscriptionExpiringSoon = (days: number = 7) => {
    const daysRemaining = getSubscriptionDaysRemaining()
    return daysRemaining !== null && daysRemaining <= days && daysRemaining > 0
  }

  // Fonction pour rafraîchir la souscription
  const refetchSubscription = () => {
    return subscriptionQuery.refetch()
  }

  return {
    // Données du propriétaire (existant)
    owner: ownerQuery.data as IOwner | undefined,
    isLoading: authLoading || ownerQuery.isLoading || subscriptionQuery.isLoading,
    isError: ownerQuery.isError || subscriptionQuery.isError,
    error: ownerQuery.error || subscriptionQuery.error,
    refetch: ownerQuery.refetch,
    isAuthenticated: !!user && !authLoading,
    user,

    // Nouvelles données de souscription
    subscription: subscriptionQuery.data,
    subscriptionLoading: subscriptionQuery.isLoading,
    subscriptionError: subscriptionQuery.isError,
    isSubscriptionActive: isSubscriptionActive(),
    subscriptionDaysRemaining: getSubscriptionDaysRemaining(),
    isSubscriptionExpiringSoon: isSubscriptionExpiringSoon(),

    // Fonctions utilitaires pour la souscription
    refetchSubscription,
    hasActiveSubscription: isSubscriptionActive(),

    // Fonction de vérification combinée
    canAccessPremiumFeatures: isSubscriptionActive()
  }
}

/**
 * Hook pour récupérer les informations d'un propriétaire spécifique par ID
 * @param ownerId ID du propriétaire à récupérer
 */
export function useOwnerById(ownerId: string | null) {
  const ownerQuery = useQuery({
    queryKey: ['owner', ownerId],
    queryFn: () => ownerAuthService.getOwnerById(ownerId!),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 heure
    retry: 1,
  })

  // Query pour la souscription du propriétaire spécifique
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', ownerId],
    queryFn: async () => {
      if (!ownerId) return null
      try {
        const subscriptions = await fetchCollection('subscriptions', [
          where('userId', '==', ownerId)
        ])
        if (subscriptions.length === 0) return null

        const activeSubscription = subscriptions.find((sub: any) => sub.status === SubscriptionStatus.ACTIVE)

        if (activeSubscription) {
          return activeSubscription as ISubscription
        }
        const sortedSubscriptions = subscriptions.sort((a: any, b: any) => {
          const dateA = a.createdAt?.seconds || 0
          const dateB = b.createdAt?.seconds || 0
          return dateB - dateA
        })
        return sortedSubscriptions[0] as ISubscription
      } catch (error) {
        console.error('Erreur lors de la récupération de la souscription:', error)
        return null
      }
    },
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2
  })

  return {
    owner: ownerQuery.data as IOwner | undefined,
    isLoading: ownerQuery.isLoading || subscriptionQuery.isLoading,
    isError: ownerQuery.isError || subscriptionQuery.isError,
    error: ownerQuery.error || subscriptionQuery.error,
    refetch: ownerQuery.refetch,
    // Données de souscription
    subscription: subscriptionQuery.data,
    subscriptionLoading: subscriptionQuery.isLoading,
    hasActiveSubscription: subscriptionQuery.data?.status === SubscriptionStatus.ACTIVE || false
  }
}
