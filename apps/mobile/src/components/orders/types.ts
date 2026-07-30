export type OrderStatus = 'pending' | 'completed' | 'canceled';

export type Order = {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  hairdresserName: string;
  price: number;
  supplementsPrice: number;
  totalPrice: number;
  paymentMethod: 'cash' | 'mobile';
  isPaid: boolean;
  status: OrderStatus;
  createdAt: string;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  completed: 'Terminée',
  canceled: 'Annulée',
};

export const ORDER_STATUS_TONES: Record<OrderStatus, 'amber' | 'emerald' | 'rose'> = {
  pending: 'amber',
  completed: 'emerald',
  canceled: 'rose',
};

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    clientName: 'Junior Nkolo',
    clientPhone: '+237 6 90 00 11 22',
    serviceName: 'Barbe',
    hairdresserName: 'Junior Foka',
    price: 3000,
    supplementsPrice: 0,
    totalPrice: 3000,
    paymentMethod: 'cash',
    isPaid: true,
    status: 'completed',
    createdAt: "Aujourd'hui, 09:12",
  },
  {
    id: '2',
    clientName: 'Sarah Talla',
    clientPhone: '+237 6 90 33 22 11',
    serviceName: 'Coloration',
    hairdresserName: 'Sarah Biya',
    price: 18000,
    supplementsPrice: 2000,
    totalPrice: 20000,
    paymentMethod: 'mobile',
    isPaid: false,
    status: 'pending',
    createdAt: "Aujourd'hui, 10:40",
  },
  {
    id: '3',
    clientName: 'Grace Eyenga',
    clientPhone: '+237 6 90 77 88 99',
    serviceName: 'Tresses',
    hairdresserName: 'Sarah Biya',
    price: 25000,
    supplementsPrice: 0,
    totalPrice: 25000,
    paymentMethod: 'mobile',
    isPaid: true,
    status: 'completed',
    createdAt: 'Hier, 14:20',
  },
];
