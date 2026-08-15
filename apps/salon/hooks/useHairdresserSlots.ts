'use client'

import { useMemo } from 'react'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useHairDressers } from '@zyra/core/usecases/useHairDressers'
import { useAvailableSlots } from '@zyra/core/usecases/slotsUseCases'

interface Params {
  hairdresserId?: string | null
  date: Date | null
  /** Durée du service (+ suppléments) en minutes : un créneau n'est renvoyé que si toute cette durée est disponible. */
  durationMin: number
  /** Réservation à exclure du calcul d'occupation (ex. celle qu'on déplace). */
  excludeReservationId?: string
  /** Plages à traiter comme occupées en plus de celles en base (ex. autres personnes d'une réservation multiple en cours de saisie). */
  localBusyRanges?: { start: string; durationMin: number }[]
  enabled?: boolean
}

/**
 * Résout le salon + les horaires du coiffeur courant puis délègue le calcul
 * de créneaux au hook partagé de packages/core (source unique avec le
 * marketplace) — réutilisé par la reprogrammation, le changement de coiffeur
 * et la création de réservation.
 */
export function useHairdresserSlots({ hairdresserId, date, durationMin, excludeReservationId, localBusyRanges, enabled = true }: Params) {
  const { salon } = useSalon()
  const { hairDressers } = useHairDressers()

  const hairdresserWorkingHours = useMemo(() => {
    const hd = hairDressers.find(h => h.id === hairdresserId)
    return hd?.associationHairdresser?.workingHours ?? null
  }, [hairDressers, hairdresserId])

  const result = useAvailableSlots({
    salonId: salon?.id,
    date,
    durationMin,
    openingHours: salon?.openingHours ?? [],
    hairdresserId,
    hairdresserWorkingHours,
    excludeReservationId,
    localBusyRanges,
    enabled: enabled && !!hairdresserId && !!date,
  })

  if (!hairdresserId || !date) {
    return { slots: [] as string[], isFetching: false, workingHours: result.workingHours }
  }
  return { slots: result.slots, isFetching: result.isFetching, workingHours: result.workingHours }
}
