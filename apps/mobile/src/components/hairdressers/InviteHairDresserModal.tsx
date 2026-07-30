import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { SheetModal } from '@/components/ui/SheetModal';

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
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
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

export function InviteHairDresserModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSend = () => {
    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      title="Inviter un coiffeur"
      footer={
        <Pressable onPress={handleSend} className="h-12 items-center justify-center rounded-xl bg-[#22C55E] active:bg-[#16A34A]">
          <Text className="text-[14px] font-bold text-white">Envoyer l'invitation</Text>
        </Pressable>
      }>
      <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Ex: Junior Foka" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="exemple@domaine.com" keyboardType="email-address" />
      <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="+237 6 90 00 00 00" keyboardType="phone-pad" />
    </SheetModal>
  );
}
