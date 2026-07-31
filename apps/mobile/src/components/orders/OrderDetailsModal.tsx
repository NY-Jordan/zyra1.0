import type { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities';
import type { IOrder } from '@zyra/conf/domain/entities/orders.entities';
import { orderPaymentMethodEnum, orderStatusEnum } from '@zyra/conf/domain/enums/OrderEnum';
import {
  Banknote,
  Calendar,
  Clock,
  Mail,
  Phone,
  Receipt,
  Smartphone,
  User2,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { SheetModal } from '@/components/ui/SheetModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toDate } from '@/lib/formatDate';
import { hairdresserService } from '@/services/hairdresserService';

import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from './types';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View className="flex-row items-start gap-2.5">
      <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">{icon}</View>
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {children}
    </Text>
  );
}

export function OrderDetailsModal({ order, onClose }: { order: IOrder | null; onClose: () => void }) {
  const [hairdresser, setHairdresser] = useState<IHairDresser | null>(null);

  useEffect(() => {
    setHairdresser(null);
    if (order?.hairDresserId) {
      hairdresserService.getById(order.hairDresserId).then(setHairdresser);
    }
  }, [order?.hairDresserId]);

  if (!order) return null;
  const status = order.status as orderStatusEnum;
  const createdAt = toDate(order.createdAt);
  const createdAtLabel = createdAt
    ? `${createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à ${createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    : '—';

  return (
    <SheetModal visible={!!order} onClose={onClose} title="Détails de la commande">
      <View className="flex-row items-center gap-2">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500">
          <Receipt size={18} color="#ffffff" />
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          <StatusBadge label={ORDER_STATUS_LABELS[status]} tone={ORDER_STATUS_TONES[status]} />
          <StatusBadge label={order.isPaid ? 'Payé' : 'Non payé'} tone={order.isPaid ? 'emerald' : 'rose'} />
        </View>
      </View>

      <View className="flex-row items-center justify-between rounded-xl bg-[#F8F4F0] px-4 py-3 dark:bg-slate-800/40">
        <View>
          <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{order.serviceName}</Text>
          {createdAt ? (
            <View className="mt-0.5 flex-row items-center gap-1.5">
              <Clock size={11} color="#94a3b8" />
              <Text className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ) : null}
        </View>
        <Text className="text-[22px] font-extrabold text-emerald-600 dark:text-emerald-400">
          {order.totalPrice.toLocaleString('fr-FR')} XAF
        </Text>
      </View>

      <View className="gap-3">
        <SectionTitle>Client</SectionTitle>
        <View className="gap-3">
          <InfoRow icon={<User2 size={14} color="#64748b" />} label="Nom" value={order.clientName} />
          <InfoRow icon={<Phone size={14} color="#64748b" />} label="Téléphone" value={order.clientPhone} />
          <InfoRow icon={<Mail size={14} color="#64748b" />} label="Email" value={order.clientEmail} />
        </View>
      </View>

      <View className="gap-2">
        <SectionTitle>Coiffeur</SectionTitle>
        <View className="flex-row items-center gap-3 rounded-xl bg-[#F8F4F0] px-3.5 py-2.5 dark:bg-slate-800/40">
          {hairdresser?.photo ? (
            <Image source={{ uri: hairdresser.photo }} className="h-10 w-10 rounded-full" />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
              <Text className="text-[14px] font-bold text-white">
                {order.hairDresserName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text numberOfLines={1} className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {order.hairDresserName}
            </Text>
            {hairdresser?.speciality ? (
              <Text numberOfLines={1} className="text-[11px] text-slate-400 dark:text-slate-500">
                {hairdresser.speciality}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="gap-3 border-t border-[#F0EAE4] pt-3 dark:border-slate-800/50">
        <SectionTitle>Détails des prix</SectionTitle>
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] text-slate-500 dark:text-slate-400">Prix du service</Text>
            <Text className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
              {order.price.toLocaleString('fr-FR')} XAF
            </Text>
          </View>
          {order.supplementsPrice > 0 ? (
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-slate-500 dark:text-slate-400">Suppléments</Text>
              <Text className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                {order.supplementsPrice.toLocaleString('fr-FR')} XAF
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center justify-between border-t border-[#F0EAE4] pt-1.5 dark:border-slate-800/50">
            <Text className="text-[14px] font-semibold text-slate-700 dark:text-slate-300">Total</Text>
            <Text className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
              {order.totalPrice.toLocaleString('fr-FR')} XAF
            </Text>
          </View>
        </View>

        {order.supplements && order.supplements.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {order.supplements.map((supplement, index) => (
              <View
                key={index}
                className="rounded-full border border-[#EDE8E3] bg-[#F5F2EF] px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800">
                <Text className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{supplement}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View className="gap-2 border-t border-[#F0EAE4] pt-3 dark:border-slate-800/50">
        <SectionTitle>Méthode de paiement</SectionTitle>
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
            {order.paymentMethod === orderPaymentMethodEnum.mobile ? (
              <Smartphone size={14} color="#64748b" />
            ) : (
              <Banknote size={14} color="#64748b" />
            )}
          </View>
          <Text className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            {order.paymentMethod === orderPaymentMethodEnum.mobile ? 'Mobile Money' : 'Espèces'}
          </Text>
        </View>
      </View>

      {order.notes ? (
        <View className="gap-2 border-t border-[#F0EAE4] pt-3 dark:border-slate-800/50">
          <SectionTitle>Notes</SectionTitle>
          <Text className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{order.notes}</Text>
        </View>
      ) : null}

      <View className="flex-row items-center gap-2 border-t border-[#F0EAE4] pt-3 dark:border-slate-800/50">
        <Calendar size={14} color="#94a3b8" />
        <Text className="text-[12px] text-slate-500 dark:text-slate-400">{createdAtLabel}</Text>
      </View>
    </SheetModal>
  );
}
