import { ShoppingBag } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderCard } from '@/components/orders/OrderCard';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';
import { MOCK_ORDERS, type Order } from '@/components/orders/types';
import { EmptyState } from '@/components/ui/EmptyState';
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

export default function OrdersScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(
    () => MOCK_ORDERS.filter((o) => o.clientName.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const revenue = MOCK_ORDERS.filter((o) => o.isPaid).reduce((s, o) => s + o.totalPrice, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
              <StatPill label="Total" value={String(MOCK_ORDERS.length)} />
              <StatPill label="Terminées" value={String(MOCK_ORDERS.filter((o) => o.status === 'completed').length)} />
              <StatPill label="En attente" value={String(MOCK_ORDERS.filter((o) => o.status === 'pending').length)} />
              <StatPill label="Revenu total" value={`${revenue.toLocaleString('fr-FR')} XAF`} />
            </ScrollView>
            <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher une commande..." />
          </View>
        }
        renderItem={({ item }) => <OrderCard order={item} onPress={() => setSelected(item)} />}
        ListEmptyComponent={
          <EmptyState icon={<ShoppingBag size={28} color="#cbd5e1" />} title="Aucune commande" />
        }
      />
      <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}
