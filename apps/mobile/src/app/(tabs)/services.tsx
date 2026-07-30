import { Scissors } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryCard } from '@/components/services/CategoryCard';
import { CreateServiceModal } from '@/components/services/CreateServiceModal';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceDetailsModal } from '@/components/services/ServiceDetailsModal';
import { MOCK_CATEGORIES, MOCK_SERVICES, type Service } from '@/components/services/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/ui/FAB';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CARD_CLASS } from '@/components/ui/shared';

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className={`${CARD_CLASS} min-w-[110px] px-4 py-3`}>
      <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}

export default function ServicesScreen() {
  const [tab, setTab] = useState<'services' | 'categories'>('services');
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [createVisible, setCreateVisible] = useState(false);

  const filteredServices = useMemo(
    () => MOCK_SERVICES.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );
  const filteredCategories = useMemo(
    () => MOCK_CATEGORIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const avgPrice = Math.round(MOCK_SERVICES.reduce((s, x) => s + x.price, 0) / MOCK_SERVICES.length);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      {tab === 'services' ? (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-4"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Header
              tab={tab}
              setTab={setTab}
              search={search}
              setSearch={setSearch}
              avgPrice={avgPrice}
            />
          }
          renderItem={({ item }) => <ServiceCard service={item} onPress={() => setSelectedService(item)} />}
          ListEmptyComponent={
            <EmptyState icon={<Scissors size={28} color="#cbd5e1" />} title="Aucun service" />
          }
        />
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-4"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Header
              tab={tab}
              setTab={setTab}
              search={search}
              setSearch={setSearch}
              avgPrice={avgPrice}
            />
          }
          renderItem={({ item }) => <CategoryCard category={item} />}
          ListEmptyComponent={
            <EmptyState icon={<Scissors size={28} color="#cbd5e1" />} title="Aucune catégorie" />
          }
        />
      )}

      <FAB onPress={() => setCreateVisible(true)} />
      <ServiceDetailsModal service={selectedService} onClose={() => setSelectedService(null)} />
      <CreateServiceModal visible={createVisible} onClose={() => setCreateVisible(false)} />
    </SafeAreaView>
  );
}

function Header({
  tab,
  setTab,
  search,
  setSearch,
  avgPrice,
}: {
  tab: 'services' | 'categories';
  setTab: (t: 'services' | 'categories') => void;
  search: string;
  setSearch: (s: string) => void;
  avgPrice: number;
}) {
  return (
    <View className="mb-1 gap-3">
      <Text className="text-[20px] font-extrabold text-slate-900 dark:text-white">Services</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
        <StatPill label="Catégories" value={String(MOCK_CATEGORIES.length)} />
        <StatPill label="Services" value={String(MOCK_SERVICES.length)} />
        <StatPill label="Actifs" value={String(MOCK_SERVICES.filter((s) => s.isActive).length)} />
        <StatPill label="Prix moyen" value={`${avgPrice.toLocaleString('fr-FR')} XAF`} />
      </ScrollView>
      <SegmentedControl
        options={[
          { label: 'Services', value: 'services' },
          { label: 'Catégories', value: 'categories' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher..." />
    </View>
  );
}
