import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

export type DateRange = { start: Date | null; end: Date | null };

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode: 'date',
        onChange: (_event, date) => {
          if (date) onChange(date);
        },
      });
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View className="flex-1">
      <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">{label}</Text>
      <Pressable
        onPress={openPicker}
        className="h-11 flex-row items-center gap-2 rounded-xl border border-[#E8E0D8] bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
        <Calendar size={14} color="#94a3b8" />
        <Text className={`text-[13px] ${value ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
          {value ? value.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Choisir'}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' && showPicker ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="inline"
          onChange={(_event, date) => {
            setShowPicker(false);
            if (date) onChange(date);
          }}
        />
      ) : null}
    </View>
  );
}

export function DateRangeField({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  return (
    <View>
      <View className="flex-row items-end gap-2">
        <DateField label="Du" value={value.start} onChange={(start) => onChange({ ...value, start })} />
        <DateField label="Au" value={value.end} onChange={(end) => onChange({ ...value, end })} />
        {value.start || value.end ? (
          <Pressable
            onPress={() => onChange({ start: null, end: null })}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-xl border border-[#E8E0D8] dark:border-slate-700">
            <X size={16} color="#94a3b8" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
