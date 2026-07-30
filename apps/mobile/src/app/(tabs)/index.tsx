import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingLinkCard } from '@/components/dashboard/BookingLinkCard';
import type { Appointment } from '@/components/dashboard/RecentAppointmentsCard';
import { RecentAppointmentsCard } from '@/components/dashboard/RecentAppointmentsCard';
import { ReservationsStatsCard } from '@/components/dashboard/ReservationsStatsCard';
import { SalonInfoCard } from '@/components/dashboard/SalonInfoCard';
import { StatCard } from '@/components/dashboard/StatCard';

const MOCK_SALON = {
  name: 'Zyra Coiffure',
  address: '12 Avenue Kennedy, Douala',
  phone: '+237 6 90 00 00 00',
};

const MOCK_STATS = [
  {
    label: "Rendez-vous aujourd'hui",
    value: '8',
    icon: <Calendar size={20} color="#0284c7" />,
    bg: 'bg-[#ECF6FE] dark:bg-sky-950/20',
  },
  {
    label: 'Revenus du mois',
    value: '245 000 XAF',
    icon: <DollarSign size={20} color="#059669" />,
    bg: 'bg-[#EEF8F0] dark:bg-emerald-950/20',
  },
  {
    label: 'Clients actifs',
    value: '132',
    icon: <Users size={20} color="#7c3aed" />,
    bg: 'bg-[#F2EDFE] dark:bg-violet-950/20',
  },
  {
    label: "Taux d'occupation",
    value: '74%',
    icon: <TrendingUp size={20} color="#e11d48" />,
    bg: 'bg-[#FEF1EC] dark:bg-rose-950/20',
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  { date: '25 - Juillet 2026', time: '09:30', client: 'Aïcha Ndongo', service: 'Coupe + Brushing', duration: '45min' },
  { date: '25 - Juillet 2026', time: '11:00', client: 'Paul Mbarga', service: 'Dégradé', duration: '30min' },
  { date: '25 - Juillet 2026', time: '14:15', client: 'Grace Eyenga', service: 'Tresses', duration: '2h' },
  { date: '25 - Juillet 2026', time: '16:00', client: 'Junior Foka', service: 'Barbe', duration: '20min' },
  { date: '26 - Juillet 2026', time: '10:00', client: 'Sarah Biya', service: 'Coloration', duration: '1h30' },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="gap-5 p-4" showsVerticalScrollIndicator={false}>
        <View>
          <Text className="text-[20px] font-extrabold text-slate-900 dark:text-white">
            Dashboard
          </Text>
          <Text className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
            {MOCK_SALON.name}
          </Text>
        </View>

        <SalonInfoCard {...MOCK_SALON} />

        <View className="flex-row flex-wrap gap-3">
          {MOCK_STATS.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} bg={stat.bg} />
          ))}
        </View>

        <RecentAppointmentsCard appointments={MOCK_APPOINTMENTS} />

        <BookingLinkCard
          bookingLink={`https://zyra.app/booking/${MOCK_SALON.name.toLowerCase().replace(/\s+/g, '-')}`}
          salonName={MOCK_SALON.name}
        />

        <ReservationsStatsCard thisWeek={14} thisMonth={57} paidTodayXaf={82500} />
      </ScrollView>
    </SafeAreaView>
  );
}
