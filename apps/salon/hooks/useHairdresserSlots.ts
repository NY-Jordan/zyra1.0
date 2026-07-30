'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { where } from 'firebase/firestore'
import { fetchCollection } from '@zyra/conf/lib/query'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useHairDressers } from '@zyra/core/usecases/useHairDressers'
import {
  generateTimeSlots,
  filterByHairdresserHours,
  filterPassedHours,
  getOccupiedSlots,
} from '@/presentation/components/reservations/helpers/timeSlots'

interface Params {
  hairdresserId?: string | null
  date: Date | null
  /** Réservation à exclure du calcul d'occupation (ex. celle qu'on déplace). */
  excludeReservationId?: string
  enabled?: boolean
}

/**
 * Calcule les créneaux disponibles d'un coiffeur pour une date donnée, en
 * temps réel (la clé react-query ['hd-day-reservations'] est invalidée par
 * l'écouteur global useRealtimeReservations).
 *
 * Centralise toute la logique de créneaux (horaires coiffeur + créneaux passés
 * + créneaux déjà occupés) pour être réutilisée par la reprogrammation et le
 * changement de coiffeur.
 */
export function useHairdresserSlots({ hairdresserId, date, excludeReservationId, enabled = true }: Params) {
  const { salon } = useSalon()
  const { hairDressers } = useHairDressers()

  const workingHours: OpeningHour[] = useMemo(() => {
    const hd = hairDressers.find(h => h.id === hairdresserId)
    return hd?.associationHairdresser?.workingHours ?? salon?.openingHours ?? []
  }, [hairDressers, hairdresserId, salon?.openingHours])

  const { data: dayReservations = [], isFetching } = useQuery({
    queryKey: ['hd-day-reservations', salon?.id, hairdresserId, date?.toISOString().slice(0, 10)],
    queryFn: async () => {
      if (!salon?.id || !hairdresserId || !date) return []
      const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999)
      const all = await fetchCollection('reservations', [where('salonId', '==', salon.id)]) as IReservation[]
      return all.filter(res =>
        res.id !== excludeReservationId &&
        res.status !== reservationStatusEnum.canceled &&
        res.status !== reservationStatusEnum.no_show &&
        res.people.some(p => {
          if (p.hairdresserId !== hairdresserId) return false
          const d = p.scheduledAt.toDate()
          return d >= startOfDay && d <= endOfDay
        }),
      )
    },
    enabled: enabled && !!salon?.id && !!hairdresserId && !!date,
  })

  const slots = useMemo(() => {
    if (!hairdresserId || !date) return []
    const dayName = date.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
    const schedule = workingHours.find(h => h.day.toLowerCase() === dayName)
    if (!schedule?.openDay) return []

    const blocked = new Set<string>()
    dayReservations.forEach(res =>
      res.people.forEach(p => {
        if (p.hairdresserId !== hairdresserId) return
        const d = p.scheduledAt.toDate()
        const start = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        getOccupiedSlots(start, p.totalDuration).forEach(s => blocked.add(s))
      }),
    )

    let s = generateTimeSlots(schedule.open, schedule.close)
    s = filterByHairdresserHours(s, date, workingHours)
    s = filterPassedHours(s, date)
    return s.filter(slot => !blocked.has(slot))
  }, [hairdresserId, date, workingHours, dayReservations])

  return { slots, isFetching, workingHours }
}
