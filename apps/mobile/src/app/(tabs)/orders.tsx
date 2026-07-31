import type { IOrder } from '@zyra/conf/domain/entities/orders.entities';
import { orderStatusEnum } from '@zyra/conf/domain/enums/OrderEnum';
import { ShoppingBag } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewOrderModal } from '@/components/orders/NewOrderModal';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';
import { ORDER_STATUS_LABELS } from '@/components/orders/types';
import { DateRangeField, type DateRange } from '@/components/ui/DateRangeField';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/ui/FAB';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { CARD_CLASS } from '@/components/ui/shared';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncData } from '@/hooks/use-async-data';
import { toDate } from '@/lib/formatDate';
import { orderService } from '@/services/orderService';

type StatusFilter = orderStatusEnum | 'all';
type PaymentFilter = 'all' | 'paid' | 'unpaid';

const PAGE_SIZE = 10;

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Toutes', value: 'all' },
  { label: ORDER_STATUS_LABELS[orderStatusEnum.pending], value: orderStatusEnum.pending },
  { label: ORDER_STATUS_LABELS[orderStatusEnum.completed], value: orderStatusEnum.completed },
  { label: ORDER_STATUS_LABELS[orderStatusEnum.canceled], value: orderStatusEnum.canceled },
];

const PAYMENT_OPTIONS: { label: string; value: PaymentFilter }[] = [
  { label: 'Tous les paiements', value: 'all' },
  { label: 'Payées', value: 'paid' },
  { label: 'Non payées', value: 'unpaid' },
];

function isInRange(date: Date | null, range: DateRange): boolean {
  if (!range.start && !range.end) return true;
  if (!date) return false;
  if (range.start && date < range.start) return false;
  if (range.end) {
    const endOfDay = new Date(range.end);
    endOfDay.setHours(23, 59, 59, 999);
    if (date > endOfDay) return false;
  }
  return true;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className={`${CARD_CLASS} min-w-[110px] px-4 py-3`}>
      <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}

function StatusFilterRow({ value, onChange }: { value: StatusFilter; onChange: (v: StatusFilter) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {STATUS_FILTERS.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          className={`rounded-full border px-3.5 py-1.5 ${
            value === option.value
              ? 'border-emerald-500 bg-emerald-500'
              : 'border-[#E8E0D8] bg-white dark:border-slate-700 dark:bg-slate-900'
          }`}>
          <Text className={`text-[12px] font-semibold ${value === option.value ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function OrdersScreen() {
  const { salonId, refreshAccountContext } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [hairdresserFilter, setHairdresserFilter] = useState<string>('all');
  const [selected, setSelected] = useState<IOrder | null>(null);
  const [createVisible, setCreateVisible] = useState(false);

  const fetchOrders = useCallback(
    () => (salonId ? orderService.getOrdersBySalon(salonId) : Promise.resolve([])),
    [salonId]
  );
  const { data: orders, isLoading, isRefreshing, refresh } = useAsyncData<IOrder[]>(fetchOrders, [salonId], []);

  const onRefresh = async () => {
    await Promise.all([refresh(), refreshAccountContext()]);
  };

  const hairdresserOptions = useMemo(() => {
    const names = Array.from(new Set(orders.map((o) => o.hairDresserName).filter(Boolean)));
    return [{ label: 'Tous les coiffeurs', value: 'all' }, ...names.map((name) => ({ label: name, value: name }))];
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (paymentFilter === 'paid' && !order.isPaid) return false;
      if (paymentFilter === 'unpaid' && order.isPaid) return false;
      if (hairdresserFilter !== 'all' && order.hairDresserName !== hairdresserFilter) return false;
      if (!isInRange(toDate(order.createdAt), dateRange)) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          order.clientName.toLowerCase().includes(q) ||
          order.serviceName.toLowerCase().includes(q) ||
          order.hairDresserName?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [orders, statusFilter, paymentFilter, hairdresserFilter, dateRange, search]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Any filter change starts back at the first page.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [statusFilter, paymentFilter, hairdresserFilter, dateRange, search]);

  const visibleOrders = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const loadMore = () => {
    if (hasMore) setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
  };

  const revenue = orders.filter((o) => o.isPaid).reduce((s, o) => s + o.totalPrice, 0);

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
        data={visibleOrders}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#059669" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          hasMore ? (
            <View className="items-center py-4">
              <ActivityIndicator color="#059669" size="small" />
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            <Text className="text-[20px] font-extrabold text-slate-900 dark:text-white">Commandes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
              <StatPill label="Total" value={String(orders.length)} />
              <StatPill label="Terminées" value={String(orders.filter((o) => o.status === orderStatusEnum.completed).length)} />
              <StatPill label="En attente" value={String(orders.filter((o) => o.status === orderStatusEnum.pending).length)} />
              <StatPill label="Revenu total" value={`${revenue.toLocaleString('fr-FR')} XAF`} />
            </ScrollView>

            <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher une commande..." />

            <StatusFilterRow value={statusFilter} onChange={setStatusFilter} />

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Select label="Paiement" options={PAYMENT_OPTIONS} value={paymentFilter} onChange={setPaymentFilter} />
              </View>
              <View className="flex-1">
                <Select label="Coiffeur" options={hairdresserOptions} value={hairdresserFilter} onChange={setHairdresserFilter} />
              </View>
            </View>

            <DateRangeField value={dateRange} onChange={setDateRange} />
          </View>
        }
        renderItem={({ item }) => <OrderCard order={item} onPress={() => setSelected(item)} />}
        ListEmptyComponent={
          <EmptyState icon={<ShoppingBag size={28} color="#cbd5e1" />} title="Aucune commande" message="Aucune commande ne correspond à ces filtres." />
        }
      />
      <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />

      {salonId ? (
        <>
          <FAB onPress={() => setCreateVisible(true)} />
          <NewOrderModal
            visible={createVisible}
            onClose={() => setCreateVisible(false)}
            salonId={salonId}
            onCreated={refresh}
          />
        </>
      ) : null}
    </SafeAreaView>
  );
}
