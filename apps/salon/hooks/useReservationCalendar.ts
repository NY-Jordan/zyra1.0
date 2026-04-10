'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { where, Timestamp } from 'firebase/firestore'
import { fetchCollection, fetchAllSubCollections } from '@zyra/conf/lib/query'
import { IReservation, IReservationPerson } from '@zyra/conf/domain/entities/reservations.entities'
import {
  IHairDresser,
  HairDresserSalonAssociation,
  hairDresserAssociationNameEnum,
} from '@zyra/conf/domain/entities/hairdressers.entities'
import { HairDresserWithSalonAssociation } from '@/usecases/useHairDressers'
import { useSalon } from './useSalon'

export interface CalendarEvent {
  reservation: IReservation
  person: IReservationPerson
  hairdresserId: string
  columnKey: string // hairdresserId or 'unassigned'
  startMinutes: number // minutes since midnight
  durationMinutes: number
}

export type CalendarView = 'day' | 'week'

export function useReservationCalendar() {
  const { salon } = useSalon()
  const salonId = salon?.id

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<CalendarView>('day')

  // Day bounds
  const dayStart = useMemo(
    () =>
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        0, 0, 0,
      ),
    [selectedDate],
  )
  const dayEnd = useMemo(
    () =>
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        23, 59, 59,
      ),
    [selectedDate],
  )

  // Month bounds for calendar highlighting
  const monthStart = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    [selectedDate],
  )
  const monthEnd = useMemo(
    () =>
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0,
        23, 59, 59,
      ),
    [selectedDate],
  )

  // ----- Hairdressers -----
  const { data: hairDressers = [], isLoading: isLoadingHairDressers } = useQuery({
    queryKey: ['salon-hairdressers-calendar', salonId],
    queryFn: async () => {
      if (!salonId) return []
      const associations = (await fetchAllSubCollections(
        hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
        [where('salonId', '==', salonId)],
      )) as HairDresserSalonAssociation[]

      const list = await Promise.all(
        associations.map(async (sh) => {
          const hds = (await fetchCollection('hair_dressers', [
            where('id', '==', sh.parentId),
          ])) as unknown as IHairDresser[]
          return { ...hds[0], associationHairdresser: sh }
        }),
      )
      return list as HairDresserWithSalonAssociation[]
    },
    enabled: !!salonId,
    refetchOnWindowFocus: false,
  })

  // ----- Day reservations -----
  const { data: dayReservations = [], isLoading: isLoadingReservations } = useQuery({
    queryKey: ['reservations-calendar-day', salonId, selectedDate.toDateString()],
    queryFn: () =>
      fetchCollection('reservations', [
        where('salonId', '==', salonId),
        where('earliestScheduledAt', '>=', Timestamp.fromDate(dayStart)),
        where('earliestScheduledAt', '<=', Timestamp.fromDate(dayEnd)),
      ]) as Promise<IReservation[]>,
    enabled: !!salonId,
    refetchOnWindowFocus: true,
  })

  // ----- Month reservations (for calendar dot highlights) -----
  const { data: monthReservations = [] } = useQuery({
    queryKey: [
      'reservations-calendar-month',
      salonId,
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
    ],
    queryFn: () =>
      fetchCollection('reservations', [
        where('salonId', '==', salonId),
        where('earliestScheduledAt', '>=', Timestamp.fromDate(monthStart)),
        where('earliestScheduledAt', '<=', Timestamp.fromDate(monthEnd)),
      ]) as Promise<IReservation[]>,
    enabled: !!salonId,
    refetchOnWindowFocus: false,
  })

  // Days that have at least one reservation (for calendar dots)
  const daysWithReservations = useMemo(() => {
    const days = new Set<string>()
    monthReservations.forEach((r) => {
      const ts = r.earliestScheduledAt ?? r.people?.[0]?.scheduledAt
      if (ts) {
        const d = ts.toDate()
        days.add(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        )
      }
    })
    return days
  }, [monthReservations])

  // ----- Build calendar events per hairdresser column -----
  const eventsByColumn = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = { unassigned: [] }
    hairDressers.forEach((hd) => {
      map[hd.id] = []
    })

    dayReservations.forEach((reservation) => {
      reservation.people.forEach((person) => {
        const columnKey = person.hairdresserId || 'unassigned'
        if (!map[columnKey]) map[columnKey] = []

        const startDate = person.scheduledAt.toDate()
        const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
        const durationMinutes = person.totalDuration || 60

        map[columnKey].push({
          reservation,
          person,
          hairdresserId: person.hairdresserId || '',
          columnKey,
          startMinutes,
          durationMinutes,
        })
      })
    })

    // Sort events in each column by start time
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.startMinutes - b.startMinutes)
    })

    return map
  }, [dayReservations, hairDressers])

  // Columns to display: all hairdressers + unassigned if it has events
  const columns = useMemo(() => {
    const cols = hairDressers.map((hd) => ({ id: hd.id, label: hd.name, photo: hd.photo }))
    if ((eventsByColumn['unassigned']?.length ?? 0) > 0) {
      cols.push({ id: 'unassigned', label: 'Non assigné', photo: '' })
    }
    return cols
  }, [hairDressers, eventsByColumn])

  // ----- Navigation -----
  const goToday = () => setSelectedDate(new Date())
  const goPrev = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }
  const goNext = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  return {
    selectedDate,
    setSelectedDate,
    view,
    setView,
    hairDressers,
    dayReservations,
    eventsByColumn,
    columns,
    daysWithReservations,
    isLoading: isLoadingReservations || isLoadingHairDressers,
    goToday,
    goPrev,
    goNext,
  }
}
