'use client'

import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@zyra/conf/lib/firebase'
import { OpeningHour, TimeRange } from '@zyra/conf/domain/entities/salons.entities'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { IHairdresserAbsence } from '@zyra/conf/domain/entities/availability.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'

export const timeToMin = (hhmm: string): number => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const minToTime = (totalMin: number): string =>
  `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`

export const getEndTime = (start: string, durationMin: number): string =>
  minToTime(timeToMin(start) + durationMin)

const dayNameOf = (date: Date): string =>
  date.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()

/** Créneaux de 30 min entre l'ouverture et la fermeture (fermeture incluse). */
export const generateTimeSlots = (openTime: string, closeTime: string): string[] => {
  const slots: string[] = []
  const openMin = timeToMin(openTime)
  const closeMin = timeToMin(closeTime)
  for (let t = openMin; t < closeMin; t += 30) slots.push(minToTime(t))
  slots.push(minToTime(closeMin))
  return slots
}

export const isDayClosed = (date: Date, openingHours: OpeningHour[]): boolean => {
  const schedule = openingHours.find(h => h.day.toLowerCase() === dayNameOf(date))
  return !schedule?.openDay
}

export const filterPassedHours = (slots: string[], date: Date | null): string[] => {
  if (!date) return slots
  const now = new Date()
  const todayNorm = new Date(now); todayNorm.setHours(0, 0, 0, 0)
  const dateNorm = new Date(date); dateNorm.setHours(0, 0, 0, 0)
  if (dateNorm.getTime() !== todayNorm.getTime()) return slots
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return slots.filter(s => timeToMin(s) > nowMin)
}

/**
 * Créneaux de 30 min couverts par une prestation, fin exclusive : le créneau
 * de fin reste réservable pour la prestation suivante (back-to-back).
 */
export const getOccupiedSlots = (start: string, durationMin: number): string[] => {
  if (durationMin <= 0) return [start]
  const occupied: string[] = []
  let cur = timeToMin(start)
  const end = cur + durationMin
  while (cur < end) {
    occupied.push(minToTime(cur))
    cur += 30
  }
  return occupied
}

/** Comme `getOccupiedSlots` mais fin incluse — pour la surbrillance d'une sélection en cours dans l'UI. */
export const getBlockedSlots = (start: string, durationMin: number): string[] => {
  if (durationMin <= 0) return [start]
  const blocked = [start]
  let cur = timeToMin(start)
  let rem = durationMin
  while (rem > 0) {
    rem -= 30
    if (rem >= 0) {
      cur += 30
      blocked.push(minToTime(cur))
    }
  }
  return blocked
}

/** Horaires effectifs du jour : ceux du coiffeur s'ils sont renseignés, sinon repli sur ceux du salon. */
export const getEffectiveWorkingHours = (
  openingHours: OpeningHour[],
  hairdresserWorkingHours: OpeningHour[] | null | undefined,
): OpeningHour[] => (hairdresserWorkingHours && hairdresserWorkingHours.length > 0 ? hairdresserWorkingHours : openingHours)

// ─── Moteur de disponibilité par intervalles ───────────────────────────────
//
// Le reste du fichier (grille de 30 min) sert à l'affichage. Ces fonctions
// pures implémentent la règle métier de conflit sur des intervalles réels
// (millisecondes epoch), indépendamment de tout alignement sur la grille :
// un service n'est réservable que si toute sa durée tient dans un intervalle
// de travail et ne chevauche aucun intervalle occupé.

export interface Interval {
  start: number
  end: number
}

/** Date calendaire locale 'YYYY-MM-DD' — utilisée pour faire correspondre une absence à un jour de réservation. */
export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const atDateTime = (date: Date, hhmm: string): number => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

/** A.start < B.end && A.end > B.start — deux intervalles [start,end) sont en conflit s'ils se chevauchent (contact aux bornes = pas de conflit). */
export const intervalsOverlap = (a: Interval, b: Interval): boolean => a.start < b.end && a.end > b.start

export const isRangeFree = (candidate: Interval, busy: Interval[]): boolean => !busy.some(b => intervalsOverlap(candidate, b))

/** Soustrait des intervalles occupés (pauses, absences...) d'un intervalle de base ; peut renvoyer plusieurs morceaux. */
const subtractIntervals = (base: Interval, busy: Interval[]): Interval[] => {
  const sorted = busy
    .filter(b => intervalsOverlap(b, base))
    .sort((a, b) => a.start - b.start)

  const result: Interval[] = []
  let cursor = base.start
  for (const b of sorted) {
    const clippedStart = Math.max(b.start, base.start)
    const clippedEnd = Math.min(b.end, base.end)
    if (clippedStart > cursor) result.push({ start: cursor, end: clippedStart })
    cursor = Math.max(cursor, clippedEnd)
  }
  if (cursor < base.end) result.push({ start: cursor, end: base.end })
  return result
}

