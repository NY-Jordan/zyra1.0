import { Mail, MapPin, Phone } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { SheetModal } from '@/components/ui/SheetModal';
import { StatusBadge } from '@/components/ui/StatusBadge';

import type { Hairdresser } from './types';

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
        {icon}
      </View>
      <Text className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{label}</Text>
    </View>
  );
}

export function HairDresserDetailsModal({
  hairdresser,
  onClose,
}: {
  hairdresser: Hairdresser | null;
  onClose: () => void;
}) {
  if (!hairdresser) return null;

  return (
    <SheetModal visible={!!hairdresser} onClose={onClose} title={hairdresser.name}>
      <View className="flex-row items-center gap-3">
        <Avatar name={hairdresser.name} size={52} />
        <View>
          <Text className="text-[15px] font-bold text-slate-800 dark:text-white">{hairdresser.name}</Text>
          <Text className="text-[12px] text-slate-400">{hairdresser.speciality}</Text>
        </View>
        <View className="ml-auto">
          <StatusBadge label={hairdresser.active ? 'Actif' : 'Suspendu'} tone={hairdresser.active ? 'emerald' : 'rose'} />
        </View>
      </View>

      <View className="gap-2.5">
        <InfoRow icon={<Mail size={14} color="#64748b" />} label={hairdresser.email} />
        <InfoRow icon={<Phone size={14} color="#64748b" />} label={hairdresser.phone} />
        <InfoRow icon={<MapPin size={14} color="#64748b" />} label={hairdresser.city} />
      </View>

      <View>
        <Text className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Services
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {hairdresser.services.map((service) => (
            <View key={service} className="rounded-full bg-[#F8F4F0] px-3 py-1.5 dark:bg-slate-800/40">
              <Text className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{service}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="rounded-xl bg-[#F8F4F0] p-3.5 dark:bg-slate-800/40">
        <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Contrat
        </Text>
        <Text className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
          {hairdresser.contractType === 'commission'
            ? `Commission de ${hairdresser.contractValue}%`
            : `Salaire de ${hairdresser.contractValue.toLocaleString('fr-FR')} XAF`}
        </Text>
      </View>
    </SheetModal>
  );
}
