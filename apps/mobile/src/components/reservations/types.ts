export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'no_show'
  | 'rescheduled'
  | 'completed'
  | 'canceled';

export type Reservation = {
  id: string;
  number: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string;
  time: string;
  status: ReservationStatus;
  isPaid: boolean;
  paymentMethod: 'cash' | 'mobile';
  totalPrice: number;
  peopleCount: number;
  hairdresserName?: string;
  services: { name: string; price: number; duration: number }[];
  notes?: string;
};

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  checked_in: 'Client arrivé',
  no_show: 'Absent',
  rescheduled: 'Reprogrammée',
  completed: 'Terminée',
  canceled: 'Annulée',
};

export const STATUS_TONES: Record<ReservationStatus, 'amber' | 'sky' | 'emerald' | 'rose' | 'slate'> = {
  pending: 'amber',
  confirmed: 'sky',
  checked_in: 'emerald',
  no_show: 'slate',
  rescheduled: 'sky',
  completed: 'emerald',
  canceled: 'rose',
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
    status: 'confirmed',
    isPaid: false,
    paymentMethod: 'mobile',
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
    status: 'pending',
    isPaid: false,
    paymentMethod: 'cash',
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
    status: 'checked_in',
    isPaid: true,
    paymentMethod: 'mobile',
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
    status: 'completed',
    isPaid: true,
    paymentMethod: 'cash',
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
    status: 'canceled',
    isPaid: false,
    paymentMethod: 'mobile',
    totalPrice: 18000,
    peopleCount: 1,
    services: [{ name: 'Coloration', price: 18000, duration: 90 }],
  },
];
