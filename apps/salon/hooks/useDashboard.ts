'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where, orderBy } from 'firebase/firestore'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { useSalon } from './useSalon'

export interface DashboardStats {
  appointmentsToday: number
  monthlyRevenue: number
  activeClients: number
  occupancyRate: number
  reservationsThisWeek: number
  reservationsThisMonth: number
}

export interface DashboardData {
  stats: DashboardStats
  recentReservations: IReservation[]
}

/**
 * Hook pour récupérer les données du dashboard
 */
export const useDashboard = () => {
  const { salonId } = useSalon()

  return useQuery({
    queryKey: ['dashboard', salonId],
    queryFn: async (): Promise<DashboardData> => {
      if (!salonId) {
        throw new Error('Aucun salon sélectionné')
      }

      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

      // Calculer le début de la semaine (lundi)
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      try {
        // Récupérer les 5 dernières réservations
        const reservationsData = await fetchCollection('reservations', [
          where('salonId', '==', salonId),
        ]) as unknown as IReservation[]

        // Trier par date de création décroissante et prendre les 5 premières
        const recentReservations = reservationsData
          .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
          .slice(0, 5)

        // Filtrer les réservations d'aujourd'hui
        const appointmentsTodayList = reservationsData.filter(reservation => {
          if (!reservation.people || reservation.people.length === 0) return false
          const firstPerson = reservation.people[0]
          const scheduledDate = firstPerson.scheduledAt.toDate()
          return (
            scheduledDate >= startOfToday &&
            scheduledDate < endOfToday &&
            reservation.status !== reservationStatusEnum.canceled
          )
        })

        // Filtrer les réservations du mois (payées uniquement)
        const monthReservations = reservationsData.filter(reservation => {
          if (reservation.status === reservationStatusEnum.canceled) return false
          if (!reservation.isPaid) return false
          if (!reservation.people || reservation.people.length === 0) return false
          const firstPerson = reservation.people[0]
          const scheduledDate = firstPerson.scheduledAt.toDate()
          return (
            scheduledDate >= startOfMonth &&
            scheduledDate < endOfMonth
          )
        })

        // Calculer les statistiques
        const monthlyRevenue = monthReservations.reduce((sum, res) => sum + res.totalPrice, 0)
        // Compter les clients uniques du mois
        const uniqueClients = new Set(
          monthReservations.map(res => res.clientEmail || res.clientPhone || res.clientName)
        ).size

        // Réservations de la semaine
        const weekReservations = reservationsData.filter(reservation => {
          if (reservation.status === reservationStatusEnum.canceled) return false
          if (!reservation.isPaid) return false
          if (!reservation.people || reservation.people.length === 0) return false
          
          const firstPerson = reservation.people[0]
          const scheduledDate = firstPerson.scheduledAt.toDate()
          
          return (
            scheduledDate >= startOfWeek &&
            scheduledDate < endOfWeek
          )
        })

        // Calculer le taux d'occupation (pourcentage de créneaux réservés)
        // Pour cette démo, on utilise le nombre de réservations du mois
        const occupancyRate = Math.min(100, (monthReservations.length * 10)) // 10 = facteur pour % réaliste

        const stats: DashboardStats = {
          appointmentsToday: appointmentsTodayList.length,
          monthlyRevenue,
          activeClients: uniqueClients,
          occupancyRate,
          reservationsThisWeek: weekReservations.length,
          reservationsThisMonth: monthReservations.length
        }

        return {
          stats,
          recentReservations
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données du dashboard:', error)
        throw error
      }
    },
    enabled: !!salonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus : true,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
