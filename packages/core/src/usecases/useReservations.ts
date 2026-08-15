import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollectionPaginate, fetchCollection, editDocument, releaseAppointmentSlots, updateReservationSlots } from '@zyra/conf/lib/query'
import { Timestamp, where } from 'firebase/firestore'
import { IReservation, IReservationPerson } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { logActivity, createNotification } from './notificationsUseCases'
import { LogContext } from '../types/notifications.types'

export interface ReservationFilters {
  salonId: string
  page?: number
  pageSize?: number
  status?: reservationStatusEnum | 'all'
  isPaid?: boolean | 'all'
  dateFilter?: 'all' | 'today' | 'week' | 'month'
  searchTerm?: string
  reservationNumber?: string
}

/**
 * Logique de transition des statuts de réservation
 * - pending → confirmed OU canceled (états finals: completed, canceled)
 * - confirmed → completed OU canceled
 * - completed → état final (pas de transition)
 * - canceled → état final (pas de transition)
 */
export const isValidStatusTransition = (currentStatus: reservationStatusEnum, newStatus: reservationStatusEnum): boolean => {
  // Les transitions valides
  const validTransitions: Record<reservationStatusEnum, reservationStatusEnum[]> = {
    [reservationStatusEnum.pending]: [
      reservationStatusEnum.confirmed,
      reservationStatusEnum.canceled,
      reservationStatusEnum.checked_in,
      reservationStatusEnum.no_show,
    ],
    [reservationStatusEnum.confirmed]: [
      reservationStatusEnum.completed,
      reservationStatusEnum.canceled,
      reservationStatusEnum.checked_in,
      reservationStatusEnum.no_show,
    ],
    [reservationStatusEnum.checked_in]: [reservationStatusEnum.completed, reservationStatusEnum.canceled],
    [reservationStatusEnum.no_show]: [], // État final
    [reservationStatusEnum.rescheduled]: [], // Marqueur de log : une résa déplacée repasse "confirmed"
    [reservationStatusEnum.completed]: [], // État final
    [reservationStatusEnum.canceled]: [] // État final
  }

  return validTransitions[currentStatus].includes(newStatus)
}

/** Statut effectif d'une personne, avec repli sur le statut global pour les
 *  réservations créées avant l'introduction du statut par personne. */
export const personStatus = (person: IReservationPerson, reservation: Pick<IReservation, 'status'>): reservationStatusEnum =>
  person.status ?? reservation.status

/**
 * Dérive le statut global d'une réservation à partir du statut de chaque
 * personne. Pour une réservation à une seule personne, le résultat est
 * toujours exactement le statut de cette personne (comportement inchangé).
 *
 * Priorité : tant qu'une personne active n'a pas avancé, le groupe entier
 * reste "en attente / à traiter" à ce niveau — c'est ce qu'un membre du salon
 * doit voir en premier pour savoir s'il reste du travail sur la réservation.
 */
export const computeGroupStatus = (people: IReservationPerson[], fallback: reservationStatusEnum): reservationStatusEnum => {
  const statuses: reservationStatusEnum[] = people.map(p => p.status ?? fallback)
  if (statuses.length === 0) return fallback

  const active: reservationStatusEnum[] = statuses.filter(s => s !== reservationStatusEnum.canceled)

  if (active.length === 0) return reservationStatusEnum.canceled

  const nonTerminal: reservationStatusEnum[] = active.filter(
    s => s !== reservationStatusEnum.completed && s !== reservationStatusEnum.no_show,
  )

  if (nonTerminal.length === 0) {
    // Tout le monde est dans un état final (hors annulé) : le groupe est
    // "terminé" dès qu'au moins une personne l'est vraiment, sinon "absent".
    return active.includes(reservationStatusEnum.completed)
      ? reservationStatusEnum.completed
      : reservationStatusEnum.no_show
  }

  const ladder: reservationStatusEnum[] = [reservationStatusEnum.pending, reservationStatusEnum.confirmed, reservationStatusEnum.checked_in]
  const found = ladder.find(s => nonTerminal.includes(s))
  return found ?? nonTerminal[0]!
}

