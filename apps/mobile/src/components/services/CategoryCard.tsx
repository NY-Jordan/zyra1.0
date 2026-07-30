import { Palette } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';

import type { ServiceCategory } from './types';

export function CategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <Pressable className={`${CARD_CLASS} p-4 active:opacity-80`}>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/20">
            <Palette size={16} color="#7c3aed" />
          </View>
          <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{category.name}</Text>
        </View>
        <StatusBadge label={category.isActive ? 'Actif' : 'Inactif'} tone={category.isActive ? 'emerald' : 'slate'} />
      </View>
      {category.description ? (
        <Text className="mb-2 text-[12px] text-slate-500 dark:text-slate-400">{category.description}</Text>
      ) : null}
      <View className="self-start rounded-lg bg-[#F8F4F0] px-2.5 py-1 dark:bg-slate-800/40">
        <Text className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          {category.servicesCount} service{category.servicesCount > 1 ? 's' : ''}
        </Text>
      </View>
    </Pressable>
  );
}
