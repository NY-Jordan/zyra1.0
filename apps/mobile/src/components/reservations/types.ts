import { reservationPaymentMethodEnum, reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum';

import type { StatusTone } from '@/components/ui/shared';

export type Reservation = {
  id: string;
  number: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string;
  time: string;
  status: reservationStatusEnum;
  isPaid: boolean;
  paymentMethod: reservationPaymentMethodEnum;
  totalPrice: number;
  peopleCount: number;
  hairdresserName?: string;
  services: { name: string; price: number; duration: number }[];
  notes?: string;
};

export const STATUS_LABELS: Record<reservationStatusEnum, string> = {
  [reservationStatusEnum.pending]: 'En attente',
  [reservationStatusEnum.confirmed]: 'Confirmée',
  [reservationStatusEnum.checked_in]: 'Client arrivé',
  [reservationStatusEnum.no_show]: 'Absent',
  [reservationStatusEnum.rescheduled]: 'Reprogrammée',
  [reservationStatusEnum.completed]: 'Terminée',
  [reservationStatusEnum.canceled]: 'Annulée',
};

export const STATUS_TONES: Record<reservationStatusEnum, StatusTone> = {
  [reservationStatusEnum.pending]: 'amber',
  [reservationStatusEnum.confirmed]: 'sky',
  [reservationStatusEnum.checked_in]: 'emerald',
  [reservationStatusEnum.no_show]: 'slate',
  [reservationStatusEnum.rescheduled]: 'sky',
  [reservationStatusEnum.completed]: 'emerald',
  [reservationStatusEnum.canceled]: 'rose',
};

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    number: '12489',
    clientName: 'Aïcha Ndongo',
    clientPhone: '+237 6 90 11 22 33',
    clientEmail: 'aicha.ndongo@example.com',
    date: "Aujourd'hui",
    time: '09:30',
    status: reservationStatusEnum.confirmed,
    isPaid: false,
    paymentMethod: reservationPaymentMethodEnum.mobile,
    totalPrice: 15000,
    peopleCount: 1,
    hairdresserName: 'Junior Foka',
    services: [{ name: 'Coupe + Brushing', price: 15000, duration: 45 }],
  },
  {
    id: '2',
    number: '12490',
    clientName: 'Paul Mbarga',
    clientPhone: '+237 6 90 44 55 66',
    date: "Aujourd'hui",
    time: '11:00',
    status: reservationStatusEnum.pending,
    isPaid: false,
    paymentMethod: reservationPaymentMethodEnum.cash,
    totalPrice: 5000,
    peopleCount: 1,
    services: [{ name: 'Dégradé', price: 5000, duration: 30 }],
  },
  {
    id: '3',
    number: '12491',
    clientName: 'Grace Eyenga',
    clientPhone: '+237 6 90 77 88 99',
    date: "Aujourd'hui",
    time: '14:15',
    status: reservationStatusEnum.checked_in,
    isPaid: true,
    paymentMethod: reservationPaymentMethodEnum.mobile,
    totalPrice: 25000,
    peopleCount: 1,
    hairdresserName: 'Sarah Biya',
    services: [{ name: 'Tresses', price: 25000, duration: 120 }],
  },
  {
    id: '4',
    number: '12492',
    clientName: 'Junior Nkolo',
    clientPhone: '+237 6 90 00 11 22',
    date: 'Hier',
    time: '16:00',
    status: reservationStatusEnum.completed,
    isPaid: true,
    paymentMethod: reservationPaymentMethodEnum.cash,
    totalPrice: 3000,
    peopleCount: 1,
    hairdresserName: 'Junior Foka',
    services: [{ name: 'Barbe', price: 3000, duration: 20 }],
  },
  {
    id: '5',
    number: '12493',
    clientName: 'Sarah Talla',
    clientPhone: '+237 6 90 33 22 11',
    date: 'Hier',
    time: '10:00',
    status: reservationStatusEnum.canceled,
    isPaid: false,
    paymentMethod: reservationPaymentMethodEnum.mobile,
    totalPrice: 18000,
    peopleCount: 1,
    services: [{ name: 'Coloration', price: 18000, duration: 90 }],
  },
];
