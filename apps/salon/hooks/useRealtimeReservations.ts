'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '@zyra/conf/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

/**
 * Écouteur Firestore global sur les réservations du salon.
 * À chaque changement (création / statut / créneau), invalide toutes les
 * requêtes react-query qui dépendent des réservations ou des créneaux,
 * pour que toutes les vues (gestion, calendrier, nouvelle résa, dispo) restent
 * synchronisées en temps réel sans rafraîchissement manuel.
 *
 * À monter une seule fois, haut dans l'arbre (layout salon).
 */
export function useRealtimeReservations(salonId: string | null | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!salonId) return

    const q = query(collection(db, 'reservations'), where('salonId', '==', salonId))
    let first = true

    const unsub = onSnapshot(q, () => {
      // Ignorer le 1er snapshot (chargement initial) : les requêtes sont déjà fraîches.
      if (first) {
        first = false
        return
      }
      ;[
        'reservations',
        'reservations-calendar-day',
        'reservations-calendar-month',
        'salon-hairdressers-calendar',
        'hd-day-reservations',
        'hd-day-reservations-new',
        'dashboard',
      ].forEach(key => queryClient.invalidateQueries({ queryKey: [key] }))
    })

    return unsub
  }, [salonId, queryClient])
}
