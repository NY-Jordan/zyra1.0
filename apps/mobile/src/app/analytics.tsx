import { BarChart3, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CARD_CLASS } from '@/components/ui/shared';

const STATS = [
  { label: 'Revenus (30j)', value: '1 245 000 XAF', icon: DollarSign, bg: 'bg-[#EEF8F0] dark:bg-emerald-950/20', color: '#059669' },
  { label: 'Réservations (30j)', value: '186', icon: Calendar, bg: 'bg-[#ECF6FE] dark:bg-sky-950/20', color: '#0284c7' },
  { label: 'Nouveaux clients', value: '24', icon: Users, bg: 'bg-[#F2EDFE] dark:bg-violet-950/20', color: '#7c3aed' },
  { label: "Taux d'occupation", value: '71%', icon: TrendingUp, bg: 'bg-[#FEF1EC] dark:bg-rose-950/20', color: '#e11d48' },
];

const TOP_SERVICES = [
  { name: 'Coupe + Brushing', count: 42, revenue: 630000 },
  { name: 'Tresses', count: 28, revenue: 700000 },
  { name: 'Dégradé', count: 35, revenue: 175000 },
  { name: 'Coloration', count: 12, revenue: 216000 },
];

export default function AnalyticsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-3 p-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-3">
          {STATS.map((stat) => (
            <View key={stat.label} className={`w-[48%] flex-row items-center gap-3 rounded-2xl p-4 ${stat.bg}`}>
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/70 dark:bg-black/20">
                <stat.icon size={18} color={stat.color} />
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-[15px] font-extrabold text-slate-800 dark:text-white">
                  {stat.value}
                </Text>
                <Text numberOfLines={1} className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {stat.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className={`${CARD_CLASS} p-5`}>
          <View className="mb-4 flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
              <BarChart3 size={14} color="#059669" />
            </View>
            <Text className="text-[13px] font-bold text-slate-800 dark:text-white">Services les plus demandés</Text>
          </View>
          <View className="gap-2.5">
            {TOP_SERVICES.map((service) => (
              <View key={service.name} className="flex-row items-center justify-between rounded-xl bg-[#F8F4F0] p-3 dark:bg-slate-800/40">
                <View>
                  <Text className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{service.name}</Text>
                  <Text className="text-[11px] text-slate-400">{service.count} réservations</Text>
                </View>
                <Text className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                  {service.revenue.toLocaleString('fr-FR')} XAF
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
