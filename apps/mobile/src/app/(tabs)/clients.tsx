import type { IClient } from '@zyra/conf/domain/entities/clients.entities';
import { User2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClientActivitySheet } from '@/components/clients/ClientActivitySheet';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/ui/FAB';
import { SearchInput } from '@/components/ui/SearchInput';
import { CARD_CLASS } from '@/components/ui/shared';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncData } from '@/hooks/use-async-data';
import { clientService } from '@/services/clientService';

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className={`${CARD_CLASS} min-w-[110px] px-4 py-3`}>
      <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}

export default function ClientsScreen() {
  const { salonId, refreshAccountContext } = useAuth();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<IClient | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const fetchClients = useCallback(
    () => (salonId ? clientService.getClientsBySalon(salonId) : Promise.resolve([])),
    [salonId]
  );
  const { data: clients, isLoading, isRefreshing, refresh } = useAsyncData<IClient[]>(fetchClients, [salonId], []);

  const onRefresh = async () => {
    await Promise.all([refresh(), refreshAccountContext()]);
  };

  const filtered = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [clients, search]
  );

  const totalOrders = clients.reduce((s, c) => s + c.history.length, 0);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF8F6] dark:bg-[#0B0E12]">
        <ActivityIndicator color="#059669" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#059669" />}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            <Text className="text-[20px] font-extrabold text-slate-900 dark:text-white">Clients</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
              <StatPill label="Total clients" value={String(clients.length)} />
              <StatPill label="Commandes cumulées" value={String(totalOrders)} />
            </ScrollView>
            <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher un client..." />
          </View>
        }
        renderItem={({ item }) => <ClientCard client={item} onPress={() => setSelected(item)} />}
        ListEmptyComponent={
          <EmptyState icon={<User2 size={28} color="#cbd5e1" />} title="Aucun client" message="Ajoutez votre premier client." />
        }
      />

      <FAB onPress={() => setFormVisible(true)} />
      <ClientActivitySheet client={selected} onClose={() => setSelected(null)} />
      <ClientFormModal visible={formVisible} onClose={() => setFormVisible(false)} />
    </SafeAreaView>
  );
}
