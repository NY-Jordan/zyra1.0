import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <View className="mb-4 flex-row items-center gap-2">
      <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
        {icon}
      </View>
      <Text className="text-[13px] font-bold text-slate-800 dark:text-white">{title}</Text>
    </View>
  );
}
