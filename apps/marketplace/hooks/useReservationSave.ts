'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { IReservation, IReservationPerson } from '@zyra/conf/domain/entities/reservations.entities'
import { Timestamp } from 'firebase/firestore'
import { Booking } from '@/app/booking/[id]/types'
import { reservationPaymentMethodEnum, reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { createDocument, fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'

/** Deux intervalles [aStart,aEnd) et [bStart,bEnd) se chevauchent-ils ? */
const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd

export function useReservationSave() {
  /**
   * Générer un numéro de réservation aléatoire de 5 chiffres
   */
  const generateReservationNumber = (): string => {
    return String(Math.floor(Math.random() * 90000) + 10000)
  }
  /**
   * Convertir les données du booking en IReservationPerson
   * Prend directement les heures de début et fin
   */
  const buildReservationPerson = useCallback((
    booking: Booking,
    personNumber: number,
    scheduledAt: Date,
    endsAt: Date
  ): IReservationPerson | null => {
    if (!booking.service) {
      return null
    }

    // Calculer les prix et durées des suppléments
    const supplementsTotalPrice = booking.supplements.reduce((sum, supplement) => {
      const supplementData = booking.service?.supplements?.find(s => s.name === supplement.name)
      return sum + (supplementData?.price || 0)
    }, 0)

    const supplementsTotalDuration = booking.supplements.reduce((sum, supplement) => {
      const supplementData = booking.service?.supplements?.find(s => s.name === supplement.name)
      return sum + (supplementData?.duration || 0)
    }, 0)

    const totalDuration = (booking.service.duration || 0) + supplementsTotalDuration
    const totalPrice = (booking.service.price || 0) + supplementsTotalPrice

    return {
      personNumber,
      serviceId: booking.service.id,
      serviceName: booking.service.name,
      serviceDuration: booking.service.duration || 0,
      servicePrice: booking.service.price || 0,
      hairdresserId: booking.hairdresser?.parentId || null,
      supplements: booking.service.supplements?.filter(s => booking.supplements.includes(s)) || [],
      supplementsTotalPrice,
      supplementsTotalDuration,
      totalPrice,
      totalDuration,
      scheduledAt: Timestamp.fromDate(scheduledAt),
      endsAt: Timestamp.fromDate(endsAt),
    }
  }, [])

  /**
   * Créer une réservation à partir des données du booking
   * bookingsWithTimes: tableau de {booking, scheduledAt, endsAt}
   */
  const createReservation = useCallback((
    salonId: string,
    bookingsWithTimes: Array<{ booking: Booking; scheduledAt: Date; endsAt: Date }>,
    clientInfo: {
      clientName: string
      clientPhone: string
      clientEmail?: string
      notes?: string
      userId?: string | null
    },
    isSingleReservation: boolean
  ): IReservation | null => {
    try {
      // Valider les données
      if (!salonId || !clientInfo.clientName || !clientInfo.clientPhone) {
        toast.error('Infos client incomplètes')
        return null
      }

      if (bookingsWithTimes.length === 0) {
        toast.error('Aucune réservation à enregistrer')
        return null
      }

      // Construire les personnes
      const people: IReservationPerson[] = []
      let totalPrice = 0
      let earliestScheduledAt: Date | null = null
      let latestEndsAt: Date | null = null

      bookingsWithTimes.forEach(({ booking, scheduledAt, endsAt }, index) => {
        const person = buildReservationPerson(booking, index + 1, scheduledAt, endsAt)
        if (person) {
          people.push(person)
          totalPrice += person.totalPrice

          // Tracker les dates min/max
          if (!earliestScheduledAt || scheduledAt < earliestScheduledAt) {
            earliestScheduledAt = scheduledAt
          }
          if (!latestEndsAt || endsAt > latestEndsAt) {
            latestEndsAt = endsAt
          }
        }
      })

      if (people.length === 0) {
        toast.error('Impossible de créer la réservation')
        return null
      }

      // Créer la réservation
      const reservation: IReservation = {
        id: '', // Sera généré par Firebase
        salonId,
        reservationNumber: generateReservationNumber(),
        createdAt: Timestamp.now(),
        clientName: clientInfo.clientName,
        clientPhone: clientInfo.clientPhone,
        clientEmail: clientInfo.clientEmail,
        userId: clientInfo.userId || null,
        isGuest: !clientInfo.userId,
        status: reservationStatusEnum.pending,
        notes: clientInfo.notes || '',
        isPaid: false,
        paymentMethod: reservationPaymentMethodEnum.cash,
        isSingleReservation,
        totalPrice,
        people,
        earliestScheduledAt: earliestScheduledAt ? Timestamp.fromDate(earliestScheduledAt) : undefined,
        latestEndsAt: latestEndsAt ? Timestamp.fromDate(latestEndsAt) : undefined,
      }

      return reservation
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error)
      toast.error('Erreur lors de la création de la réservation')
      return null
    }
  }, [buildReservationPerson])

  /**
   * Enregistrer la réservation dans Firestore (collection: reservations)
   * Utilise la fonction createDocument de query.ts
   */
  const saveReservation = useCallback(async (
    reservation: IReservation
  ): Promise<{ success: boolean; reservationId?: string; error?: string }> => {
    try {
      // Re-vérification temps réel : le créneau est-il encore libre ?
      // (ferme la course entre l'affichage et l'enregistrement)
      try {
        const existing = await fetchCollection('reservations', [
          where('salonId', '==', reservation.salonId),
        ]) as IReservation[]

        const conflict = reservation.people.some(np => {
          const npStart = np.scheduledAt.toDate().getTime()
          const npEnd = np.endsAt.toDate().getTime()
          return existing.some(res => {
            if (res.status === reservationStatusEnum.canceled || res.status === reservationStatusEnum.no_show) return false
            return res.people.some(ep => {
              // Conflit seulement si même coiffeur (ou créneau global si pas de coiffeur)
              if (np.hairdresserId && ep.hairdresserId && np.hairdresserId !== ep.hairdresserId) return false
              const epStart = ep.scheduledAt.toDate().getTime()
              const epEnd = ep.endsAt.toDate().getTime()
              return overlaps(npStart, npEnd, epStart, epEnd)
            })
          })
        })

        if (conflict) {
          toast.error('Ce créneau vient d\'être réservé. Veuillez en choisir un autre.')
          return { success: false, error: 'SLOT_TAKEN' }
        }
      } catch (_) {
        // En cas d'échec de la vérification, on laisse la création se poursuivre
      }

      // Supprimer l'id vide avant d'enregistrer
      const { id, ...reservationData } = reservation
      // Utiliser createDocument pour enregistrer dans la collection 'reservations'
      const reservationId = await createDocument('reservations', reservationData)

      // Notifier le salon en temps réel
      try {
        await createDocument('notifications', {
          salonId: reservation.salonId,
          type: 'reservation_created',
          title: 'Nouvelle réservation',
          body: `${reservation.clientName} · ${reservation.totalPrice.toLocaleString()} XAF`,
          resourceId: reservationId,
          resourceType: 'reservation',
          read: false,
          createdAt: reservation.createdAt,
        })
      } catch (_) {}

      toast.success('Réservation enregistrée avec succès!')
      return { success: true, reservationId }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur lors de l\'enregistrement:', errorMessage)
      toast.error(`Erreur: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }, [])

  /**
   * Workflow complet: créer + enregistrer
   */
  const createAndSaveReservation = useCallback(async (
    salonId: string,
    bookingsWithTimes: Array<{ booking: Booking; scheduledAt: Date; endsAt: Date }>,
    clientInfo: {
      clientName: string
      clientPhone: string
      clientEmail?: string
      userId?: string | null
      notes?: string
    },
    isSingleReservation: boolean
  ) => {
    const reservation = createReservation(salonId, bookingsWithTimes, clientInfo, isSingleReservation)
    if (!reservation) return { success: false }

    return await saveReservation(reservation)
  }, [createReservation, saveReservation])

  return {
    buildReservationPerson,
    createReservation,
    saveReservation,
    createAndSaveReservation,
  }
}
