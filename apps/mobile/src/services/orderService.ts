import type { IClient } from '@zyra/conf/domain/entities/clients.entities';
import type { ISalonService } from '@zyra/conf/domain/entities/salons.entities';
import type { IOrder } from '@zyra/conf/domain/entities/orders.entities';
import { orderPaymentMethodEnum, orderStatusEnum } from '@zyra/conf/domain/enums/OrderEnum';
import { where } from 'firebase/firestore';

import { toDate } from '@/lib/formatDate';
import { createDocument, editDocument, fetchCollection } from '@/lib/query';

import { activityService } from './activityService';
import type { HairDresserWithSalonAssociation } from './hairdresserService';

export type NewOrderInput = {
  salonId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  linkedClientId: string | null;
  saveAsRegularClient: boolean;
  service: ISalonService;
  hairDresser: HairDresserWithSalonAssociation;
  selectedSupplementNames: string[];
  paymentMethod: orderPaymentMethodEnum;
  isPaid: boolean;
  notes?: string;
};

export const orderService = {
  async getOrdersBySalon(salonId: string): Promise<IOrder[]> {
    const orders = (await fetchCollection('orders', [where('salonId', '==', salonId)])) as IOrder[];
    return orders.sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0));
  },

  /** Mirrors apps/salon's NewOrderModal.tsx createOrderMutation.mutationFn. */
  async createOrder(input: NewOrderInput): Promise<string> {
    let supplementsPrice = 0;
    const supplementNames: string[] = [];
    input.selectedSupplementNames.forEach((name) => {
      const supplement = input.service.supplements?.find((s) => s.name === name);
      if (supplement) {
        supplementsPrice += supplement.price;
        supplementNames.push(supplement.name);
      }
    });
    const totalPrice = input.service.price + supplementsPrice;

    const orderData: Record<string, unknown> = {
      salonId: input.salonId,
      serviceId: input.service.id,
      serviceName: input.service.name,
      hairDresserId: input.hairDresser.id,
      hairDresserName: input.hairDresser.name,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      clientEmail: input.clientEmail || null,
      price: input.service.price,
      supplements: supplementNames,
      supplementsPrice,
      totalPrice,
      paymentMethod: input.paymentMethod,
      isPaid: input.isPaid,
      status: orderStatusEnum.completed,
      notes: input.notes || null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      clientId: null as string | null,
    };

    if (input.linkedClientId) {
      orderData.clientId = input.linkedClientId;
    } else if (input.saveAsRegularClient) {
      const newClient: Omit<IClient, 'id'> = {
        salonId: input.salonId,
        name: input.clientName,
        phone: input.clientPhone,
        email: input.clientEmail || null,
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      orderData.clientId = await createDocument('clients', newClient);
    }

    const orderId = await createDocument('orders', orderData);

    await activityService.logActivity({
      salonId: input.salonId,
      type: 'order_created',
      action: 'created',
      resourceId: orderId,
      resourceType: 'order',
      resourceLabel: `Commande de ${input.clientName} — ${input.service.name}`,
      metadata: { montant: `${totalPrice} XAF`, coiffeur: input.hairDresser.name },
    });

    if (orderData.clientId) {
      const clients = (await fetchCollection('clients', [where('id', '==', orderData.clientId)])) as IClient[];
      if (clients.length > 0) {
        const existingHistory = clients[0].history || [];
        await editDocument('clients', orderData.clientId as string, {
          history: [...existingHistory, { id: orderId, type: 'order' }],
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return orderId;
  },

  async findClientByPhone(salonId: string, phone: string): Promise<IClient | null> {
    const matches = (await fetchCollection('clients', [
      where('salonId', '==', salonId),
      where('phone', '==', phone),
    ])) as IClient[];
    return matches[0] ?? null;
  },
};
