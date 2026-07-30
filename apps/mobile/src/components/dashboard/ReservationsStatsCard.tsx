import { Text, View } from 'react-native';

import { CARD_CLASS } from './shared';

type ReservationsStatsCardProps = {
  thisWeek: number;
  thisMonth: number;
  paidTodayXaf: number;
};

function StatRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[13px] text-slate-500 dark:text-slate-400">{label}</Text>
      <Text
        className={`text-[13px] font-bold ${bold ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
        {value}
      </Text>
    </View>
  );
}

export function ReservationsStatsCard({ thisWeek, thisMonth, paidTodayXaf }: ReservationsStatsCardProps) {
  return (
    <View className={`${CARD_CLASS} p-5`}>
      <Text className="mb-3 text-[13px] font-bold text-slate-800 dark:text-white">Réservations</Text>
      <View className="gap-2.5">
        <StatRow label="Cette semaine" value={String(thisWeek)} />
        <StatRow label="Ce mois" value={String(thisMonth)} />
        <View className="border-t border-[#F0EAE4] pt-2 dark:border-slate-800/50">
          <StatRow label="Payés aujourd'hui" value={`${paidTodayXaf.toFixed(2)} XAF`} bold />
        </View>
      </View>
    </View>
  );
}