/**
 * Somme des `totalPrice` des personnes d'une réservation dont le statut
 * effectif (voir `personStatus`) satisfait `predicate`.
 *
 * À utiliser à la place de `reservation.totalPrice` pour tout calcul de
 * revenu : le statut global d'une réservation groupée (`computeGroupStatus`)
 * peut valoir "completed" alors qu'une des personnes a été annulée
 * individuellement — sommer `reservation.totalPrice` compterait alors aussi
 * la part de la personne annulée.
 */
export const personRevenueSum = (
  reservation: Pick<IReservation, 'people' | 'status'>,
  predicate: (status: reservationStatusEnum) => boolean,
): number =>
  reservation.people.reduce(
    (sum, p) => (predicate(personStatus(p, reservation)) ? sum + p.totalPrice : sum),
    0,
  )

/** Heure de début la plus tôt d'une réservation (ms epoch). */
const reservationStartMs = (reservation: Pick<IReservation, 'earliestScheduledAt' | 'people'>): number => {
  const ts = reservation.earliestScheduledAt ?? reservation.people?.[0]?.scheduledAt
  return ts ? ts.toDate().getTime() : 0
}

/**
 * Hook pour récupérer les réservations avec filtrage
 */
export const useReservations = (filters: ReservationFilters) => {
  const {
    salonId,
    page = 1,
    pageSize = 10,
    status = 'all',
    isPaid = 'all',
    dateFilter = 'all',
    searchTerm = '',
    reservationNumber = ''
  } = filters

  return useQuery({
    queryKey: ['reservations', salonId, page, pageSize, status, isPaid, dateFilter, searchTerm, reservationNumber],
    queryFn: async () => {
      if (!salonId) return { data: [], total: 0 }

      // Construire les constraints
      const constraints: any[] = [where('salonId', '==', salonId)]

      // Filtrer par numéro de réservation si présent
      if (reservationNumber && reservationNumber.length === 5) {
        constraints.push(where('reservationNumber', '==', reservationNumber))
      }

      // Filtrer par statut
      if (status !== 'all') {
        constraints.push(where('status', '==', status))
      }

      // Filtrer par paiement
      if (isPaid === true) {
        constraints.push(where('isPaid', '==', true))
      } else if (isPaid === false) {
        constraints.push(where('isPaid', '==', false))
      }

      // Récupérer les données paginées
      const result = await fetchCollectionPaginate('reservations', {
        page,
        pageSize,
        orderDirection: 'desc',
        constraints
      })

      let filteredData = result.data as IReservation[]

      // Filtrage client-side (date et recherche texte)
      if (dateFilter !== 'all' || searchTerm) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        filteredData = filteredData.filter(reservation => {
          // Filtrer par date
          if (dateFilter !== 'all') {
            const firstPerson = reservation.people?.[0]
            if (!firstPerson) return false
            const resDate = firstPerson.scheduledAt.toDate()

            switch (dateFilter) {
              case 'today':
                return resDate >= today && resDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
              case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                return resDate >= weekAgo
              case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                return resDate >= monthAgo
              default:
                return true
            }
          }
          return true
        })

        // Filtrer par terme de recherche
        if (searchTerm) {
          filteredData = filteredData.filter(reservation =>
            reservation.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.clientPhone?.includes(searchTerm) ||
            reservation.people?.[0]?.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
      }

      return {
        data: filteredData,
        total: result.total
      }
    },
    enabled: !!salonId
  })
}

/**
 * Hook pour mettre à jour le statut d'une réservation
 */
export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reservationId,
      salonId,
      currentStatus,
      newStatus,
      people,
      additionalData = {},
      logContext,
      startMs,
    }: {
      reservationId: string
      salonId: string
      currentStatus: reservationStatusEnum
      newStatus: reservationStatusEnum
      /** Quand fourni, l'action s'applique à TOUTE la réservation : chaque
       *  personne reçoit aussi le nouveau statut (ex: "Annuler" depuis la carte). */
      people?: IReservationPerson[]
      additionalData?: Record<string, unknown>
      logContext?: LogContext
      startMs?: number
    }) => {
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        throw new Error(
          `Transition invalide : ${currentStatus} → ${newStatus}.`
        )
      }

      // Garde : on ne peut plus confirmer une fois l'heure de début atteinte
      if (
        newStatus === reservationStatusEnum.confirmed &&
        typeof startMs === 'number' &&
        Date.now() >= startMs
      ) {
        throw new Error("L'heure de début est dépassée : la réservation ne peut plus être confirmée.")
      }

      const updatedPeople = people?.map(p => ({ ...p, status: newStatus }))

      await editDocument('reservations', reservationId, {
        status: newStatus,
        ...(updatedPeople ? { people: updatedPeople } : {}),
        ...additionalData,
        updatedAt: new Date(),
      })

      // Le créneau est libéré : ne bloque plus les réservations futures.
      if (people && (newStatus === reservationStatusEnum.canceled || newStatus === reservationStatusEnum.no_show)) {
        await releaseAppointmentSlots(salonId, people)
      }

      if (logContext) {
        const typeMap: Record<string, any> = {
          [reservationStatusEnum.confirmed]: 'reservation_confirmed',
          [reservationStatusEnum.canceled]: 'reservation_canceled',
          [reservationStatusEnum.completed]: 'reservation_completed',
          [reservationStatusEnum.checked_in]: 'reservation_checked_in',
          [reservationStatusEnum.no_show]: 'reservation_no_show',
        }
        const type = typeMap[newStatus]
        const titleMap: Record<string, string> = {
          reservation_confirmed: 'Réservation confirmée',
          reservation_canceled: 'Réservation annulée',
          reservation_completed: 'Réservation terminée',
          reservation_checked_in: 'Client arrivé',
          reservation_no_show: 'Client absent',
        }
        if (type) {
          await Promise.all([
            logActivity({ ...logContext, type, action: newStatus, resourceId: reservationId, resourceType: 'reservation' }),
            createNotification({ salonId: logContext.salonId, type, title: titleMap[type] ?? type, body: logContext.resourceLabel ?? '', resourceId: reservationId, resourceType: 'reservation' }),
          ])
        }
      }

      return { reservationId, newStatus, updatedPeople }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-month'] })
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers-calendar'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    }
  })
}

