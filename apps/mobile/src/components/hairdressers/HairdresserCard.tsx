import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';

import type { Hairdresser } from './types';

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className={`text-[14px] font-extrabold ${color}`}>{value}</Text>
      <Text className="text-[10px] text-slate-400">{label}</Text>
    </View>
  );
}

export function HairdresserCard({ hairdresser, onPress }: { hairdresser: Hairdresser; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`${CARD_CLASS} p-4 active:opacity-80`}>
      <View className="mb-3 flex-row items-center gap-3">
        <Avatar name={hairdresser.name} size={44} />
        <View className="flex-1">
          <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{hairdresser.name}</Text>
          <Text className="text-[12px] text-slate-400">{hairdresser.speciality}</Text>
        </View>
        <StatusBadge label={hairdresser.active ? 'Actif' : 'Suspendu'} tone={hairdresser.active ? 'emerald' : 'rose'} />
      </View>

      <View className="flex-row items-center rounded-xl bg-[#F8F4F0] py-2.5 dark:bg-slate-800/40">
        <Stat value={hairdresser.reservationsTaken} label="Prises" color="text-sky-600 dark:text-sky-400" />
        <Stat value={hairdresser.reservationsConfirmed} label="Confirmées" color="text-emerald-600 dark:text-emerald-400" />
        <Stat value={hairdresser.reservationsDone} label="Terminées" color="text-amber-600 dark:text-amber-400" />
      </View>
    </Pressable>
  );
}
