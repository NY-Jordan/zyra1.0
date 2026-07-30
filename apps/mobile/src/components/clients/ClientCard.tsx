import { Mail, Phone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { CARD_CLASS } from '@/components/ui/shared';

import type { Client } from './types';

export function ClientCard({ client, onPress }: { client: Client; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`${CARD_CLASS} flex-row items-center gap-3 p-4 active:opacity-80`}>
      <Avatar name={client.name} size={44} />
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{client.name}</Text>
          <View className="rounded-full bg-emerald-50 px-2 py-0.5 dark:bg-emerald-950/20">
            <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              {client.ordersCount} cmd
            </Text>
          </View>
        </View>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Phone size={11} color="#94a3b8" />
          <Text className="text-[12px] text-slate-400">{client.phone}</Text>
        </View>
        {client.email ? (
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Mail size={11} color="#94a3b8" />
            <Text numberOfLines={1} className="text-[12px] text-slate-400">
              {client.email}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
