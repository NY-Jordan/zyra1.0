import { useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddMemberModal } from '@/components/administration/AddMemberModal';
import { MemberCard } from '@/components/administration/MemberCard';
import { MOCK_MEMBERS } from '@/components/administration/types';
import { FAB } from '@/components/ui/FAB';
import { CARD_CLASS } from '@/components/ui/shared';

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className={`${CARD_CLASS} min-w-[110px] px-4 py-3`}>
      <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}

export default function AdministrationScreen() {
  const [addVisible, setAddVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['bottom']}>
      <FlatList
        data={MOCK_MEMBERS}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="mb-1 gap-2.5">
            <StatPill label="Équipe" value={String(MOCK_MEMBERS.length)} />
            <StatPill label="Actifs" value={String(MOCK_MEMBERS.filter((m) => m.status === 'active').length)} />
            <StatPill label="Invitations" value={String(MOCK_MEMBERS.filter((m) => m.status === 'invited').length)} />
          </ScrollView>
        }
        renderItem={({ item }) => <MemberCard member={item} />}
      />
      <FAB onPress={() => setAddVisible(true)} />
      <AddMemberModal visible={addVisible} onClose={() => setAddVisible(false)} />
    </SafeAreaView>
  );
}
