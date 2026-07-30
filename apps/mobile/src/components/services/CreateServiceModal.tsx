import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { SheetModal } from '@/components/ui/SheetModal';

import { MOCK_CATEGORIES } from './types';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View>
      <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        className="h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </View>
  );
}

export function CreateServiceModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[0]?.id ?? '');

  const handleSave = () => {
    setName('');
    setPrice('');
    setDuration('');
    onClose();
  };

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      title="Nouveau service"
      footer={
        <Pressable onPress={handleSave} className="h-12 items-center justify-center rounded-xl bg-[#22C55E] active:bg-[#16A34A]">
          <Text className="text-[14px] font-bold text-white">Enregistrer</Text>
        </Pressable>
      }>
      <Field label="Nom du service" value={name} onChangeText={setName} placeholder="Ex: Coupe Homme" />

      <View>
        <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">Catégorie</Text>
        <View className="flex-row flex-wrap gap-2">
          {MOCK_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setCategoryId(category.id)}
              className={`rounded-full border px-3 py-1.5 ${
                categoryId === category.id
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-[#E8E0D8] bg-white dark:border-slate-700 dark:bg-slate-900'
              }`}>
              <Text
                className={`text-[12px] font-semibold ${
                  categoryId === category.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                }`}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field label="Prix (XAF)" value={price} onChangeText={setPrice} placeholder="15000" keyboardType="numeric" />
        </View>
        <View className="flex-1">
          <Field label="Durée (min)" value={duration} onChangeText={setDuration} placeholder="45" keyboardType="numeric" />
        </View>
      </View>
    </SheetModal>
  );
}
