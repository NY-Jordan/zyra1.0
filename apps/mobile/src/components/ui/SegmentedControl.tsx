import { Pressable, Text, View } from 'react-native';

type SegmentedControlProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-xl bg-[#F0EAE4] p-1 dark:bg-slate-800/60">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-lg py-2 ${active ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}>
            <Text
              className={`text-[12px] font-bold ${
                active ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