/**
 * Hook pour mettre à jour le statut de paiement d'une réservation
 */
export const useUpdateReservationPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reservationId,
      isPaid,
      logContext,
    }: {
      reservationId: string
      isPaid: boolean
      logContext?: LogContext
    }) => {
      await editDocument('reservations', reservationId, {
        isPaid,
        updatedAt: new Date()
      })

      if (logContext && isPaid) {
        await Promise.all([
          logActivity({ ...logContext, type: 'reservation_paid', action: 'paid', resourceId: reservationId, resourceType: 'reservation' }),
          createNotification({ salonId: logContext.salonId, type: 'reservation_paid', title: 'Réservation payée', body: logContext.resourceLabel ?? '', resourceId: reservationId, resourceType: 'reservation' }),
        ])
      }

      return { reservationId, isPaid }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-month'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    }
  })
}

/**
 * Hook pour modifier le coiffeur (et le créneau) d'une personne dans une réservation
 */
export const useUpdatePersonHairdresser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reservation,
      personIndex,
      hairdresserId,
      hairdresserName,
      date,
      time,
      logContext,
    }: {
      reservation: IReservation
      personIndex: number
      hairdresserId: string
      hairdresserName: string
      date: Date
      time: string
      logContext?: LogContext
    }) => {
      const person = reservation.people[personIndex]
      if (!person) throw new Error('Personne non trouvée')

      const scheduledAt = new Date(date)
      const [h = 0, m = 0] = time.split(':').map(Number)
      scheduledAt.setHours(h, m, 0, 0)
      const endsAt = new Date(scheduledAt.getTime() + person.totalDuration * 60 * 1000)

      // Changer le créneau/coiffeur d'une personne revient à la reprogrammer :
      // elle repart "en attente" comme le fait la reprogrammation globale
      // (useRescheduleReservation), pour re-confirmation par le salon.
      const currentStatus = personStatus(person, reservation)
      const resetStatus = isValidStatusTransition(currentStatus, reservationStatusEnum.pending)

      const updatedPeople = reservation.people.map((p, i) =>
        i === personIndex
          ? {
              ...p,
              hairdresserId,
              hairdresserName,
              scheduledAt: Timestamp.fromDate(scheduledAt),
              endsAt: Timestamp.fromDate(endsAt),
              ...(resetStatus ? { status: reservationStatusEnum.pending } : {}),
            }
          : p,
      )
      const newGroupStatus = computeGroupStatus(updatedPeople, reservation.status)

      // Libère le verrou de l'ancien créneau de cette personne et pose celui du
      // nouveau dans une seule transaction : échoue (SlotConflictError) si le
      // nouveau coiffeur/créneau est déjà pris — non vérifié auparavant.
      await updateReservationSlots(reservation.id, reservation.salonId, [person], [updatedPeople[personIndex]!], {
        people: updatedPeople,
        status: newGroupStatus,
        updatedAt: new Date(),
      })

      if (logContext) {
        await Promise.all([
          logActivity({ ...logContext, type: 'reservation_hairdresser_changed', action: 'hairdresser_changed', resourceId: reservation.id, resourceType: 'reservation', metadata: { hairdresser: hairdresserName } }),
          createNotification({ salonId: logContext.salonId, type: 'reservation_hairdresser_changed', title: 'Coiffeur modifié', body: `${logContext.resourceLabel ?? ''} → ${hairdresserName}`, resourceId: reservation.id, resourceType: 'reservation' }),
        ])
      }

      return { personIndex, updatedPeople, scheduledAt, endsAt, newGroupStatus }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-month'] })
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers-calendar'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

const PERSON_STATUS_TITLE: Record<string, string> = {
  [reservationStatusEnum.confirmed]: 'confirmé(e)',
  [reservationStatusEnum.canceled]: 'annulé(e)',
  [reservationStatusEnum.checked_in]: 'arrivé(e)',
  [reservationStatusEnum.no_show]: 'marqué(e) absent(e)',
  [reservationStatusEnum.completed]: 'terminé(e)',
}

/**
 * Hook pour changer le statut d'UNE personne dans une réservation groupée,
 * sans affecter les autres. Le statut global de la réservation est recalculé
 * et enregistré dans la même écriture (voir `computeGroupStatus`), donc tout
 * le code existant qui lit `reservation.status` continue de fonctionner.
 */
export const useUpdatePersonStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reservation,
      personIndex,
      newStatus,
      logContext,
    }: {
      reservation: IReservation
      personIndex: number
      newStatus: reservationStatusEnum
      logContext?: LogContext
    }) => {
      const person = reservation.people[personIndex]
      if (!person) throw new Error('Personne non trouvée')

      const currentStatus = personStatus(person, reservation)
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        throw new Error(`Transition invalide : ${currentStatus} → ${newStatus}.`)
      }

      const updatedPeople = reservation.people.map((p, i) =>
        i === personIndex ? { ...p, status: newStatus } : p,
      )
      const newGroupStatus = computeGroupStatus(updatedPeople, reservation.status)

      await editDocument('reservations', reservation.id, {
        people: updatedPeople,
        status: newGroupStatus,
        updatedAt: new Date(),
      })

      // Le créneau de cette personne est libéré : ne bloque plus les réservations futures.
      if (newStatus === reservationStatusEnum.canceled || newStatus === reservationStatusEnum.no_show) {
        await releaseAppointmentSlots(reservation.salonId, [person])
      }

      if (logContext) {
        const label = `Personne ${person.personNumber} ${PERSON_STATUS_TITLE[newStatus] ?? newStatus}`
        await Promise.all([
          logActivity({
            ...logContext,
            type: 'reservation_person_status_changed',
            action: newStatus,
            resourceId: reservation.id,
            resourceType: 'reservation',
            metadata: { personNumber: person.personNumber, status: newStatus },
          }),
          createNotification({
            salonId: logContext.salonId,
            type: 'reservation_person_status_changed',
            title: label,
            body: logContext.resourceLabel ?? '',
            resourceId: reservation.id,
            resourceType: 'reservation',
          }),
        ])
      }

      return { personIndex, updatedPeople, newGroupStatus }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-month'] })
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers-calendar'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

