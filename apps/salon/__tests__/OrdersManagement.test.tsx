import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const { mockSalon } = vi.hoisted(() => ({
  mockSalon: { value: { id: 'salon-1' } as any },
}));

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@zyra/core/hooks/useSalon', () => ({
  useSalon: () => ({ salon: mockSalon.value }),
}));

vi.mock('@zyra/core/usecases/useHairDressers', () => ({
  useHairDressers: () => ({
    hairDressers: [
      { id: 'hd1', name: 'Marc', speciality: 'Coupe' },
      { id: 'hd2', name: 'Sophie', speciality: 'Coloration' },
    ],
  }),
}));

vi.mock('@zyra/conf/lib/query', () => ({
  fetchCollection: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  where: vi.fn(),
  Timestamp: { fromDate: vi.fn((d: Date) => d) },
}));

vi.mock('@/presentation/components/orders/OrderCard', () => ({
  default: ({ order }: any) => (
    <div data-testid="order-card">
      {order.clientName} / {order.serviceName} / {order.hairDresserName} / {order.status} / {order.id}
    </div>
  ),
}));

vi.mock('@/presentation/components/orders/NewOrderModal', () => ({
  default: ({ open }: any) => (open ? <div data-testid="new-order-sheet">Sheet Ouvert</div> : null),
}));

vi.mock('@zyra/ui/components/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@zyra/ui/components/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@zyra/ui/components/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@zyra/ui/components/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <>{children}</>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@zyra/ui/components/calendar', () => ({
  Calendar: () => null,
}));

// ─── Import du composant (après les mocks) ────────────────────────────────────
import OrdersManagement from '@/presentation/components/orders/OrdersManagement';
import { fetchCollection } from '@zyra/conf/lib/query';

const mockFetchCollection = vi.mocked(fetchCollection);

const ORDERS = [
  {
    id: 'o1',
    salonId: 'salon-1',
    serviceId: 's1',
    serviceName: 'Coupe homme',
    hairDresserId: 'hd1',
    hairDresserName: 'Marc',
    clientName: 'Jean Dupont',
    clientPhone: '+237600000001',
    price: 5000,
    supplements: [],
    supplementsPrice: 0,
    totalPrice: 5000,
    paymentMethod: 'cash',
    isPaid: true,
    status: 'completed',
    createdAt: '2026-06-19T08:00:00.000Z',
  },
  {
    id: 'o2',
    salonId: 'salon-1',
    serviceId: 's2',
    serviceName: 'Coloration',
    hairDresserId: 'hd2',
    hairDresserName: 'Sophie',
    clientName: 'Alice Martin',
    clientPhone: '+237600000002',
    price: 8000,
    supplements: [],
    supplementsPrice: 0,
    totalPrice: 8000,
    paymentMethod: 'mobile',
    isPaid: false,
    status: 'pending',
    createdAt: '2026-06-19T10:00:00.000Z',
  },
  {
    id: 'o3',
    salonId: 'salon-1',
    serviceId: 's1',
    serviceName: 'Coupe homme',
    hairDresserId: 'hd1',
    hairDresserName: 'Marc',
    clientName: 'Paul Petit',
    clientPhone: '+237600000003',
    price: 3000,
    supplements: [],
    supplementsPrice: 0,
    totalPrice: 3000,
    paymentMethod: 'cash',
    isPaid: true,
    status: 'canceled',
    createdAt: '2026-06-19T06:00:00.000Z',
  },
];

function renderManagement() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OrdersManagement />
    </QueryClientProvider>
  );
}

