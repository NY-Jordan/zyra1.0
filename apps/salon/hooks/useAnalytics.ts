'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { IOrder } from '@zyra/conf/domain/entities/orders.entities'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { orderStatusEnum } from '@zyra/conf/domain/enums/OrderEnum'
import { personStatus, personRevenueSum } from '@zyra/core/usecases/useReservations'
import { useSalon } from './useSalon'

export type AnalyticsPeriod = 'today' | '7d' | '30d' | '3m' | '6m' | 'all'

export interface MonthlyPoint { month: string; shortMonth: string; reservations: number; orders: number; revenue: number }
export interface ServiceStat { name: string; count: number; revenue: number }
export interface HairdresserStat { name: string; reservations: number; revenue: number }
export interface TopClient { name: string; phone: string; visits: number; total: number }
export interface PeakDay { day: string; short: string; count: number }

export interface AnalyticsData {
  totalRevenue: number
  monthRevenue: number
  weekRevenue: number
  avgReservationValue: number
  revenueByMethod: { cash: number; mobile: number; card: number }
  totalReservations: number
  reservationsByStatus: { pending: number; confirmed: number; completed: number; canceled: number }
  completionRate: number
  cancellationRate: number
  reservationsToday: number
  reservationsThisWeek: number
  reservationsThisMonth: number
  totalOrders: number
  ordersCompleted: number
  ordersCanceled: number
  ordersRevenue: number
  totalClients: number
  activeClients: number
  returningClients: number
  newClientsThisMonth: number
  topClients: TopClient[]
  topServices: ServiceStat[]
  hairdresserStats: HairdresserStat[]
  monthlyTrend: MonthlyPoint[]
  peakDays: PeakDay[]
}

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const SHORT_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const SHORT_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function getPeriodStart(period: AnalyticsPeriod): Date | null {
  const now = new Date()
  switch (period) {
    case 'today': { const d = new Date(now); d.setHours(0, 0, 0, 0); return d }
    case '7d': return new Date(now.getTime() - 7 * 86400000)
    case '30d': return new Date(now.getTime() - 30 * 86400000)
    case '3m': return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    case '6m': return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    case 'all': return null
  }
}

