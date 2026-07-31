import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum';
import { Calendar } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReservationCard } from '@/components/reservations/ReservationCard';
import { ReservationDetailsModal } from '@/components/reservations/ReservationDetailsModal';
import { MOCK_RESERVATIONS, STATUS_LABELS, type Reservation } from '@/components/reservations/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { CARD_CLASS } from '@/components/ui/shared';

const FILTERS: { label: string; value: reservationStatusEnum | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: STATUS_LABELS[reservationStatusEnum.pending], value: reservationStatusEnum.pending },
  { label: STATUS_LABELS[reservationStatusEnum.confirmed], value: reservationStatusEnum.confirmed },
  { label: STATUS_LABELS[reservationStatusEnum.checked_in], value: reservationStatusEnum.checked_in },
  { label: STATUS_LABELS[reservationStatusEnum.completed], value: reservationStatusEnum.completed },
  { label: STATUS_LABELS[reservationStatusEnum.canceled], value: reservationStatusEnum.canceled },
];

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className={`${CARD_CLASS} min-w-[110px] px-4 py-3`}>
      <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}

export default function ReservationsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<reservationStatusEnum | 'all'>('all');
  const [selected, setSelected] = useState<Reservation | null>(null);

  const filtered = useMemo(() => {
    return MOCK_RESERVATIONS.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (search && !r.clientName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, filter]);

  const totalRevenue = MOCK_RESERVATIONS.filter((r) => r.isPaid).reduce((s, r) => s + r.totalPrice, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            <Text className="text-[20px] font-extrabold text-slate-900 dark:text-white">Rendez-vous</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
              <StatPill label="Total" value={String(MOCK_RESERVATIONS.length)} />
              <StatPill label="En attente" value={String(MOCK_RESERVATIONS.filter((r) => r.status === reservationStatusEnum.pending).length)} />
              <StatPill label="Confirmées" value={String(MOCK_RESERVATIONS.filter((r) => r.status === reservationStatusEnum.confirmed).length)} />
              <StatPill label="Revenus" value={`${totalRevenue.toLocaleString('fr-FR')} XAF`} />
            </ScrollView>

            <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher un client..." />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {FILTERS.map((f) => (
                <Pressable
                  key={f.value}
                  onPress={() => setFilter(f.value)}
                  className={`rounded-full border px-3.5 py-1.5 ${
                    filter === f.value
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-[#E8E0D8] bg-white dark:border-slate-700 dark:bg-slate-900'
                  }`}>
                  <Text
                    className={`text-[12px] font-semibold ${
                      filter === f.value ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => <ReservationCard reservation={item} onPress={() => setSelected(item)} />}
        ListEmptyComponent={
          <EmptyState
            icon={<Calendar size={28} color="#cbd5e1" />}
            title="Aucune réservation"
            message="Aucune réservation ne correspond à ces filtres."
          />
        }
      />

      <ReservationDetailsModal reservation={selected} onClose={() => setSelected(null)} onAction={() => setSelected(null)} />
    </SafeAreaView>
  );
}
