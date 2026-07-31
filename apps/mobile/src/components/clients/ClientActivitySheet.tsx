import type { IClient } from '@zyra/conf/domain/entities/clients.entities';
import type { IOrder } from '@zyra/conf/domain/entities/orders.entities';
import type { IReservation } from '@zyra/conf/domain/entities/reservations.entities';
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum';
import {
  AlertCircle,
  Banknote,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Scissors,
  ShoppingBag,
  Smartphone,
  User2,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { SheetModal } from '@/components/ui/SheetModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { StatusTone } from '@/components/ui/shared';
import { formatDateLong, formatDateTime, toDate } from '@/lib/formatDate';
import { clientActivityService } from '@/services/clientActivityService';

const ORDER_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  completed: { label: 'Terminée', tone: 'emerald' },
  pending: { label: 'En attente', tone: 'amber' },
  canceled: { label: 'Annulée', tone: 'rose' },
};

const RESERVATION_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  [reservationStatusEnum.confirmed]: { label: 'Confirmée', tone: 'emerald' },
  [reservationStatusEnum.pending]: { label: 'En attente', tone: 'amber' },
  [reservationStatusEnum.completed]: { label: 'Terminée', tone: 'sky' },
  [reservationStatusEnum.canceled]: { label: 'Annulée', tone: 'rose' },
  [reservationStatusEnum.checked_in]: { label: 'Client arrivé', tone: 'emerald' },
  [reservationStatusEnum.no_show]: { label: 'Absent', tone: 'slate' },
  [reservationStatusEnum.rescheduled]: { label: 'Reprogrammée', tone: 'sky' },
};

function PaymentIcon({ method, color }: { method: string; color: string }) {
  if (method === 'mobile') return <Smartphone size={11} color={color} />;
  if (method === 'card') return <CreditCard size={11} color={color} />;
  return <Banknote size={11} color={color} />;
}

function TimelineRow({
  icon,
  iconBg,
  isLast,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  isLast: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View className={`h-7 w-7 items-center justify-center rounded-full ${iconBg}`}>{icon}</View>
        {!isLast ? <View className="mt-1.5 w-px flex-1 bg-[#F0EAE4] dark:bg-slate-700/60" /> : null}
      </View>
      <View className="flex-1 pb-5">{children}</View>
    </View>
  );
}