/**
 * Hook pour reprogrammer une réservation (déplacer la même réservation vers un nouveau créneau).
 * Les personnes sont repositionnées séquentiellement à partir du nouveau créneau de départ,
 * en conservant la durée de chacune. Le statut repasse à "confirmed".
 */
export const useRescheduleReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reservation,
      date,
      time,
      hairdresserId,
      hairdresserName,
      logContext,
    }: {
      reservation: IReservation
      date: Date
      time: string
      hairdresserId?: string
      hairdresserName?: string
      logContext?: LogContext
    }) => {
      const [h = 0, m = 0] = time.split(':').map(Number)
      let cursor = new Date(date)
      cursor.setHours(h, m, 0, 0)

      const updatedPeople = reservation.people.map(person => {
        const scheduledAt = new Date(cursor)
        const endsAt = new Date(scheduledAt.getTime() + (person.totalDuration || 0) * 60 * 1000)
        cursor = endsAt
        return {
          ...person,
          ...(hairdresserId ? { hairdresserId, hairdresserName } : {}),
          scheduledAt: Timestamp.fromDate(scheduledAt),
          endsAt: Timestamp.fromDate(endsAt),
          // Repart en attente comme le statut global, sinon le prochain calcul
          // de computeGroupStatus se baserait sur un statut par personne obsolète.
          status: reservationStatusEnum.pending,
        }
      })

      const earliest = updatedPeople[0]?.scheduledAt
      const latest = updatedPeople.reduce<typeof updatedPeople[number]['endsAt'] | undefined>(
        (acc, p) => (!acc || p.endsAt.seconds > acc.seconds ? p.endsAt : acc),
        undefined,
      )

      // Libère les anciens créneaux et verrouille les nouveaux dans une seule
      // transaction : échoue proprement (SlotConflictError) si l'un d'eux vient
      // d'être pris — la reprogrammation n'écrasait aucun conflit avant ce garde-fou.
      await updateReservationSlots(reservation.id, reservation.salonId, reservation.people, updatedPeople, {
        people: updatedPeople,
        // Une résa reprogrammée repart en attente (re-confirmation nécessaire)
        status: reservationStatusEnum.pending,
        wasRescheduled: true,
        rescheduledAt: Timestamp.fromDate(new Date()),
        earliestScheduledAt: earliest,
        latestEndsAt: latest,
        updatedAt: new Date(),
      })

      if (logContext) {
        await Promise.all([
          logActivity({ ...logContext, type: 'reservation_rescheduled', action: 'rescheduled', resourceId: reservation.id, resourceType: 'reservation', metadata: { date: date.toLocaleDateString('fr-FR'), heure: time } }),
          createNotification({ salonId: logContext.salonId, type: 'reservation_rescheduled', title: 'Réservation reprogrammée', body: `${logContext.resourceLabel ?? ''} → ${date.toLocaleDateString('fr-FR')} ${time}`, resourceId: reservation.id, resourceType: 'reservation' }),
        ])
      }

      return { reservationId: reservation.id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-month'] })
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers-calendar'] })
      queryClient.invalidateQueries({ queryKey: ['hd-day-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['hd-day-reservations-new'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

/**
 * Hook pour récupérer une réservation par son numéro
 */
export const useReservationByNumber = (salonId: string, reservationNumber: string) => {
  return useQuery({
    queryKey: ['reservation-by-number', salonId, reservationNumber],
    queryFn: async () => {
      if (!salonId || reservationNumber.length !== 5) return null

      try {
        const results = await fetchCollection('reservations', [
          where('salonId', '==', salonId),
          where('reservationNumber', '==', reservationNumber)
        ])

        return (results as IReservation[])[0] || null
      } catch (error) {
        console.error('Erreur lors de la recherche de réservation:', error)
        return null
      }
    },
    enabled: !!salonId && reservationNumber.length === 5
  })
}
