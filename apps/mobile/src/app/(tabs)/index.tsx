import type { ISalon } from '@zyra/conf/domain/entities/salons.entities';
import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingLinkCard } from '@/components/dashboard/BookingLinkCard';
import type { Appointment } from '@/components/dashboard/RecentAppointmentsCard';
import { RecentAppointmentsCard } from '@/components/dashboard/RecentAppointmentsCard';
import { ReservationsStatsCard } from '@/components/dashboard/ReservationsStatsCard';
import { SalonInfoCard } from '@/components/dashboard/SalonInfoCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncData } from '@/hooks/use-async-data';
import { getDocument } from '@/lib/query';
import { dashboardService, type DashboardData } from '@/services/dashboardService';

const EMPTY_DASHBOARD: DashboardData = {
  stats: {
    appointmentsToday: 0,
    monthlyRevenue: 0,
    activeClients: 0,
    occupancyRate: 0,
    reservationsThisWeek: 0,
    reservationsThisMonth: 0,
    paidTodayXaf: 0,
  },
  recentReservations: [],
};

export default function DashboardScreen() {
  const { salonId, refreshAccountContext } = useAuth();
  const [salon, setSalon] = useState<ISalon | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!salonId) return EMPTY_DASHBOARD;
    const [dashboard, salonDoc] = await Promise.all([
      dashboardService.getDashboardData(salonId),
      getDocument('salons', salonId) as Promise<ISalon | null>,
    ]);
    setSalon(salonDoc);
    return dashboard;
  }, [salonId]);

  const { data, isLoading, isRefreshing, refresh } = useAsyncData(fetchDashboard, [salonId], EMPTY_DASHBOARD);

  const onRefresh = async () => {
    await Promise.all([refresh(), refreshAccountContext()]);
  };

  const appointments: Appointment[] = data.recentReservations.map((reservation) => {
    const firstPerson = reservation.people?.[0];
    const scheduledAt = firstPerson?.scheduledAt.toDate();
    const durationMinutes = firstPerson?.totalDuration ?? 0;
    return {
      date: scheduledAt
        ? scheduledAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—',
      time: scheduledAt ? scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
      client: reservation.clientName,
      service: firstPerson?.serviceName ?? '—',
      duration: durationMinutes >= 60 ? `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 || ''}` : `${durationMinutes}min`,
    };
  });

  const stats = [
    {
      label: "Rendez-vous aujourd'hui",
      value: String(data.stats.appointmentsToday),
      icon: <Calendar size={20} color="#0284c7" />,
      bg: 'bg-[#ECF6FE] dark:bg-sky-950/20',
    },
    {
      label: 'Revenus du mois',
      value: `${data.stats.monthlyRevenue.toLocaleString('fr-FR')} XAF`,
      icon: <DollarSign size={20} color="#059669" />,
      bg: 'bg-[#EEF8F0] dark:bg-emerald-950/20',
    },
    {
      label: 'Clients actifs',
      value: String(data.stats.activeClients),
      icon: <Users size={20} color="#7c3aed" />,
      bg: 'bg-[#F2EDFE] dark:bg-violet-950/20',
    },
    {
      label: "Taux d'occupation",
      value: `${Math.round(data.stats.occupancyRate)}%`,
      icon: <TrendingUp size={20} color="#e11d48" />,
      bg: 'bg-[#FEF1EC] dark:bg-rose-950/20',
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF8F6] dark:bg-[#0B0E12]">
        <ActivityIndicator color="#059669" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerClassName="gap-5 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#059669" />}>
        <View>
          <Text className="text-[20px] font-extrabold text-slate-900 dark:text-white">Dashboard</Text>
          {salon ? (
            <Text className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{salon.name}</Text>
          ) : null}
        </View>

        {salon ? <SalonInfoCard name={salon.name} address={salon.address} phone={salon.phone} /> : null}

        <View className="flex-row flex-wrap gap-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} bg={stat.bg} />
          ))}
        </View>

        <RecentAppointmentsCard appointments={appointments} />

        {salon ? (
          <BookingLinkCard
            bookingLink={`https://zyra.app/booking/${salon.id}`}
            salonName={salon.name}
          />
        ) : null}

        <ReservationsStatsCard
          thisWeek={data.stats.reservationsThisWeek}
          thisMonth={data.stats.reservationsThisMonth}
          paidTodayXaf={data.stats.paidTodayXaf}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
