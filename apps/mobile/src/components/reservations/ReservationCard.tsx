import { Banknote, Calendar, Clock, Smartphone, UserX } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';

import { STATUS_LABELS, STATUS_TONES, type Reservation } from './types';

export function ReservationCard({ reservation, onPress }: { reservation: Reservation; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`${CARD_CLASS} p-4 active:opacity-80`}>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-[12px] font-bold text-slate-400">#{reservation.number}</Text>
          <StatusBadge label={STATUS_LABELS[reservation.status]} tone={STATUS_TONES[reservation.status]} />
        </View>
        <StatusBadge label={reservation.isPaid ? 'Payé' : 'Non payé'} tone={reservation.isPaid ? 'emerald' : 'rose'} />
      </View>

      {!reservation.hairdresserName && reservation.status !== 'canceled' ? (
        <View className="mb-3 flex-row items-center gap-1.5 self-start rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/20">
          <UserX size={11} color="#d97706" />
          <Text className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Sans coiffeur</Text>
        </View>
      ) : null}

      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{reservation.clientName}</Text>
          <Text className="text-[12px] text-slate-400">{reservation.clientPhone}</Text>
        </View>
        <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">
          {reservation.totalPrice.toLocaleString('fr-FR')} XAF
        </Text>
      </View>

      <View className="flex-row items-center justify-between rounded-xl bg-[#F8F4F0] px-3 py-2.5 dark:bg-slate-800/40">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={12} color="#94a3b8" />
          <Text className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{reservation.date}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={12} color="#94a3b8" />
          <Text className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{reservation.time}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          {reservation.paymentMethod === 'mobile' ? (
            <Smartphone size={12} color="#94a3b8" />
          ) : (
            <Banknote size={12} color="#94a3b8" />
          )}
          <Text className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {reservation.paymentMethod === 'mobile' ? 'Mobile Money' : 'Espèces'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
