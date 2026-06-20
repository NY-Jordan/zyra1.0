import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@zyra/ui/components/dialog', () => ({
  Dialog: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock('@zyra/ui/components/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

vi.mock('@zyra/ui/components/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

// ─── Import du composant (après les mocks) ────────────────────────────────────
import OrderDetailsModal from '@/presentation/components/orders/OrderDetailsModal';
import { IOrder } from '@zyra/conf/domain/entities/orders.entities';

const FIXED_DATE = new Date('2026-06-19T14:30:00.000Z');

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
    createdAt: FIXED_DATE.toISOString(),
    ...overrides,
  };
}

const expectedTime = FIXED_DATE.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const expectedFullDate = FIXED_DATE.toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const onOpenChange = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderDetailsModal - Cas limites', () => {
  it('ne rend rien si order est null', () => {
    const { container } = render(
      <OrderDetailsModal order={null} open={true} onOpenChange={onOpenChange} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('ne rend rien si open est false même avec une commande valide', () => {
    render(<OrderDetailsModal order={buildOrder()} open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderDetailsModal - Statut et paiement', () => {
  it.each([
    ['pending', 'En attente'],
    ['completed', 'Terminée'],
    ['canceled', 'Annulée'],
  ] as const)('affiche le badge de statut "%s" -> "%s"', (status, label) => {
    render(<OrderDetailsModal order={buildOrder({ status })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('affiche le statut brut si inconnu', () => {
    render(
      <OrderDetailsModal order={buildOrder({ status: 'mystere' as any })} open={true} onOpenChange={onOpenChange} />
    );
    expect(screen.getByText('mystere')).toBeInTheDocument();
  });

  it('affiche "Payé" en vert si la commande est payée', () => {
    render(<OrderDetailsModal order={buildOrder({ isPaid: true })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText('Payé')).toBeInTheDocument();
  });

  it('affiche "Non payé" en rouge si la commande n\'est pas payée', () => {
    render(<OrderDetailsModal order={buildOrder({ isPaid: false })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText('Non payé')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderDetailsModal - Informations principales', () => {
  it('affiche le prix total formaté (en-tête et récapitulatif)', () => {
    render(<OrderDetailsModal order={buildOrder({ totalPrice: 17500 })} open={true} onOpenChange={onOpenChange} />);
    // Le total apparaît à la fois dans le bandeau d'en-tête et dans le détail des prix
    expect(screen.getAllByText('17,500 XAF')).toHaveLength(2);
  });

  it('affiche le nom du service et l\'heure de création', () => {
    render(<OrderDetailsModal order={buildOrder({ serviceName: 'Coloration' })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText('Coloration')).toBeInTheDocument();
    expect(screen.getByText(expectedTime)).toBeInTheDocument();
  });

  it('affiche le nom, téléphone du client', () => {
    render(
      <OrderDetailsModal
        order={buildOrder({ clientName: 'Alice', clientPhone: '+237699999999' })}
        open={true}
        onOpenChange={onOpenChange}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('+237699999999')).toBeInTheDocument();
  });

  it('affiche l\'email du client uniquement s\'il est renseigné', () => {
    const { rerender } = render(
      <OrderDetailsModal order={buildOrder({ clientEmail: 'alice@test.com' })} open={true} onOpenChange={onOpenChange} />
    );
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();

    rerender(
      <OrderDetailsModal order={buildOrder({ clientEmail: undefined })} open={true} onOpenChange={onOpenChange} />
    );
    expect(screen.queryByText('alice@test.com')).not.toBeInTheDocument();
  });

  it('affiche le nom du coiffeur', () => {
    render(<OrderDetailsModal order={buildOrder({ hairDresserName: 'Sophie' })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText('Sophie')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderDetailsModal - Détails des prix', () => {
  it('affiche le prix du service et le total sans ligne suppléments si supplementsPrice est 0', () => {
    render(
      <OrderDetailsModal
        order={buildOrder({ price: 5000, supplementsPrice: 0, totalPrice: 5000 })}
        open={true}
        onOpenChange={onOpenChange}
      />
    );
    // "5,000 XAF" apparaît 3 fois : en-tête, prix du service, total
    expect(screen.getAllByText('5,000 XAF')).toHaveLength(3);
    expect(screen.queryByText('Suppléments:')).not.toBeInTheDocument();
  });

  it('affiche la ligne suppléments quand supplementsPrice > 0', () => {
    render(
      <OrderDetailsModal
        order={buildOrder({ price: 5000, supplementsPrice: 1500, totalPrice: 6500 })}
        open={true}
        onOpenChange={onOpenChange}
      />
    );
    expect(screen.getByText('Suppléments:')).toBeInTheDocument();
    expect(screen.getByText('1,500 XAF')).toBeInTheDocument();
  });

  it('affiche les badges de suppléments nommés quand présents', () => {
    render(
      <OrderDetailsModal
        order={buildOrder({ supplements: ['Shampoing', 'Massage crânien'] })}
        open={true}
        onOpenChange={onOpenChange}
      />
    );
    expect(screen.getByText('Shampoing')).toBeInTheDocument();
    expect(screen.getByText('Massage crânien')).toBeInTheDocument();
  });

  it('n\'affiche pas la section suppléments si la liste est vide', () => {
    render(<OrderDetailsModal order={buildOrder({ supplements: [] })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.queryByText('Suppléments')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderDetailsModal - Méthode de paiement', () => {
  it('affiche "Espèces" pour la méthode cash', () => {
    render(<OrderDetailsModal order={buildOrder({ paymentMethod: 'cash' })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText('Espèces')).toBeInTheDocument();
  });

  it('affiche "Mobile Money" pour la méthode mobile', () => {
    render(<OrderDetailsModal order={buildOrder({ paymentMethod: 'mobile' })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText('Mobile Money')).toBeInTheDocument();
  });

  it('affiche la valeur brute pour une méthode inconnue', () => {
    render(
      <OrderDetailsModal order={buildOrder({ paymentMethod: 'paypal' as any })} open={true} onOpenChange={onOpenChange} />
    );
    expect(screen.getByText('paypal')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderDetailsModal - Notes et date', () => {
  it('affiche les notes uniquement si renseignées', () => {
    const { rerender } = render(
      <OrderDetailsModal order={buildOrder({ notes: 'Client pressé' })} open={true} onOpenChange={onOpenChange} />
    );
    expect(screen.getByText('Client pressé')).toBeInTheDocument();

    rerender(<OrderDetailsModal order={buildOrder({ notes: undefined })} open={true} onOpenChange={onOpenChange} />);
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('affiche la date de création formatée en toutes lettres', () => {
    render(<OrderDetailsModal order={buildOrder()} open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText(expectedFullDate)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('OrderDetailsModal - Interaction', () => {
  it('appelle onOpenChange(false) au clic sur "Fermer"', async () => {
    const user = userEvent.setup();
    render(<OrderDetailsModal order={buildOrder()} open={true} onOpenChange={onOpenChange} />);

    await user.click(screen.getByText('Fermer'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
