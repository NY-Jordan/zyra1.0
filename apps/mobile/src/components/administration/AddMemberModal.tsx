import { getRole, type RoleId } from '@zyra/conf/domain/entities/permissions.entities';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { SheetModal } from '@/components/ui/SheetModal';

const ASSIGNABLE_ROLES: RoleId[] = ['manager', 'receptionist'];

export function AddMemberModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleId>('manager');

  const handleSave = () => {
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      title="Ajouter un membre"
      footer={
        <Pressable onPress={handleSave} className="h-12 items-center justify-center rounded-xl bg-[#22C55E] active:bg-[#16A34A]">
          <Text className="text-[14px] font-bold text-white">Ajouter</Text>
        </Pressable>
      }>
      <View>
        <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">Nom complet</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Paul Ngando"
          placeholderTextColor="#94a3b8"
          className="h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </View>

      <View>
        <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="exemple@domaine.com"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          className="h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </View>

      <View>
        <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">Rôle</Text>
        <View className="flex-row gap-2">
          {ASSIGNABLE_ROLES.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              className={`rounded-full border px-3.5 py-1.5 ${
                role === r ? 'border-emerald-500 bg-emerald-500' : 'border-[#E8E0D8] bg-white dark:border-slate-700 dark:bg-slate-900'
              }`}>
              <Text className={`text-[12px] font-semibold ${role === r ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {getRole(r).label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SheetModal>
  );
}
