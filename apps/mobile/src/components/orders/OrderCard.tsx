import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';

import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, type Order } from './types';

export function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`${CARD_CLASS} p-4 active:opacity-80`}>
      <View className="mb-2 flex-row items-center justify-between">
        <StatusBadge label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONES[order.status]} />
        <StatusBadge label={order.isPaid ? 'Payé' : 'Non payé'} tone={order.isPaid ? 'emerald' : 'rose'} />
      </View>
      <View className="mb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{order.clientName}</Text>
          <Text className="text-[12px] text-slate-400">{order.serviceName}</Text>
        </View>
        <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">
          {order.totalPrice.toLocaleString('fr-FR')} XAF
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] text-slate-400">{order.hairdresserName}</Text>
        <Text className="text-[11px] text-slate-400">{order.createdAt}</Text>
      </View>
    </Pressable>
  );
}
