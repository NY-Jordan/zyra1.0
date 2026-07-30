import { Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HairDresserDetailsModal } from '@/components/hairdressers/HairDresserDetailsModal';
import { HairdresserCard } from '@/components/hairdressers/HairdresserCard';
import { InvitationCard } from '@/components/hairdressers/InvitationCard';
import { InviteHairDresserModal } from '@/components/hairdressers/InviteHairDresserModal';
import { MOCK_HAIRDRESSERS, MOCK_INVITATIONS, type Hairdresser } from '@/components/hairdressers/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/ui/FAB';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CARD_CLASS } from '@/components/ui/shared';

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className={`${CARD_CLASS} min-w-[100px] px-4 py-3`}>
      <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}

export default function HairdressersScreen() {
  const [tab, setTab] = useState<'active' | 'invitations'>('active');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Hairdresser | null>(null);
  const [inviteVisible, setInviteVisible] = useState(false);

  const filtered = useMemo(
    () => MOCK_HAIRDRESSERS.filter((h) => h.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const header = (
    <View className="mb-1 gap-3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
        <StatPill label="Total" value={String(MOCK_HAIRDRESSERS.length)} />
        <StatPill label="Actifs" value={String(MOCK_HAIRDRESSERS.filter((h) => h.active).length)} />
        <StatPill label="Invitations" value={String(MOCK_INVITATIONS.length)} />
      </ScrollView>
      <SegmentedControl
        options={[
          { label: 'Coiffeurs', value: 'active' },
          { label: 'Invitations', value: 'invitations' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'active' ? <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher..." /> : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['bottom']}>
      {tab === 'active' ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-4"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={header}
          renderItem={({ item }) => <HairdresserCard hairdresser={item} onPress={() => setSelected(item)} />}
          ListEmptyComponent={<EmptyState icon={<Users size={28} color="#cbd5e1" />} title="Aucun coiffeur" />}
        />
      ) : (
        <FlatList
          data={MOCK_INVITATIONS}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-4"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={header}
          renderItem={({ item }) => <InvitationCard invitation={item} />}
          ListEmptyComponent={<EmptyState icon={<Users size={28} color="#cbd5e1" />} title="Aucune invitation" />}
        />
      )}

      <FAB onPress={() => setInviteVisible(true)} />
      <HairDresserDetailsModal hairdresser={selected} onClose={() => setSelected(null)} />
      <InviteHairDresserModal visible={inviteVisible} onClose={() => setInviteVisible(false)} />
    </SafeAreaView>
  );
}
