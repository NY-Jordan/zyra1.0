import { Text, View } from 'react-native';

import { STATUS_TONE_CLASSES, type StatusTone } from './shared';

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const classes = STATUS_TONE_CLASSES[tone];
  return (
    <View className={`flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1 ${classes.bg}`}>
      <View className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
      <Text className={`text-[11px] font-semibold ${classes.text}`}>{label}</Text>
    </View>
  );
}