export const useAnalytics = (period: AnalyticsPeriod = 'all') => {
  const { salonId } = useSalon()

  return useQuery({
    queryKey: ['analytics', salonId, period],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!salonId) throw new Error('Salon non trouvé')

      const now = new Date()
      const periodStart = getPeriodStart(period)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
      startOfWeek.setHours(0, 0, 0, 0)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const [reservationsRaw, ordersRaw, clientsRaw] = await Promise.all([
        fetchCollection('reservations', [where('salonId', '==', salonId)]) as Promise<IReservation[]>,
        fetchCollection('orders', [where('salonId', '==', salonId)]) as Promise<IOrder[]>,
        fetchCollection('clients', [where('salonId', '==', salonId)]) as Promise<IClient[]>,
      ])

      const reservations = (reservationsRaw as IReservation[]).filter(r => {
        if (!periodStart) return true
        const d = r.people?.[0]?.scheduledAt?.toDate?.()
        return d ? d >= periodStart : new Date(r.createdAt as any) >= periodStart
      })

      const orders = (ordersRaw as IOrder[]).filter(o => {
        if (!periodStart) return true
        return new Date(o.createdAt) >= periodStart
      })

      const clients = clientsRaw as IClient[]

      const activeReservations = reservations.filter(r => r.status !== reservationStatusEnum.canceled)

      // ── Revenue ────────────────────────────────────────────────────────────────

      const paidReservations = reservations.filter(r => r.isPaid && r.status !== reservationStatusEnum.canceled)
      const paidOrders = orders.filter(o => o.isPaid && o.status !== 'canceled')

      // On somme par personne (personRevenueSum) le revenu des personnes
      // effectivement "completed" — pas r.totalPrice ni "non annulé" : dans un
      // groupe mixte (ex. 1 absente, 1 terminée), seule la part de la
      // personne terminée doit compter, pas celle de l'absente/en attente/etc.
      const totalRevenue =
        paidReservations.reduce((s, r) => s + personRevenueSum(r, st => st === reservationStatusEnum.completed), 0) +
        paidOrders.reduce((s, o) => s + o.totalPrice, 0)

      const monthRevenue =
        paidReservations
          .filter(r => { const d = r.people?.[0]?.scheduledAt?.toDate?.(); return d && d >= startOfMonth })
          .reduce((s, r) => s + personRevenueSum(r, st => st === reservationStatusEnum.completed), 0) +
        paidOrders
          .filter(o => new Date(o.createdAt) >= startOfMonth)
          .reduce((s, o) => s + o.totalPrice, 0)

      const weekRevenue =
        paidReservations
          .filter(r => { const d = r.people?.[0]?.scheduledAt?.toDate?.(); return d && d >= startOfWeek })
          .reduce((s, r) => s + personRevenueSum(r, st => st === reservationStatusEnum.completed), 0) +
        paidOrders
          .filter(o => new Date(o.createdAt) >= startOfWeek)
          .reduce((s, o) => s + o.totalPrice, 0)

      const avgReservationValue = paidReservations.length > 0
        ? paidReservations.reduce((s, r) => s + personRevenueSum(r, st => st === reservationStatusEnum.completed), 0) / paidReservations.length
        : 0

      const revenueByMethod = { cash: 0, mobile: 0, card: 0 }
      paidReservations.forEach(r => {
        const m = r.paymentMethod as string
        const rev = personRevenueSum(r, st => st === reservationStatusEnum.completed)
        if (m === 'cash') revenueByMethod.cash += rev
        else if (m === 'mobile') revenueByMethod.mobile += rev
        else if (m === 'card') revenueByMethod.card += rev
      })
      paidOrders.forEach(o => {
        if (o.paymentMethod === 'cash') revenueByMethod.cash += o.totalPrice
        else if (o.paymentMethod === 'mobile') revenueByMethod.mobile += o.totalPrice
      })

      // ── Reservations ───────────────────────────────────────────────────────────

      const byStatus = { pending: 0, confirmed: 0, completed: 0, canceled: 0 }
      reservations.forEach(r => {
        const s = r.status as string
        if (s in byStatus) byStatus[s as keyof typeof byStatus]++
      })

      const nonCanceled = reservations.filter(r => r.status !== reservationStatusEnum.canceled).length
      const completionRate = nonCanceled > 0 ? Math.round((byStatus.completed / nonCanceled) * 100) : 0
      const cancellationRate = reservations.length > 0 ? Math.round((byStatus.canceled / reservations.length) * 100) : 0

      const reservationsToday = activeReservations.filter(r => {
        const d = r.people?.[0]?.scheduledAt?.toDate?.()
        return d && d >= startOfToday && d < new Date(startOfToday.getTime() + 86400000)
      }).length

      const reservationsThisWeek = activeReservations.filter(r => {
        const d = r.people?.[0]?.scheduledAt?.toDate?.()
        return d && d >= startOfWeek
      }).length

      const reservationsThisMonth = activeReservations.filter(r => {
        const d = r.people?.[0]?.scheduledAt?.toDate?.()
        return d && d >= startOfMonth
      }).length

      // ── Orders ─────────────────────────────────────────────────────────────────

      const ordersCompleted = orders.filter(o => o.status === orderStatusEnum.completed).length
      const ordersCanceled = orders.filter(o => o.status === orderStatusEnum.canceled).length
      const ordersRevenue = paidOrders.reduce((s, o) => s + o.totalPrice, 0)

      // ── Clients ────────────────────────────────────────────────────────────────

      const activeClients = clients.filter(c => c.history.length > 0).length
      const returningClients = clients.filter(c => c.history.length > 1).length
      const newClientsThisMonth = clients.filter(c => new Date(c.createdAt) >= startOfMonth).length

      const clientSpend: Record<string, { name: string; phone: string; visits: number; total: number }> = {}
      paidReservations.forEach(r => {
        const key = r.clientPhone || r.clientName
        if (!clientSpend[key]) clientSpend[key] = { name: r.clientName, phone: r.clientPhone, visits: 0, total: 0 }
        clientSpend[key].visits++
        clientSpend[key].total += personRevenueSum(r, st => st === reservationStatusEnum.completed)
      })
      const topClients = Object.values(clientSpend).sort((a, b) => b.total - a.total).slice(0, 5)

      // ── Services ───────────────────────────────────────────────────────────────

      const serviceMap: Record<string, { count: number; revenue: number }> = {}
      reservations.forEach(r => {
        r.people?.forEach(p => {
          if (!serviceMap[p.serviceName]) serviceMap[p.serviceName] = { count: 0, revenue: 0 }
          serviceMap[p.serviceName].count++
          if (r.isPaid && personStatus(p, r) === reservationStatusEnum.completed) serviceMap[p.serviceName].revenue += p.totalPrice
        })
      })
      const topServices = Object.entries(serviceMap)
        .map(([name, s]) => ({ name, ...s }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

      // ── Hairdressers ───────────────────────────────────────────────────────────

      const hdMap: Record<string, { name: string; reservations: number; revenue: number }> = {}
      reservations.forEach(r => {
        r.people?.forEach(p => {
          if (!p.hairdresserId || !p.hairdresserName) return
          const id = p.hairdresserId as string
          if (!hdMap[id]) hdMap[id] = { name: p.hairdresserName, reservations: 0, revenue: 0 }
          hdMap[id].reservations++
          if (r.isPaid && personStatus(p, r) === reservationStatusEnum.completed) hdMap[id].revenue += p.totalPrice
        })
      })
      const hairdresserStats = Object.values(hdMap).sort((a, b) => b.reservations - a.reservations)

      // ── Monthly trend ──────────────────────────────────────────────────────────

      // Number of months to show depends on period
      const monthsToShow = period === 'today' || period === '7d' ? 3
        : period === '30d' ? 4
        : period === '3m' ? 3
        : 6

      const allRes = reservationsRaw as IReservation[]
      const allOrd = ordersRaw as IOrder[]

      const monthlyTrend: MonthlyPoint[] = []
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const start = new Date(d.getFullYear(), d.getMonth(), 1)
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)

        const mRes = allRes.filter(r => {
          const rd = r.people?.[0]?.scheduledAt?.toDate?.()
          return rd && rd >= start && rd < end && r.status !== reservationStatusEnum.canceled
        })
        const mOrd = allOrd.filter(o => {
          const od = new Date(o.createdAt)
          return od >= start && od < end && o.status !== 'canceled'
        })
        const mRev =
          mRes.filter(r => r.isPaid).reduce((s, r) => s + personRevenueSum(r, st => st === reservationStatusEnum.completed), 0) +
          mOrd.filter(o => o.isPaid).reduce((s, o) => s + o.totalPrice, 0)

        monthlyTrend.push({
          month: MONTHS_FR[d.getMonth()],
          shortMonth: SHORT_MONTHS[d.getMonth()],
          reservations: mRes.length,
          orders: mOrd.length,
          revenue: mRev,
        })
      }

      // ── Peak days ─────────────────────────────────────────────────────────────

      const dayCounts = [0, 0, 0, 0, 0, 0, 0]
      activeReservations.forEach(r => {
        const d = r.people?.[0]?.scheduledAt?.toDate?.()
        if (d) dayCounts[d.getDay()]++
      })
      const peakDays: PeakDay[] = dayCounts.map((count, i) => ({
        day: DAYS_FR[i], short: SHORT_DAYS[i], count,
      }))

      return {
        totalRevenue, monthRevenue, weekRevenue, avgReservationValue, revenueByMethod,
        totalReservations: reservations.length, reservationsByStatus: byStatus,
        completionRate, cancellationRate, reservationsToday, reservationsThisWeek, reservationsThisMonth,
        totalOrders: orders.length, ordersCompleted, ordersCanceled, ordersRevenue,
        totalClients: clients.length, activeClients, returningClients, newClientsThisMonth,
        topClients, topServices, hairdresserStats, monthlyTrend, peakDays,
      }
    },
    enabled: !!salonId,
    staleTime: 5 * 60 * 1000,
  })
}
