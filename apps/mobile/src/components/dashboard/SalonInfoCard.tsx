import { ExternalLink, MapPin, Phone, Store } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import { CARD_CLASS } from './shared';

type SalonInfoCardProps = {
  name: string;
  address?: string;
  phone?: string;
  logo?: string;
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </Text>
        <Text numberOfLines={1} className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
          {value}
        </Text>
      </View>
    </View>
  );
}

export function SalonInfoCard({ name, address, phone, logo }: SalonInfoCardProps) {
  return (
    <View className={`${CARD_CLASS} p-5`}>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-emerald-500/10">
            {logo ? (
              <Image source={{ uri: logo }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <Store size={18} color="#10b981" />
            )}
          </View>
          <Text className="text-[14px] font-extrabold text-slate-800 dark:text-white">
            Salon connecté
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          className="flex-row items-center gap-1.5 rounded-xl px-3 py-2 active:bg-emerald-50 dark:active:bg-emerald-950/20">
          <ExternalLink size={14} color="#059669" />
          <Text className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
            Voir la page
          </Text>
        </Pressable>
      </View>

      <View className="gap-3">
        <InfoRow icon={<Store size={14} color="#64748b" />} label="Nom" value={name} />
        {address ? (
          <InfoRow icon={<MapPin size={14} color="#64748b" />} label="Adresse" value={address} />
        ) : null}
        {phone ? (
          <InfoRow icon={<Phone size={14} color="#64748b" />} label="Téléphone" value={phone} />
        ) : null}
      </View>
    </View>
  );
}
