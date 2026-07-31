import { where } from 'firebase/firestore';

import type { IReservation } from '@zyra/conf/domain/entities/reservations.entities';
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum';

import { fetchCollection } from '@/lib/query';

export interface DashboardStats {
  appointmentsToday: number;
  monthlyRevenue: number;
  activeClients: number;
  occupancyRate: number;
  reservationsThisWeek: number;
  reservationsThisMonth: number;
  paidTodayXaf: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentReservations: IReservation[];
}

export const dashboardService = {
  async getDashboardData(salonId: string): Promise<DashboardData> {
    const reservations = (await fetchCollection('reservations', [
      where('salonId', '==', salonId),
    ])) as IReservation[];

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const recentReservations = [...reservations]
      .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
      .slice(0, 5);

    const appointmentsToday = reservations.filter((reservation) => {
      const firstPerson = reservation.people?.[0];
      if (!firstPerson) return false;
      const scheduledDate = firstPerson.scheduledAt.toDate();
      return (
        scheduledDate >= startOfToday &&
        scheduledDate < endOfToday &&
        reservation.status !== reservationStatusEnum.canceled
      );
    });

    const inRange = (start: Date, end: Date) =>
      reservations.filter((reservation) => {
        if (reservation.status === reservationStatusEnum.canceled) return false;
        if (!reservation.isPaid) return false;
        const firstPerson = reservation.people?.[0];
        if (!firstPerson) return false;
        const scheduledDate = firstPerson.scheduledAt.toDate();
        return scheduledDate >= start && scheduledDate < end;
      });

    const monthReservations = inRange(startOfMonth, endOfMonth);
    const weekReservations = inRange(startOfWeek, endOfWeek);
    const paidTodayReservations = inRange(startOfToday, endOfToday);

    const monthlyRevenue = monthReservations.reduce((sum, res) => sum + res.totalPrice, 0);
    const paidTodayXaf = paidTodayReservations.reduce((sum, res) => sum + res.totalPrice, 0);
    const activeClients = new Set(
      monthReservations.map((res) => res.clientEmail || res.clientPhone || res.clientName)
    ).size;

    return {
      stats: {
        appointmentsToday: appointmentsToday.length,
        monthlyRevenue,
        activeClients,
        occupancyRate: Math.min(100, monthReservations.length * 10),
        reservationsThisWeek: weekReservations.length,
        reservationsThisMonth: monthReservations.length,
        paidTodayXaf,
      },
      recentReservations,
    };
  },
};
