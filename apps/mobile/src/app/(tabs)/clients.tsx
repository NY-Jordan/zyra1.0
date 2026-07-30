import { User2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClientCard } from '@/components/clients/ClientCard';
import { ClientDetailsSheet } from '@/components/clients/ClientDetailsSheet';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { MOCK_CLIENTS, type Client } from '@/components/clients/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/ui/FAB';
import { SearchInput } from '@/components/ui/SearchInput';
import { CARD_CLASS } from '@/components/ui/shared';

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className={`${CARD_CLASS} min-w-[110px] px-4 py-3`}>
      <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}

export default function ClientsScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const filtered = useMemo(
    () => MOCK_CLIENTS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const totalOrders = MOCK_CLIENTS.reduce((s, c) => s + c.ordersCount, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            <Text className="text-[20px] font-extrabold text-slate-900 dark:text-white">Clients</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
              <StatPill label="Total clients" value={String(MOCK_CLIENTS.length)} />
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
      <ClientDetailsSheet client={selected} onClose={() => setSelected(null)} />
      <ClientFormModal visible={formVisible} onClose={() => setFormVisible(false)} />
    </SafeAreaView>
  );
}
