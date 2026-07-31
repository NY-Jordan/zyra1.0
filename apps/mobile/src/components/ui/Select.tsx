import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SheetModal } from './SheetModal';

export type SelectOption<T extends string> = { label: string; value: T };

type SelectProps<T extends string> = {
  label?: string;
  placeholder?: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Select<T extends string>({ label, placeholder = 'Sélectionner', options, value, onChange }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View>
      {label ? (
        <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">{label}</Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        className="h-11 flex-row items-center justify-between rounded-xl border border-[#E8E0D8] bg-white px-3.5 dark:border-slate-700 dark:bg-slate-900">
        <Text
          numberOfLines={1}
          className={`flex-1 text-[13px] ${current ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
          {current?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color="#94a3b8" />
      </Pressable>

      <SheetModal visible={open} onClose={() => setOpen(false)} title={label ?? placeholder}>
        <View className="gap-1">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex-row items-center justify-between rounded-xl px-3.5 py-3 ${
                  selected ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'active:bg-[#F5F2EF] dark:active:bg-slate-800/60'
                }`}>
                <Text
                  className={`text-[14px] ${
                    selected ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
                  }`}>
                  {option.label}
                </Text>
                {selected ? <Check size={16} color="#059669" /> : null}
              </Pressable>
            );
          })}
        </View>
      </SheetModal>
    </View>
  );
}
