'use client'

import { useEffect, useState } from 'react'
import { db } from '@zyra/conf/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

/**
 * Nombre de notifications non lues d'un salon, en temps réel. Volontairement
 * léger (juste le compte, pas de son ni de contenu) — pour l'afficher en
 * badge sur une liste de salons, contrairement à `useNotifications` qui
 * charge tout le panneau de notifications d'un salon actif.
 */
export function useUnreadNotificationsCount(salonId: string | null): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!salonId) {
      setCount(0)
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('salonId', '==', salonId),
      where('read', '==', false),
    )

    const unsub = onSnapshot(q, snapshot => setCount(snapshot.size))
    return unsub
  }, [salonId])

  return count
}
