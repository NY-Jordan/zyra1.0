import type { IOrder } from '@zyra/conf/domain/entities/orders.entities';
import { orderStatusEnum } from '@zyra/conf/domain/enums/OrderEnum';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';
import { formatDateTime } from '@/lib/formatDate';

import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from './types';

export function OrderCard({ order, onPress }: { order: IOrder; onPress: () => void }) {
  const status = order.status as orderStatusEnum;
  return (
    <Pressable onPress={onPress} className={`${CARD_CLASS} p-4 active:opacity-80`}>
      <View className="mb-2 flex-row items-center justify-between">
        <StatusBadge label={ORDER_STATUS_LABELS[status]} tone={ORDER_STATUS_TONES[status]} />
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
        <Text className="text-[11px] text-slate-400">{order.hairDresserName}</Text>
        <Text className="text-[11px] text-slate-400">{formatDateTime(order.createdAt)}</Text>
      </View>
    </Pressable>
  );
}
