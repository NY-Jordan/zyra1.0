'use client'

import { useEffect, useState } from 'react'
import { db } from '@zyra/conf/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { HairDresserSalonAssociation } from '@zyra/conf/domain/entities/hairdressers.entities'

/**
 * Écoute en temps réel les réservations du salon et renvoie l'ensemble des
 * créneaux (HH:mm, pas de 30 min) déjà occupés pour le coiffeur + la date donnés.
 * Mis à jour automatiquement dès qu'une réservation est créée/déplacée/annulée
 * partout (salon ou marketplace) → aucune désynchronisation.
 *
 * Si aucun coiffeur n'est sélectionné, on bloque les créneaux occupés par
 * n'importe quel coiffeur (vue "n'importe quel coiffeur").
 */
export function useOccupiedSlots(
  salonId: string | null | undefined,
  date: Date | null,
  hairdresser: HairDresserSalonAssociation | null,
): Set<string> {
  const [blocked, setBlocked] = useState<Set<string>>(new Set())

  const hairdresserId = hairdresser?.parentId ?? null
  const dayKey = date ? date.toISOString().slice(0, 10) : null

  useEffect(() => {
    if (!salonId || !date) {
      setBlocked(new Set())
      return
    }

    const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999)

    const q = query(collection(db, 'reservations'), where('salonId', '==', salonId))

    const unsub = onSnapshot(q, snapshot => {
      const set = new Set<string>()
      snapshot.docs.forEach(doc => {
        const res = doc.data() as any
        const status = res.status as string
        if (status === 'canceled' || status === 'no_show') return
        ;(res.people || []).forEach((p: any) => {
          if (hairdresserId && p.hairdresserId !== hairdresserId) return
          if (!p.scheduledAt?.toDate) return
          const d: Date = p.scheduledAt.toDate()
          if (d < startOfDay || d > endOfDay) return
          // Marquer tous les créneaux de 30 min couverts par la prestation
          const duration = p.totalDuration || 0
          let cur = d.getHours() * 60 + d.getMinutes()
          const end = cur + (duration > 0 ? duration : 30)
          while (cur < end) {
            const hh = String(Math.floor(cur / 60)).padStart(2, '0')
            const mm = String(cur % 60).padStart(2, '0')
            set.add(`${hh}:${mm}`)
            cur += 30
          }
        })
      })
      setBlocked(set)
    })

    return unsub
  }, [salonId, dayKey, hairdresserId])

  return blocked
}
