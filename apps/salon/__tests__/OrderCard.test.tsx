import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const { mockMarkAsPaidMutate, mockDeleteMutate } = vi.hoisted(() => ({
  mockMarkAsPaidMutate: vi.fn(),
  mockDeleteMutate: vi.fn(),
}));

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/usecases/ordersUseCases', () => ({
  useMarkOrderAsPaid: () => ({ mutate: mockMarkAsPaidMutate, isPending: false }),
  useDeleteOrder: () => ({ mutate: mockDeleteMutate, isPending: false }),
}));

vi.mock('@/presentation/components/orders/OrderDetailsModal', () => ({
  default: ({ open, order }: any) =>
    open ? <div data-testid="order-details-modal">Détails: {order?.serviceName}</div> : null,
}));

vi.mock('@zyra/ui/components/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@zyra/ui/components/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

vi.mock('@zyra/ui/components/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@zyra/ui/components/alert-dialog', () => ({
  AlertDialog: ({ open, children }: any) => (open ? <div role="alertdialog">{children}</div> : null),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

// Formatage de date contrôlé pour des assertions stables dans la majorité des tests
vi.mock('@zyra/conf/lib/utils', () => ({
  formatDate: vi.fn(() => '19 juin 2026'),
  formatDateTime: vi.fn(() => '19/06/26 14:30'),
}));

// ─── Import du composant (après les mocks) ────────────────────────────────────
import OrderCard from '@/presentation/components/orders/OrderCard';
import { IOrder } from '@zyra/conf/domain/entities/orders.entities';

function buildOrder(overrides: Partial<IOrder> = {}): IOrder {
  return {
    id: 'order-1',
    salonId: 'salon-1',
    serviceId: 'service-1',
    serviceName: 'Coupe homme',
    hairDresserId: 'hd-1',
    hairDresserName: 'Marc',
    clientName: 'Jean Dupont',
    clientPhone: '+237600000000',
    price: 5000,
    supplements: [],
    supplementsPrice: 0,
    totalPrice: 5000,
    paymentMethod: 'cash',
    isPaid: true,
    status: 'completed',
    createdAt: new Date('2026-06-19T14:30:00.000Z').toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderCard - Rendu', () => {
  it('affiche le nom du service', () => {
    render(<OrderCard order={buildOrder({ serviceName: 'Coupe femme' })} />);
    expect(screen.getByText('Coupe femme')).toBeInTheDocument();
  });

  it('affiche le nom du client', () => {
    render(<OrderCard order={buildOrder({ clientName: 'Alice Martin' })} />);
    expect(screen.getByText('Alice Martin')).toBeInTheDocument();
  });

  it('affiche le nom du coiffeur', () => {
    render(<OrderCard order={buildOrder({ hairDresserName: 'Sophie' })} />);
    expect(screen.getByText('Sophie')).toBeInTheDocument();
  });

  it('affiche le prix total formaté', () => {
    render(<OrderCard order={buildOrder({ totalPrice: 12500 })} />);
    expect(screen.getByText('12,500')).toBeInTheDocument();
  });

  it('affiche "XAF" comme devise', () => {
    render(<OrderCard order={buildOrder()} />);
    expect(screen.getByText('XAF')).toBeInTheDocument();
  });

  it.each([
    ['pending', 'En attente'],
    ['completed', 'Terminée'],
    ['canceled', 'Annulée'],
  ] as const)('affiche le badge correct pour le statut "%s"', (status, label) => {
    render(<OrderCard order={buildOrder({ status })} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('affiche le statut brut si le statut est inconnu', () => {
    render(<OrderCard order={buildOrder({ status: 'unknown' as any })} />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderCard - Statut de paiement', () => {
  it('affiche le badge "Payé" quand la commande est payée', () => {
    render(<OrderCard order={buildOrder({ isPaid: true })} />);
    expect(screen.getByText('Payé')).toBeInTheDocument();
    expect(screen.queryByText('Marquer comme payé')).not.toBeInTheDocument();
  });

  it('affiche le bouton "Marquer comme payé" quand la commande n\'est pas payée', () => {
    render(<OrderCard order={buildOrder({ isPaid: false })} />);
    expect(screen.getByText('Marquer comme payé')).toBeInTheDocument();
    expect(screen.queryByText('Payé')).not.toBeInTheDocument();
  });

  it('appelle markAsPaidMutation.mutate avec l\'id de la commande au clic', async () => {
    const user = userEvent.setup();
    render(<OrderCard order={buildOrder({ id: 'order-99', isPaid: false })} />);

    await user.click(screen.getByText('Marquer comme payé'));

    expect(mockMarkAsPaidMutate).toHaveBeenCalledWith('order-99');
  });

  it('n\'appelle pas la mutation si la commande est déjà payée (pas de bouton)', () => {
    render(<OrderCard order={buildOrder({ isPaid: true })} />);
    expect(mockMarkAsPaidMutate).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderCard - Détails', () => {
  it('ouvre le modal de détails au clic sur "Voir les détails"', async () => {
    const user = userEvent.setup();
    render(<OrderCard order={buildOrder({ serviceName: 'Coupe + Barbe' })} />);

    expect(screen.queryByTestId('order-details-modal')).not.toBeInTheDocument();
    await user.click(screen.getByText('Voir les détails'));

    expect(screen.getByTestId('order-details-modal')).toBeInTheDocument();
    expect(screen.getByText('Détails: Coupe + Barbe')).toBeInTheDocument();
  });

  it('appelle le callback onViewDetails si fourni', async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    const order = buildOrder();
    render(<OrderCard order={order} onViewDetails={onViewDetails} />);

    await user.click(screen.getByText('Voir les détails'));

    expect(onViewDetails).toHaveBeenCalledWith(order);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderCard - Suppression', () => {
  it('ouvre la boîte de confirmation au clic sur l\'icône de suppression', async () => {
    const user = userEvent.setup();
    render(<OrderCard order={buildOrder({ clientName: 'Paul', serviceName: 'Coupe' })} />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    // Le bouton de suppression est le second bouton "ghost" sans texte visible
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[buttons.length - 1];
    await user.click(deleteButton);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(
      screen.getByText(/la commande de paul pour coupe sera définitivement supprimée/i)
    ).toBeInTheDocument();
  });

  it('appelle deleteOrderMutation.mutate avec l\'id au clic sur "Supprimer"', async () => {
    const user = userEvent.setup();
    mockDeleteMutate.mockImplementation((_id, opts) => opts?.onSuccess?.());
    render(<OrderCard order={buildOrder({ id: 'order-to-delete' })} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[buttons.length - 1]);
    await user.click(screen.getByText('Supprimer'));

    expect(mockDeleteMutate).toHaveBeenCalledWith(
      'order-to-delete',
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('ferme la boîte de dialogue après suppression réussie', async () => {
    const user = userEvent.setup();
    mockDeleteMutate.mockImplementation((_id, opts) => opts?.onSuccess?.());
    render(<OrderCard order={buildOrder()} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[buttons.length - 1]);
    await user.click(screen.getByText('Supprimer'));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('annule la suppression au clic sur "Annuler" sans appeler la mutation', async () => {
    const user = userEvent.setup();
    render(<OrderCard order={buildOrder()} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[buttons.length - 1]);
    await user.click(screen.getByText('Annuler'));

    expect(mockDeleteMutate).not.toHaveBeenCalled();
  });
});
