import { where } from 'firebase/firestore';

import type { ClientHistoryEntry } from '@zyra/conf/domain/entities/clients.entities';
import type { IOrder } from '@zyra/conf/domain/entities/orders.entities';
import type { IReservation } from '@zyra/conf/domain/entities/reservations.entities';

import { fetchCollection } from '@/lib/query';

export const clientActivityService = {
  async getActivity(history: (string | ClientHistoryEntry)[]): Promise<{ orders: IOrder[]; reservations: IReservation[] }> {
    const entries = history.filter(
      (entry): entry is ClientHistoryEntry => typeof entry === 'object' && entry !== null && 'type' in entry
    );
    const orderIds = entries.filter((e) => e.type === 'order').map((e) => e.id);
    const reservationIds = entries.filter((e) => e.type === 'reservation').map((e) => e.id);

    const [orders, reservations] = await Promise.all([
      orderIds.length > 0
        ? (fetchCollection('orders', [where('id', 'in', orderIds)]) as Promise<IOrder[]>)
        : Promise.resolve([]),
      reservationIds.length > 0
        ? (fetchCollection('reservations', [where('id', 'in', reservationIds)]) as Promise<IReservation[]>)
        : Promise.resolve([]),
    ]);

    return { orders, reservations };
  },
};
