import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function EmptyState({ icon, title, message }: { icon: ReactNode; title: string; message?: string }) {
  return (
    <View className="items-center py-12">
      {icon}
      <Text className="mt-3 text-[14px] font-semibold text-slate-600 dark:text-slate-300">{title}</Text>
      {message ? (
        <Text className="mt-1 max-w-[240px] text-center text-[12px] text-slate-400">{message}</Text>
      ) : null}
    </View>
  );
}