function OrderTimelineItem({ order, isLast }: { order: IOrder; isLast: boolean }) {
  const status = ORDER_STATUS[order.status] ?? { label: order.status, tone: 'slate' as StatusTone };
  return (
    <TimelineRow icon={<ShoppingBag size={13} color="#7c3aed" />} iconBg="bg-violet-100 dark:bg-violet-900/30" isLast={isLast}>
      <View className="mb-1.5 flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Commande
          </Text>
          <StatusBadge label={status.label} tone={status.tone} />
        </View>
        <Text className="text-[11px] text-slate-400">{formatDateLong(order.createdAt)}</Text>
      </View>

      <View className="gap-1.5 rounded-xl border border-[#F0EAE4] bg-[#FAFAF9] px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/30">
        <View className="flex-row items-center gap-1.5">
          <Scissors size={12} color="#94a3b8" />
          <Text className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{order.serviceName}</Text>
          {order.supplements?.length > 0 ? (
            <Text className="text-[12px] text-slate-400">+{order.supplements.length} suppl.</Text>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1.5">
          <User2 size={12} color="#94a3b8" />
          <Text className="text-[12px] text-slate-500 dark:text-slate-400">{order.hairDresserName}</Text>
        </View>
        <View className="flex-row items-center justify-between border-t border-[#EDE8E3] pt-1.5 dark:border-slate-700/60">
          <View className="flex-row items-center gap-1">
            <PaymentIcon method={order.paymentMethod} color="#94a3b8" />
            <Text className="text-[11px] text-slate-400">{order.isPaid ? 'Payé' : 'Non payé'}</Text>
          </View>
          <Text className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
            {order.totalPrice.toLocaleString('fr-FR')} XAF
          </Text>
        </View>
      </View>

      <View className="mt-1.5 flex-row items-center gap-1">
        <Clock size={11} color="#94a3b8" />
        <Text className="text-[11px] text-slate-400">{formatDateTime(order.createdAt)}</Text>
      </View>
    </TimelineRow>
  );
}

function ReservationTimelineItem({ reservation, isLast }: { reservation: IReservation; isLast: boolean }) {
  const status = RESERVATION_STATUS[reservation.status] ?? { label: reservation.status, tone: 'slate' as StatusTone };
  const createdAt = toDate(reservation.createdAt);
  const scheduledAt = toDate(reservation.people?.[0]?.scheduledAt);

  return (
    <TimelineRow icon={<Calendar size={13} color="#0284c7" />} iconBg="bg-sky-100 dark:bg-sky-900/30" isLast={isLast}>
      <View className="mb-1.5 flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Réservation #{reservation.reservationNumber}
          </Text>
          <StatusBadge label={status.label} tone={status.tone} />
        </View>
        <Text className="text-[11px] text-slate-400">{formatDateLong(reservation.createdAt)}</Text>
      </View>

      <View className="gap-2 rounded-xl border border-[#F0EAE4] bg-[#FAFAF9] px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/30">
        {reservation.people.map((person, i) => {
          const personScheduledAt = toDate(person.scheduledAt);
          return (
            <View key={i} className="gap-1">
              {reservation.people.length > 1 ? (
                <Text className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Personne {person.personNumber}
                </Text>
              ) : null}
              <View className="flex-row items-center gap-1.5">
                <Scissors size={12} color="#94a3b8" />
                <Text className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{person.serviceName}</Text>
              </View>
              {person.hairdresserName ? (
                <View className="flex-row items-center gap-1.5">
                  <User2 size={12} color="#94a3b8" />
                  <Text className="text-[12px] text-slate-500 dark:text-slate-400">{person.hairdresserName}</Text>
                </View>
              ) : null}
              {personScheduledAt ? (
                <View className="flex-row items-center gap-1.5">
                  <Clock size={12} color="#94a3b8" />
                  <Text className="text-[12px] text-slate-500 dark:text-slate-400">
                    {personScheduledAt.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })} à{' '}
                    {personScheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <View className="flex-row items-center justify-between border-t border-[#EDE8E3] pt-1.5 dark:border-slate-700/60">
          <View className="flex-row items-center gap-1">
            <PaymentIcon method={reservation.paymentMethod} color="#94a3b8" />
            <Text className="text-[11px] text-slate-400">{reservation.isPaid ? 'Payé' : 'Non payé'}</Text>
          </View>
          <Text className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
            {reservation.totalPrice.toLocaleString('fr-FR')} XAF
          </Text>
        </View>
      </View>

      <View className="mt-1.5 gap-0.5">
        {createdAt ? (
          <View className="flex-row items-center gap-1">
            <Clock size={11} color="#94a3b8" />
            <Text className="text-[11px] text-slate-400">Créée le {formatDateTime(reservation.createdAt)}</Text>
          </View>
        ) : null}
        {reservation.status === reservationStatusEnum.confirmed && scheduledAt ? (
          <View className="flex-row items-center gap-1">
            <Check size={11} color="#059669" />
            <Text className="text-[11px] text-emerald-600 dark:text-emerald-400">
              RDV confirmé pour le {formatDateTime(reservation.people[0].scheduledAt)}
            </Text>
          </View>
        ) : null}
      </View>
    </TimelineRow>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center rounded-xl bg-[#F8F4F0] px-3 py-2 dark:bg-slate-800/40">
      <Text className="text-[18px] font-extrabold leading-none text-slate-800 dark:text-white">{value}</Text>
      <Text className="mt-0.5 text-[10px] font-medium text-slate-400">{label}</Text>
    </View>
  );
}

export function ClientActivitySheet({ client, onClose }: { client: IClient | null; onClose: () => void }) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    setIsLoading(true);
    clientActivityService
      .getActivity(client.history)
      .then(({ orders, reservations }) => {
        setOrders(orders);
        setReservations(reservations);
      })
      .finally(() => setIsLoading(false));
  }, [client]);

  const timeline = useMemo(() => {
    const items = [
      ...orders.map((order) => ({ kind: 'order' as const, data: order, sortDate: toDate(order.createdAt)?.getTime() ?? 0 })),
      ...reservations.map((reservation) => ({
        kind: 'reservation' as const,
        data: reservation,
        sortDate: toDate(reservation.createdAt)?.getTime() ?? 0,
      })),
    ];
    return items.sort((a, b) => b.sortDate - a.sortDate);
  }, [orders, reservations]);

  const totalSpent = useMemo(
    () => [...orders, ...reservations].reduce((sum, item) => sum + item.totalPrice, 0),
    [orders, reservations]
  );

  if (!client) return null;

  return (
    <SheetModal visible={!!client} onClose={onClose} title={client.name}>
      <View className="gap-1">
        <View className="flex-row items-center gap-1.5">
          <Phone size={12} color="#94a3b8" />
          <Text className="text-[12px] text-slate-400">{client.phone}</Text>
        </View>
        {client.email ? (
          <View className="flex-row items-center gap-1.5">
            <Mail size={12} color="#94a3b8" />
            <Text className="text-[12px] text-slate-400">{client.email}</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row gap-2">
        <StatBox value={timeline.length} label="Activités" />
        <StatBox value={orders.length} label="Commandes" />
        <StatBox value={reservations.length} label="Réservations" />
      </View>

      {totalSpent > 0 ? (
        <View className="flex-row items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800/50 dark:bg-emerald-950/20">
          <Text className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Total dépensé</Text>
          <Text className="text-[14px] font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalSpent.toLocaleString('fr-FR')} XAF
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#059669" />
        </View>
      ) : timeline.length === 0 ? (
        <EmptyState
          icon={<AlertCircle size={28} color="#cbd5e1" />}
          title="Aucune activité"
          message="Ce client n'a pas encore de commande ni de réservation."
        />
      ) : (
        <View>
          {timeline.map((item, index) =>
            item.kind === 'order' ? (
              <OrderTimelineItem key={`order-${item.data.id}`} order={item.data} isLast={index === timeline.length - 1} />
            ) : (
              <ReservationTimelineItem
                key={`reservation-${item.data.id}`}
                reservation={item.data}
                isLast={index === timeline.length - 1}
              />
            )
          )}
        </View>
      )}
    </SheetModal>
  );
}
