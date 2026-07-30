import { Text, View } from 'react-native';

import { SheetModal } from '@/components/ui/SheetModal';
import { StatusBadge } from '@/components/ui/StatusBadge';

import type { Service } from './types';

export function ServiceDetailsModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
  if (!service) return null;

  return (
    <SheetModal visible={!!service} onClose={onClose} title={service.name}>
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] text-slate-500 dark:text-slate-400">{service.categoryName}</Text>
        <StatusBadge label={service.isActive ? 'Actif' : 'Inactif'} tone={service.isActive ? 'emerald' : 'slate'} />
      </View>

      <View className="flex-row gap-2.5">
        <View className="flex-1 rounded-xl bg-[#F8F4F0] p-3 dark:bg-slate-800/40">
          <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">{service.duration}min</Text>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400">Durée</Text>
        </View>
        <View className="flex-1 rounded-xl bg-[#F8F4F0] p-3 dark:bg-slate-800/40">
          <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">
            {service.price.toLocaleString('fr-FR')}
          </Text>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400">XAF</Text>
        </View>
      </View>
    </SheetModal>
  );
}
