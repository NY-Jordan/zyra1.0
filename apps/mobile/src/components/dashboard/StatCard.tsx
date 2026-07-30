import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  bg: string;
};

export function StatCard({ icon, label, value, bg }: StatCardProps) {
  return (
    <View className={`w-[48%] flex-row items-center gap-3 rounded-2xl p-4 ${bg}`}>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/70 dark:bg-black/20">
        {icon}
      </View>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-[17px] font-extrabold leading-none text-slate-800 dark:text-white">
          {value}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {label}
        </Text>
      </View>
    </View>
  );
}