async function renderAndWait(orders: any[] = ORDERS) {
  mockFetchCollection.mockResolvedValue(orders as any);
  renderManagement();
  await waitFor(() => expect(screen.queryByText('Chargement des commandes...')).not.toBeInTheDocument());
  // Attend que les statistiques soient effectivement rendues : évite une course
  // avec un re-render React Query qui survient juste après la disparition du loader.
  await screen.findByText('Total commandes');
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSalon.value = { id: 'salon-1' };
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrdersManagement - Rendu et chargement', () => {
  it('affiche le titre "Commandes"', async () => {
    await renderAndWait();
    expect(screen.getByText('Commandes')).toBeInTheDocument();
  });

  it('affiche un état de chargement avant la résolution de la requête', () => {
    mockFetchCollection.mockImplementation(() => new Promise(() => {}));
    renderManagement();
    expect(screen.getByText('Chargement des commandes...')).toBeInTheDocument();
  });

  it('affiche une carte par commande une fois chargées', async () => {
    await renderAndWait();
    expect(screen.getAllByTestId('order-card')).toHaveLength(3);
  });

  it('affiche un état vide si aucune commande n\'existe', async () => {
    await renderAndWait([]);
    expect(screen.getByText('Aucune commande')).toBeInTheDocument();
    expect(screen.getByText('Commencez par créer votre première commande.')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrdersManagement - Statistiques', () => {
  it('calcule correctement le total, terminées, en attente, payées et le revenu', async () => {
    await renderAndWait();

    // KpiCard : <p>{value}</p><p>{label}</p> partagent le même parent. On restreint
    // le sélecteur à 'p' car certains libellés ("Terminées", "En attente"...)
    // coïncident avec les <option> du filtre de statut, également présents dans le DOM.
    const statCard = (label: string) => screen.getByText(label, { selector: 'p' }).parentElement!;

    expect(within(statCard('Total commandes')).getByText('3')).toBeInTheDocument();
    expect(within(statCard('Terminées')).getByText('1')).toBeInTheDocument();
    expect(within(statCard('En attente')).getByText('1')).toBeInTheDocument();
    expect(within(statCard('Payées')).getByText('2')).toBeInTheDocument();

    // Revenu = somme des commandes payées uniquement (o1: 5000 + o3: 3000), o2 non payée exclue malgré ses 8000
    expect(screen.getByText('8,000 XAF')).toBeInTheDocument();
  });

  it('affiche un revenu de 0 quand aucune commande n\'est payée', async () => {
    const unpaidOnly = ORDERS.map((o) => ({ ...o, isPaid: false }));
    await renderAndWait(unpaidOnly);
    expect(screen.getByText('0 XAF')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrdersManagement - Recherche', () => {
  it('filtre par nom du client', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.type(screen.getByPlaceholderText(/rechercher par client/i), 'Alice');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Alice Martin');
  });

  it('filtre par numéro de téléphone', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.type(screen.getByPlaceholderText(/rechercher par client/i), '600000003');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Paul Petit');
  });

  it('filtre par nom du service (insensible à la casse)', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.type(screen.getByPlaceholderText(/rechercher par client/i), 'coupe homme');

    expect(screen.getAllByTestId('order-card')).toHaveLength(2); // o1 et o3
  });

  it('filtre par nom du coiffeur', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.type(screen.getByPlaceholderText(/rechercher par client/i), 'Sophie');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Alice Martin');
  });

  it('affiche le message "aucune correspondance" si la recherche ne donne aucun résultat', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.type(screen.getByPlaceholderText(/rechercher par client/i), 'Introuvable');

    expect(screen.getByText('Aucune commande ne correspond à vos filtres.')).toBeInTheDocument();
    expect(screen.queryByTestId('order-card')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrdersManagement - Filtres statut et paiement', () => {
  it('filtre par statut "pending"', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const statusSelect = screen.getByLabelText('Filtrer par statut');
    await user.selectOptions(statusSelect, 'pending');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Alice Martin');
  });

  it('filtre par statut "completed"', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const statusSelect = screen.getByLabelText('Filtrer par statut');
    await user.selectOptions(statusSelect, 'completed');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Jean Dupont');
  });

  it('filtre par statut "canceled"', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const statusSelect = screen.getByLabelText('Filtrer par statut');
    await user.selectOptions(statusSelect, 'canceled');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Paul Petit');
  });

  it('filtre par paiement "paid"', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const paymentSelect = screen.getByLabelText('Filtrer par paiement');
    await user.selectOptions(paymentSelect, 'paid');

    expect(screen.getAllByTestId('order-card')).toHaveLength(2); // o1 et o3
  });

  it('filtre par paiement "unpaid"', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const paymentSelect = screen.getByLabelText('Filtrer par paiement');
    await user.selectOptions(paymentSelect, 'unpaid');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Alice Martin');
  });

  it('combine recherche et filtre de statut', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.type(screen.getByPlaceholderText(/rechercher par client/i), 'Coupe homme');
    const statusSelect = screen.getByLabelText('Filtrer par statut');
    await user.selectOptions(statusSelect, 'canceled');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Paul Petit');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrdersManagement - Filtre coiffeur', () => {
  it('liste tous les coiffeurs du salon dans le filtre', async () => {
    await renderAndWait();

    const hairDresserSelect = screen.getByLabelText('Filtrer par coiffeur');
    expect(within(hairDresserSelect).getByText('Marc')).toBeInTheDocument();
    expect(within(hairDresserSelect).getByText('Sophie')).toBeInTheDocument();
  });

  it('filtre les commandes par coiffeur sélectionné', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const hairDresserSelect = screen.getByLabelText('Filtrer par coiffeur');
    await user.selectOptions(hairDresserSelect, 'hd2');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Alice Martin');
  });

  it('affiche toutes les commandes de ce coiffeur si plusieurs lui sont associées', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const hairDresserSelect = screen.getByLabelText('Filtrer par coiffeur');
    await user.selectOptions(hairDresserSelect, 'hd1');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(2); // o1 et o3, tous deux assignés à Marc (hd1)
  });

  it('combine le filtre coiffeur avec la recherche', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.type(screen.getByPlaceholderText(/rechercher par client/i), 'Paul');
    const hairDresserSelect = screen.getByLabelText('Filtrer par coiffeur');
    await user.selectOptions(hairDresserSelect, 'hd1');

    const cards = screen.getAllByTestId('order-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Paul Petit');
  });

  it('revient à la liste complète quand on sélectionne "Tous les coiffeurs"', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const hairDresserSelect = screen.getByLabelText('Filtrer par coiffeur');
    await user.selectOptions(hairDresserSelect, 'hd2');
    expect(screen.getAllByTestId('order-card')).toHaveLength(1);

    await user.selectOptions(hairDresserSelect, 'all');
    expect(screen.getAllByTestId('order-card')).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrdersManagement - Tri', () => {
  it('affiche les commandes triées de la plus récente à la plus ancienne', async () => {
    await renderAndWait();

    const cards = screen.getAllByTestId('order-card');
    // o2 (10h) > o1 (8h) > o3 (6h)
    expect(cards[0]).toHaveTextContent('o2');
    expect(cards[1]).toHaveTextContent('o1');
    expect(cards[2]).toHaveTextContent('o3');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrdersManagement - Filtres de date', () => {
  it('"Aujourd\'hui" est actif par défaut', async () => {
    await renderAndWait();
    expect(screen.getByText("Aujourd'hui")).toHaveClass('bg-emerald-500');
  });

  it('active le filtre "Cette semaine" au clic et désactive "Aujourd\'hui"', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.click(screen.getByText('Cette semaine'));

    expect(screen.getByText('Cette semaine')).toHaveClass('bg-emerald-500');
    expect(screen.getByText("Aujourd'hui")).not.toHaveClass('bg-emerald-500');
  });

  it('active le filtre "Ce mois" au clic', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    await user.click(screen.getByText('Ce mois'));

    expect(screen.getByText('Ce mois')).toHaveClass('bg-emerald-500');
  });

  it('redéclenche la requête Firestore quand le filtre de date change', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    const callsBefore = mockFetchCollection.mock.calls.length;
    await user.click(screen.getByText('Ce mois'));

    await waitFor(() => expect(mockFetchCollection.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrdersManagement - Nouvelle commande', () => {
  it('ouvre le panneau de création au clic sur "Nouvelle commande"', async () => {
    const user = userEvent.setup();
    await renderAndWait();

    expect(screen.queryByTestId('new-order-sheet')).not.toBeInTheDocument();
    await user.click(screen.getAllByText('Nouvelle commande')[0]);

    expect(screen.getByTestId('new-order-sheet')).toBeInTheDocument();
  });
});
