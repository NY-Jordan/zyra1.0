export type ClientHistoryEntry = {
  type: 'order' | 'reservation';
  label: string;
  date: string;
  price: number;
  isPaid: boolean;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  since: string;
  ordersCount: number;
  totalSpent: number;
  history: ClientHistoryEntry[];
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Aïcha Ndongo',
    phone: '+237 6 90 11 22 33',
    email: 'aicha.ndongo@example.com',
    since: '12 Jan 2026',
    ordersCount: 8,
    totalSpent: 96000,
    history: [
      { type: 'reservation', label: 'Coupe + Brushing', date: "Aujourd'hui", price: 15000, isPaid: false },
      { type: 'order', label: 'Manucure', date: '02 Juil 2026', price: 8000, isPaid: true },
    ],
  },
  {
    id: '2',
    name: 'Paul Mbarga',
    phone: '+237 6 90 44 55 66',
    since: '03 Mars 2026',
    ordersCount: 3,
    totalSpent: 27000,
    history: [{ type: 'reservation', label: 'Dégradé', date: "Aujourd'hui", price: 5000, isPaid: false }],
  },
  {
    id: '3',
    name: 'Grace Eyenga',
    phone: '+237 6 90 77 88 99',
    email: 'grace.e@example.com',
    since: '20 Fév 2026',
    ordersCount: 14,
    totalSpent: 210000,
    history: [{ type: 'reservation', label: 'Tresses', date: "Aujourd'hui", price: 25000, isPaid: true }],
  },
  {
    id: '4',
    name: 'Sarah Talla',
    phone: '+237 6 90 33 22 11',
    since: '11 Juin 2026',
    ordersCount: 1,
    totalSpent: 18000,
    history: [{ type: 'reservation', label: 'Coloration', date: 'Hier', price: 18000, isPaid: false }],
  },
];