/**
 * Intervalles de travail réellement disponibles pour un jour donné : horaires
 * effectifs (coiffeur, repli salon) moins les pauses de ce jour et les
 * absences du coiffeur ce jour-là. Peut renvoyer plusieurs intervalles si une
 * pause coupe la journée (ex: 9h-12h et 13h-17h), ou aucun si le salon/le
 * coiffeur est fermé ce jour ou que le coiffeur est absent toute la journée.
 */
export const getWorkingIntervals = (
  date: Date,
  openingHours: OpeningHour[],
  hairdresserWorkingHours: OpeningHour[] | null | undefined,
  absences: IHairdresserAbsence[] = [],
): Interval[] => {
  const workingHours = getEffectiveWorkingHours(openingHours, hairdresserWorkingHours)
  const schedule = workingHours.find(h => h.day.toLowerCase() === dayNameOf(date))
  if (!schedule?.openDay) return []

  const dateKey = toDateKey(date)
  const dayAbsences = absences.filter(a => a.date === dateKey)
  if (dayAbsences.some(a => a.allDay)) return []

  const base: Interval = { start: atDateTime(date, schedule.open), end: atDateTime(date, schedule.close) }
  const busyRanges: Interval[] = [
    ...(schedule.breaks ?? []).map((r: TimeRange) => ({ start: atDateTime(date, r.start), end: atDateTime(date, r.end) })),
    ...dayAbsences
      .filter(a => !a.allDay && a.range)
      .map(a => ({ start: atDateTime(date, a.range!.start), end: atDateTime(date, a.range!.end) })),
  ]
  return subtractIntervals(base, busyRanges)
}

/** Le service tient-il entièrement dans un intervalle de travail, sans chevaucher un intervalle occupé ? */
export const isServiceBookable = (
  candidateStart: Date,
  durationMin: number,
  workingIntervals: Interval[],
  busyIntervals: Interval[],
): boolean => {
  const candidate: Interval = { start: candidateStart.getTime(), end: candidateStart.getTime() + durationMin * 60_000 }
  const fitsWorkingHours = workingIntervals.some(w => candidate.start >= w.start && candidate.end <= w.end)
  return fitsWorkingHours && isRangeFree(candidate, busyIntervals)
}

/**
 * Débuts de créneaux (grille de 30 min entre `schedule.open` et `schedule.close`)
 * pour lesquels le service tient entièrement dans les horaires de travail sans
 * chevaucher un intervalle occupé. C'est la fonction qui répond à la règle :
 * "ne pas vérifier si 12:00 est libre, mais si 12:00 + durée est disponible".
 */
export const computeBookableStarts = (
  date: Date,
  schedule: { open: string; close: string },
  workingIntervals: Interval[],
  busyIntervals: Interval[],
  durationMin: number,
): string[] => {
  if (durationMin <= 0 || workingIntervals.length === 0) return []
  return generateTimeSlots(schedule.open, schedule.close).filter(hhmm =>
    isServiceBookable(new Date(atDateTime(date, hhmm)), durationMin, workingIntervals, busyIntervals),
  )
}

interface UseAvailableSlotsParams {
  salonId: string | null | undefined
  date: Date | null
  /** Durée du service (+ suppléments) en minutes : un créneau n'est renvoyé que si toute cette durée est disponible. */
  durationMin: number
  openingHours: OpeningHour[]
  /** Filtre les créneaux occupés sur ce coiffeur uniquement ; si absent, un créneau pris par n'importe quel coiffeur est bloqué ("au choix du salon"). Les pauses/absences ne sont prises en compte que si un coiffeur précis est fourni. */
  hairdresserId?: string | null
  hairdresserWorkingHours?: OpeningHour[] | null
  /** Réservation à ignorer dans le calcul d'occupation (ex. celle qu'on est en train de reprogrammer). */
  excludeReservationId?: string
  /**
   * Plages à traiter comme occupées en plus de celles déjà en base — pour
   * bloquer les créneaux choisis par d'autres personnes d'une réservation
   * multiple en cours de saisie, qui n'existent pas encore dans Firestore.
   */
  localBusyRanges?: { start: string; durationMin: number }[]
  enabled?: boolean
}

interface UseAvailableSlotsResult {
  slots: string[]
  isFetching: boolean
  isDayClosed: boolean
  workingHours: OpeningHour[]
}

