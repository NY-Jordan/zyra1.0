import { Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { SheetModal } from '@/components/ui/SheetModal';
import { StatusBadge } from '@/components/ui/StatusBadge';

import type { Client } from './types';

export function ClientDetailsSheet({ client, onClose }: { client: Client | null; onClose: () => void }) {
  if (!client) return null;

  return (
    <SheetModal visible={!!client} onClose={onClose} title={client.name}>
      <View className="flex-row items-center gap-3">
        <Avatar name={client.name} size={52} />
        <View>
          <Text className="text-[15px] font-bold text-slate-800 dark:text-white">{client.name}</Text>
          <Text className="text-[12px] text-slate-400">Client depuis le {client.since}</Text>
        </View>
      </View>

      <View className="flex-row gap-2.5">
        <View className="flex-1 rounded-xl bg-[#F8F4F0] p-3 dark:bg-slate-800/40">
          <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{client.ordersCount}</Text>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400">Commandes</Text>
        </View>
        <View className="flex-1 rounded-xl bg-[#F8F4F0] p-3 dark:bg-slate-800/40">
          <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">
            {client.totalSpent.toLocaleString('fr-FR')}
          </Text>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400">XAF dépensés</Text>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Historique
        </Text>
        {client.history.map((entry, i) => (
          <View key={i} className="flex-row items-center justify-between rounded-xl bg-[#F8F4F0] p-3 dark:bg-slate-800/40">
            <View>
              <Text className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{entry.label}</Text>
              <Text className="text-[11px] text-slate-400">{entry.date}</Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                {entry.price.toLocaleString('fr-FR')} XAF
              </Text>
              <StatusBadge label={entry.isPaid ? 'Payé' : 'Non payé'} tone={entry.isPaid ? 'emerald' : 'rose'} />
            </View>
          </View>
        ))}
      </View>
    </SheetModal>
  );
}
