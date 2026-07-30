import { Clock, Scissors } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';

import type { Service } from './types';

export function ServiceCard({ service, onPress }: { service: Service; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`${CARD_CLASS} p-4 active:opacity-80`}>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
            <Scissors size={16} color="#059669" />
          </View>
          <View>
            <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{service.name}</Text>
            <Text className="text-[11px] text-slate-400">{service.categoryName}</Text>
          </View>
        </View>
        <StatusBadge label={service.isActive ? 'Actif' : 'Inactif'} tone={service.isActive ? 'emerald' : 'slate'} />
      </View>

      <View className="flex-row items-center gap-4 rounded-xl bg-[#F8F4F0] px-3 py-2 dark:bg-slate-800/40">
        <View className="flex-row items-center gap-1.5">
          <Clock size={12} color="#94a3b8" />
          <Text className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{service.duration}min</Text>
        </View>
        <Text className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
          {service.price.toLocaleString('fr-FR')} XAF
        </Text>
      </View>
    </Pressable>
  );
}