/**
 * Calcule en temps réel les créneaux disponibles pour un salon (et,
 * optionnellement, un coiffeur précis) à une date donnée, en tenant compte
 * des horaires d'ouverture, des pauses, des absences du coiffeur, des heures
 * déjà passées et des réservations existantes — un créneau n'est renvoyé que
 * si TOUTE la durée du service tient dedans (voir `computeBookableStarts`).
 * Écoute Firestore en direct (`onSnapshot` sur `reservations` et
 * `hairdresser_absences`), donc se met à jour automatiquement qu'une
 * réservation soit créée depuis le marketplace ou depuis l'app salon — sans
 * dépendre d'un mécanisme d'invalidation react-query externe.
 *
 * Source unique pour le marketplace (booking client) et l'app salon
 * (nouvelle réservation, reprogrammation, changement de coiffeur).
 */
export function useAvailableSlots({
  salonId,
  date,
  durationMin,
  openingHours,
  hairdresserId = null,
  hairdresserWorkingHours = null,
  excludeReservationId,
  localBusyRanges,
  enabled = true,
}: UseAvailableSlotsParams): UseAvailableSlotsResult {
  const [busyIntervals, setBusyIntervals] = useState<Interval[]>([])
  const [isFetchingReservations, setIsFetchingReservations] = useState(true)
  const [absences, setAbsences] = useState<IHairdresserAbsence[]>([])
  const [isFetchingAbsences, setIsFetchingAbsences] = useState(true)

  const dayKey = date ? toDateKey(date) : null

  useEffect(() => {
    if (!enabled || !salonId || !date) {
      setBusyIntervals([])
      setIsFetchingReservations(false)
      return
    }

    setIsFetchingReservations(true)
    const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999)

    const q = query(collection(db, 'reservations'), where('salonId', '==', salonId))

    const unsub = onSnapshot(q, snapshot => {
      const intervals: Interval[] = []
      snapshot.docs.forEach(doc => {
        if (doc.id === excludeReservationId) return
        const res = doc.data() as IReservation
        if (res.status === reservationStatusEnum.canceled || res.status === reservationStatusEnum.no_show) return
        res.people.forEach(p => {
          if (hairdresserId && p.hairdresserId !== hairdresserId) return
          if (!p.scheduledAt?.toDate || !p.endsAt?.toDate) return
          const start = p.scheduledAt.toDate()
          const end = p.endsAt.toDate()
          if (end <= startOfDay || start >= endOfDay) return
          intervals.push({ start: start.getTime(), end: end.getTime() })
        })
      })
      setBusyIntervals(intervals)
      setIsFetchingReservations(false)
    })

    return unsub
  }, [enabled, salonId, dayKey, hairdresserId, excludeReservationId])

  useEffect(() => {
    if (!enabled || !salonId || !hairdresserId || !date) {
      setAbsences([])
      setIsFetchingAbsences(false)
      return
    }

    setIsFetchingAbsences(true)
    const q = query(
      collection(db, 'hairdresser_absences'),
      where('salonId', '==', salonId),
      where('hairdresserId', '==', hairdresserId),
    )

    const unsub = onSnapshot(q, snapshot => {
      setAbsences(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as IHairdresserAbsence))
      setIsFetchingAbsences(false)
    })

    return unsub
  }, [enabled, salonId, hairdresserId, dayKey])

  const workingHours = getEffectiveWorkingHours(openingHours, hairdresserWorkingHours)
  const dayClosed = date ? isDayClosed(date, workingHours) : true

  const workingIntervals = useMemo(
    () => (date ? getWorkingIntervals(date, openingHours, hairdresserWorkingHours, absences) : []),
    [date, openingHours, hairdresserWorkingHours, absences],
  )

  const allBusyIntervals = useMemo(() => {
    if (!date || !localBusyRanges?.length) return busyIntervals
    const local = localBusyRanges.map(r => {
      const start = atDateTime(date, r.start)
      return { start, end: start + r.durationMin * 60_000 }
    })
    return [...busyIntervals, ...local]
  }, [busyIntervals, localBusyRanges, date])

  const slots = useMemo(() => {
    if (!date || dayClosed) return []
    const schedule = workingHours.find(h => h.day.toLowerCase() === dayNameOf(date))
    if (!schedule) return []
    const bookable = computeBookableStarts(date, schedule, workingIntervals, allBusyIntervals, durationMin)
    return filterPassedHours(bookable, date)
  }, [date, dayClosed, workingHours, workingIntervals, allBusyIntervals, durationMin])

  return {
    slots,
    isFetching: isFetchingReservations || isFetchingAbsences,
    isDayClosed: dayClosed,
    workingHours,
  }
}
