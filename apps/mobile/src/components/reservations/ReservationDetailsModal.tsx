import { Calendar, Mail, Phone, Scissors, User2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';

import { STATUS_LABELS, STATUS_TONES, type Reservation, type ReservationStatus } from './types';
import { SheetModal } from '@/components/ui/SheetModal';

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
        {icon}
      </View>
      <Text className="flex-1 text-[13px] font-medium text-slate-700 dark:text-slate-300">{label}</Text>
    </View>
  );
}

function ActionButton({ label, tone, onPress }: { label: string; tone: 'emerald' | 'sky' | 'rose' | 'violet'; onPress: () => void }) {
  const classes = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400',
  }[tone];
  return (
    <Pressable onPress={onPress} className={`rounded-xl px-3.5 py-2.5 active:opacity-70 ${classes}`}>
      <Text className={`text-[12px] font-bold ${classes}`}>{label}</Text>
    </Pressable>
  );
}

function nextActions(status: ReservationStatus): { label: string; tone: 'emerald' | 'sky' | 'rose' | 'violet' }[] {
  switch (status) {
    case 'pending':
      return [
        { label: 'Confirmer', tone: 'sky' },
        { label: 'Annuler', tone: 'rose' },
      ];
    case 'confirmed':
      return [
        { label: 'Client arrivé', tone: 'emerald' },
        { label: 'Reprogrammer', tone: 'violet' },
        { label: 'Annuler', tone: 'rose' },
      ];
    case 'checked_in':
      return [
        { label: 'Marquer comme payé', tone: 'emerald' },
        { label: 'Terminer', tone: 'sky' },
      ];
    default:
      return [];
  }
}

export function ReservationDetailsModal({
  reservation,
  onClose,
  onAction,
}: {
  reservation: Reservation | null;
  onClose: () => void;
  onAction: (label: string) => void;
}) {
  if (!reservation) return null;

  return (
    <SheetModal visible={!!reservation} onClose={onClose} title={`Réservation #${reservation.number}`}>
      <StatusBadge label={STATUS_LABELS[reservation.status]} tone={STATUS_TONES[reservation.status]} />

      <View className="gap-2.5">
        <InfoRow icon={<User2 size={14} color="#64748b" />} label={reservation.clientName} />
        <InfoRow icon={<Phone size={14} color="#64748b" />} label={reservation.clientPhone} />
        {reservation.clientEmail ? (
          <InfoRow icon={<Mail size={14} color="#64748b" />} label={reservation.clientEmail} />
        ) : null}
        <InfoRow icon={<Calendar size={14} color="#64748b" />} label={`${reservation.date} à ${reservation.time}`} />
        {reservation.hairdresserName ? (
          <InfoRow icon={<Scissors size={14} color="#64748b" />} label={`Coiffeur : ${reservation.hairdresserName}`} />
        ) : null}
      </View>

      <View className="gap-2 rounded-xl bg-[#F8F4F0] p-3.5 dark:bg-slate-800/40">
        {reservation.services.map((service, i) => (
          <View key={i} className="flex-row items-center justify-between">
            <Text className="text-[13px] text-slate-600 dark:text-slate-300">
              {service.name} ({service.duration}min)
            </Text>
            <Text className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {service.price.toLocaleString('fr-FR')} XAF
            </Text>
          </View>
        ))}
        <View className="flex-row items-center justify-between border-t border-[#E8E0D8] pt-2 dark:border-slate-700">
          <Text className="text-[13px] font-bold text-slate-800 dark:text-white">Total</Text>
          <Text className="text-[13px] font-bold text-slate-800 dark:text-white">
            {reservation.totalPrice.toLocaleString('fr-FR')} XAF
          </Text>
        </View>
      </View>

      {nextActions(reservation.status).length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {nextActions(reservation.status).map((action) => (
            <ActionButton key={action.label} label={action.label} tone={action.tone} onPress={() => onAction(action.label)} />
          ))}
        </View>
      ) : null}
    </SheetModal>
  );
}
