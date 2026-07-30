import { Activity } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { CARD_CLASS, STATUS_TONE_CLASSES } from '@/components/ui/shared';

import {
  MOCK_ACTIVITIES,
  RESOURCE_LABELS,
  RESOURCE_TONES,
  type ActivityEntry,
  type ActivityResourceType,
} from '@/components/activities/types';

const FILTERS: { label: string; value: ActivityResourceType | 'all' }[] = [
  { label: 'Tout', value: 'all' },
  ...(Object.entries(RESOURCE_LABELS) as [ActivityResourceType, string][]).map(([value, label]) => ({
    label,
    value,
  })),
];

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const tone = STATUS_TONE_CLASSES[RESOURCE_TONES[entry.resourceType]];
  return (
    <View className={`${CARD_CLASS} flex-row items-center gap-3 p-3.5`}>
      <View className={`h-8 w-8 items-center justify-center rounded-lg ${tone.bg}`}>
        <View className={`h-2 w-2 rounded-full ${tone.dot}`} />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] text-slate-700 dark:text-slate-300">
          <Text className="font-bold">{entry.actorName}</Text> {entry.action}{' '}
          <Text className="font-semibold">{entry.resourceLabel}</Text>
        </Text>
        <Text className="mt-0.5 text-[11px] text-slate-400">{entry.time}</Text>
      </View>
    </View>
  );
}

export default function ActivitiesScreen() {
  const [filter, setFilter] = useState<ActivityResourceType | 'all'>('all');

  const sections = useMemo(() => {
    const filtered = MOCK_ACTIVITIES.filter((a) => filter === 'all' || a.resourceType === filter);
    const groups = new Map<string, ActivityEntry[]>();
    filtered.forEach((entry) => {
      const list = groups.get(entry.dateGroup) ?? [];
      list.push(entry);
      groups.set(entry.dateGroup, list);
    });
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, [filter]);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['bottom']}>
      <View className="gap-3 p-4 pb-0">
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
              <Text className={`text-[12px] font-semibold ${filter === f.value ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-2 p-4"
        renderSectionHeader={({ section }) => (
          <Text className="mb-2 mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View className="mb-2">
            <ActivityRow entry={item} />
          </View>
        )}
        ListEmptyComponent={<EmptyState icon={<Activity size={28} color="#cbd5e1" />} title="Aucune activité" />}
      />
    </SafeAreaView>
  );
}
