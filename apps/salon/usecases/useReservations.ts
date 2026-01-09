import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollectionPaginate, fetchCollection, editDocument } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'

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
const isValidStatusTransition = (currentStatus: reservationStatusEnum, newStatus: reservationStatusEnum): boolean => {
  // Les transitions valides
  const validTransitions: Record<reservationStatusEnum, reservationStatusEnum[]> = {
    [reservationStatusEnum.pending]: [reservationStatusEnum.confirmed, reservationStatusEnum.canceled],
    [reservationStatusEnum.confirmed]: [reservationStatusEnum.completed, reservationStatusEnum.canceled],
    [reservationStatusEnum.completed]: [], // État final
    [reservationStatusEnum.canceled]: [] // État final
  }

  return validTransitions[currentStatus].includes(newStatus)
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
      currentStatus,
      newStatus
    }: {
      reservationId: string
      currentStatus: reservationStatusEnum
      newStatus: reservationStatusEnum
    }) => {
      // Valider la transition de statut
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        throw new Error(
          `Transition invalide : ${currentStatus} → ${newStatus}. ` +
          `Les transitions valides sont : pending→confirmed/canceled, confirmed→completed/canceled, completed→canceled`
        )
      }

      // Mettre à jour le document
      await editDocument('reservations', reservationId, {
        status: newStatus,
        updatedAt: new Date()
      })

      return { reservationId, newStatus }
    },
    onSuccess: () => {
      // Invalider les queries de réservations pour rafraîchir
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
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
      isPaid
    }: {
      reservationId: string
      isPaid: boolean
    }) => {
      await editDocument('reservations', reservationId, {
        isPaid,
        updatedAt: new Date()
      })

      return { reservationId, isPaid }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    }
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
