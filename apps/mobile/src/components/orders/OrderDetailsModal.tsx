import { Text, View } from 'react-native';

import { SheetModal } from '@/components/ui/SheetModal';
import { StatusBadge } from '@/components/ui/StatusBadge';

import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, type Order } from './types';

export function OrderDetailsModal({ order, onClose }: { order: Order | null; onClose: () => void }) {
  if (!order) return null;

  return (
    <SheetModal visible={!!order} onClose={onClose} title={order.clientName}>
      <View className="flex-row items-center gap-2">
        <StatusBadge label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONES[order.status]} />
        <StatusBadge label={order.isPaid ? 'Payé' : 'Non payé'} tone={order.isPaid ? 'emerald' : 'rose'} />
      </View>

      <View className="gap-2.5">
        <Text className="text-[13px] text-slate-500 dark:text-slate-400">Téléphone : {order.clientPhone}</Text>
        <Text className="text-[13px] text-slate-500 dark:text-slate-400">Service : {order.serviceName}</Text>
        <Text className="text-[13px] text-slate-500 dark:text-slate-400">Coiffeur : {order.hairdresserName}</Text>
        <Text className="text-[13px] text-slate-500 dark:text-slate-400">
          Paiement : {order.paymentMethod === 'mobile' ? 'Mobile Money' : 'Espèces'}
        </Text>
      </View>

      <View className="gap-2 rounded-xl bg-[#F8F4F0] p-3.5 dark:bg-slate-800/40">
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] text-slate-600 dark:text-slate-300">Service</Text>
          <Text className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
            {order.price.toLocaleString('fr-FR')} XAF
          </Text>
        </View>
        {order.supplementsPrice > 0 ? (
          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] text-slate-600 dark:text-slate-300">Suppléments</Text>
            <Text className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {order.supplementsPrice.toLocaleString('fr-FR')} XAF
            </Text>
          </View>
        ) : null}
        <View className="flex-row items-center justify-between border-t border-[#E8E0D8] pt-2 dark:border-slate-700">
          <Text className="text-[13px] font-bold text-slate-800 dark:text-white">Total</Text>
          <Text className="text-[13px] font-bold text-slate-800 dark:text-white">
            {order.totalPrice.toLocaleString('fr-FR')} XAF
          </Text>
        </View>
      </View>
    </SheetModal>
  );
}
