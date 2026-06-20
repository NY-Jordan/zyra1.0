import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const { mockSalon, mockHairDressers } = vi.hoisted(() => ({
  mockSalon: { value: null as any },
  mockHairDressers: { value: [] as any[] },
}));

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/hooks/useSalon', () => ({
  useSalon: () => ({ salon: mockSalon.value }),
}));

vi.mock('@/usecases/useHairDressers', () => ({
  useHairDressers: () => ({ hairDressers: mockHairDressers.value }),
}));

vi.mock('@zyra/conf/lib/query', () => ({
  fetchCollection: vi.fn(),
  createDocument: vi.fn(),
  editDocument: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({ where: vi.fn() }));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@zyra/ui/components/dialog', () => ({
  Dialog: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock('@zyra/ui/components/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@zyra/ui/components/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock('@/presentation/components/orders/ClientSearchModal', () => ({
  default: ({ open, onSelectClient }: any) =>
    open ? (
      <div data-testid="client-search-modal">
        <button
          type="button"
          onClick={() =>
            onSelectClient({
              id: 'client-existing',
              name: 'Client Existant',
              phone: '+237611111111',
              email: 'existant@test.com',
            })
          }
        >
          Choisir Client Existant
        </button>
      </div>
    ) : null,
}));

// ─── Import du composant (après les mocks) ────────────────────────────────────
import NewOrderModal from '@/presentation/components/orders/NewOrderModal';
import { fetchCollection, createDocument } from '@zyra/conf/lib/query';
import { toast } from 'sonner';

const mockFetchCollection = vi.mocked(fetchCollection);
const mockCreateDocument = vi.mocked(createDocument);

const SERVICE_NO_SUPP = {
  id: 'service-base',
  name: 'Coupe homme',
  price: 5000,
  duration: 30,
  categoryId: 'cat-1',
  supplements: [],
};

const SERVICE_WITH_SUPP = {
  id: 'service-supp',
  name: 'Coupe + Soins',
  price: 8000,
  duration: 60,
  categoryId: 'cat-1',
  supplements: [
    { id: 'supp-1', name: 'Shampoing', price: 1500, duration: 10 },
    { id: 'supp-2', name: 'Massage crânien', price: 2000, duration: 15 },
  ],
};

const HAIRDRESSER_1 = { id: 'hd-1', name: 'Marc', speciality: 'Coupe' };
const HAIRDRESSER_2 = { id: 'hd-2', name: 'Sophie', speciality: 'Coloration' };

function setup({ withHairDressers = true } = {}) {
  mockSalon.value = {
    id: 'salon-1',
    services: [SERVICE_NO_SUPP, SERVICE_WITH_SUPP],
  };
  mockHairDressers.value = withHairDressers ? [HAIRDRESSER_1, HAIRDRESSER_2] : [];
}

function renderModal(onOpenChange = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <NewOrderModal open={true} onOpenChange={onOpenChange} />
    </QueryClientProvider>
  );
  return { ...utils, invalidateSpy, onOpenChange };
}

async function goToStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
  await user.type(screen.getByLabelText('Téléphone *'), '+237600000000');
  await user.click(screen.getByText('Suivant'));
}

async function goToStep2(user: ReturnType<typeof userEvent.setup>, serviceId = 'service-base') {
  await goToStep1(user);
  await user.selectOptions(screen.getByLabelText('Coiffeur *'), 'hd-1');
  await user.selectOptions(screen.getByLabelText('Service *'), serviceId);
  await user.click(screen.getByText('Suivant'));
}

beforeEach(() => {
  vi.clearAllMocks();
  setup();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Rendu', () => {
  it('ne rend rien si open est false', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <NewOrderModal open={false} onOpenChange={vi.fn()} />
      </QueryClientProvider>
    );
    expect(screen.queryByText('Nouvelle commande')).not.toBeInTheDocument();
  });

  it('affiche le titre et indique "Étape 1 sur 3" au départ', () => {
    renderModal();
    // Le titre apparaît deux fois : une fois visible dans l'en-tête, une fois
    // dans le DialogTitle accessible (sr-only) requis par Radix.
    expect(screen.getAllByText('Nouvelle commande').length).toBeGreaterThan(0);
    expect(screen.getByText('Étape 1 sur 3')).toBeInTheDocument();
  });

  it('affiche les champs client à la première étape', () => {
    renderModal();
    expect(screen.getByLabelText('Nom complet *')).toBeInTheDocument();
    expect(screen.getByLabelText('Téléphone *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email (optionnel)')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Navigation entre étapes', () => {
  it('bloque le passage à l\'étape 2 si le nom ou le téléphone manque', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('Suivant'));

    expect(toast.error).toHaveBeenCalledWith('Renseignez au moins le nom et le téléphone du client');
    expect(screen.getByText('Étape 1 sur 3')).toBeInTheDocument();
  });

  it('passe à l\'étape 2 quand le nom et le téléphone sont renseignés', async () => {
    const user = userEvent.setup();
    renderModal();

    await goToStep1(user);

    expect(screen.getByText('Étape 2 sur 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Coiffeur *')).toBeInTheDocument();
  });

  it('bloque le passage à l\'étape 3 si aucun coiffeur/service n\'est sélectionné', async () => {
    const user = userEvent.setup();
    renderModal();

    await goToStep1(user);
    await user.click(screen.getByText('Suivant'));

    expect(toast.error).toHaveBeenCalledWith('Sélectionnez un coiffeur et un service');
    expect(screen.getByText('Étape 2 sur 3')).toBeInTheDocument();
  });

  it('passe à l\'étape 3 quand coiffeur et service sont sélectionnés', async () => {
    const user = userEvent.setup();
    renderModal();

    await goToStep2(user);

    expect(screen.getByText('Étape 3 sur 3')).toBeInTheDocument();
    expect(screen.getByText('Méthode de paiement *')).toBeInTheDocument();
  });

  it('revient à l\'étape précédente au clic sur "Précédent"', async () => {
    const user = userEvent.setup();
    renderModal();

    await goToStep1(user);
    await user.click(screen.getByText('Précédent'));

    expect(screen.getByText('Étape 1 sur 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom complet *')).toHaveValue('Jean Dupont');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Service, coiffeur et calcul du prix', () => {
  it('liste les coiffeurs et services du salon', async () => {
    const user = userEvent.setup();
    renderModal();
    await goToStep1(user);

    expect(screen.getByText('Marc - Coupe')).toBeInTheDocument();
    expect(screen.getByText('Sophie - Coloration')).toBeInTheDocument();
    expect(screen.getByText('Coupe homme - 5,000 XAF')).toBeInTheDocument();
    expect(screen.getByText('Coupe + Soins - 8,000 XAF')).toBeInTheDocument();
  });

  it('affiche les suppléments et calcule le total quand on les sélectionne', async () => {
    const user = userEvent.setup();
    renderModal();
    await goToStep1(user);
    await user.selectOptions(screen.getByLabelText('Coiffeur *'), 'hd-1');
    await user.selectOptions(screen.getByLabelText('Service *'), 'service-supp');

    expect(screen.getByText('Shampoing')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Shampoing/ }));

    expect(screen.getByText('9,500 XAF')).toBeInTheDocument(); // 8000 + 1500 total
  });

  it('réinitialise les suppléments quand on change de service', async () => {
    const user = userEvent.setup();
    renderModal();
    await goToStep1(user);
    await user.selectOptions(screen.getByLabelText('Coiffeur *'), 'hd-1');
    await user.selectOptions(screen.getByLabelText('Service *'), 'service-supp');
    await user.click(screen.getByRole('button', { name: /Shampoing/ }));

    await user.selectOptions(screen.getByLabelText('Service *'), 'service-base');

    expect(screen.queryByText('Shampoing')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Création réussie (sans client régulier)', () => {
  it('crée la commande avec les champs attendus', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce('order-id-1');
    renderModal();

    await goToStep2(user);
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockCreateDocument).toHaveBeenCalledWith(
        'orders',
        expect.objectContaining({
          salonId: 'salon-1',
          serviceId: 'service-base',
          serviceName: 'Coupe homme',
          hairDresserId: 'hd-1',
          hairDresserName: 'Marc',
          clientName: 'Jean Dupont',
          clientPhone: '+237600000000',
          clientEmail: null,
          price: 5000,
          supplements: [],
          supplementsPrice: 0,
          totalPrice: 5000,
          paymentMethod: 'cash',
          isPaid: true,
          status: 'completed',
          notes: null,
          clientId: null,
        })
      )
    );
  });

  it('affiche un toast de succès et ferme le modal après création', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce('order-id-1');
    const { onOpenChange } = renderModal();

    await goToStep2(user);
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Commande créée avec succès!'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('invalide le cache des commandes après création', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce('order-id-1');
    const { invalidateSpy } = renderModal();

    await goToStep2(user);
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] }));
  });

  it('utilise la méthode de paiement Mobile Money quand elle est sélectionnée', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce('order-id-1');
    renderModal();

    await goToStep2(user);
    await user.click(screen.getByRole('button', { name: /Mobile Money/ }));
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockCreateDocument).toHaveBeenCalledWith(
        'orders',
        expect.objectContaining({ paymentMethod: 'mobile' })
      )
    );
  });

  it('marque isPaid à false si le toggle "Paiement effectué" est désactivé', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce('order-id-1');
    renderModal();

    await goToStep2(user);
    await user.click(screen.getByLabelText('Paiement effectué'));
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockCreateDocument).toHaveBeenCalledWith(
        'orders',
        expect.objectContaining({ isPaid: false })
      )
    );
  });

  it('inclut les suppléments sélectionnés et les notes dans la commande', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce('order-id-1');
    renderModal();

    await goToStep1(user);
    await user.selectOptions(screen.getByLabelText('Coiffeur *'), 'hd-1');
    await user.selectOptions(screen.getByLabelText('Service *'), 'service-supp');
    await user.click(screen.getByRole('button', { name: /Shampoing/ }));
    await user.click(screen.getByText('Suivant'));
    await user.type(screen.getByLabelText('Notes (optionnel)'), 'Client pressé');
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockCreateDocument).toHaveBeenCalledWith(
        'orders',
        expect.objectContaining({
          supplements: ['Shampoing'],
          supplementsPrice: 1500,
          totalPrice: 9500,
          notes: 'Client pressé',
        })
      )
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Client régulier', () => {
  it('crée un nouveau client et met à jour son historique si aucun client existant n\'est trouvé', async () => {
    const user = userEvent.setup();
    mockFetchCollection
      .mockResolvedValueOnce([]) // vérification existence -> aucun client trouvé
      .mockResolvedValueOnce([{ id: 'new-client-id', history: [] }]); // relecture pour historique
    mockCreateDocument
      .mockResolvedValueOnce('new-client-id') // création du client
      .mockResolvedValueOnce('order-id-2'); // création de la commande
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000000');
    await user.click(screen.getByLabelText('Enregistrer comme client régulier'));
    await user.click(screen.getByText('Suivant'));
    await user.selectOptions(screen.getByLabelText('Coiffeur *'), 'hd-1');
    await user.selectOptions(screen.getByLabelText('Service *'), 'service-base');
    await user.click(screen.getByText('Suivant'));
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockCreateDocument).toHaveBeenNthCalledWith(
        1,
        'clients',
        expect.objectContaining({ name: 'Jean Dupont', phone: '+237600000000' })
      )
    );
    expect(mockCreateDocument).toHaveBeenNthCalledWith(
      2,
      'orders',
      expect.objectContaining({ clientId: 'new-client-id' })
    );
  });

  it('réutilise un client existant trouvé par nom et téléphone', async () => {
    const user = userEvent.setup();
    mockFetchCollection
      .mockResolvedValueOnce([{ id: 'existing-client-id', history: ['old-order'] }])
      .mockResolvedValueOnce([{ id: 'existing-client-id', history: ['old-order'] }]);
    mockCreateDocument.mockResolvedValueOnce('order-id-3');
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000000');
    await user.click(screen.getByLabelText('Enregistrer comme client régulier'));
    await user.click(screen.getByText('Suivant'));
    await user.selectOptions(screen.getByLabelText('Coiffeur *'), 'hd-1');
    await user.selectOptions(screen.getByLabelText('Service *'), 'service-base');
    await user.click(screen.getByText('Suivant'));
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockCreateDocument).toHaveBeenCalledWith(
        'orders',
        expect.objectContaining({ clientId: 'existing-client-id' })
      )
    );
    expect(mockCreateDocument).toHaveBeenCalledTimes(1);
  });

  it('préremplit le formulaire et active "client régulier" après import via le modal de recherche', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('Importer un client existant'));
    expect(screen.getByTestId('client-search-modal')).toBeInTheDocument();

    await user.click(screen.getByText('Choisir Client Existant'));

    expect(screen.getByLabelText('Nom complet *')).toHaveValue('Client Existant');
    expect(screen.getByLabelText('Téléphone *')).toHaveValue('+237611111111');
    expect(screen.getByLabelText('Email (optionnel)')).toHaveValue('existant@test.com');
    expect(screen.getByLabelText('Enregistrer comme client régulier')).toBeChecked();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Gestion des erreurs', () => {
  it('affiche le message d\'erreur retourné par la création', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockRejectedValueOnce(new Error('Connexion perdue'));
    const { onOpenChange } = renderModal();

    await goToStep2(user);
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Connexion perdue'));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('affiche un message générique si l\'erreur n\'a pas de message', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockRejectedValueOnce({});
    renderModal();

    await goToStep2(user);
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Erreur lors de la création de la commande')
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - État de chargement', () => {
  it('désactive et change le libellé du bouton pendant la création', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockImplementationOnce(() => new Promise(() => {}));
    renderModal();

    await goToStep2(user);
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() => expect(screen.getByText('Création...')).toBeInTheDocument());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Annulation', () => {
  it('ferme le modal et réinitialise au clic sur "Annuler" (étape 1)', async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();

    await user.click(screen.getByText('Annuler'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('ferme le modal au clic sur la croix de fermeture', async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('ne crée aucune commande au clic sur "Annuler"', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('Annuler'));

    expect(mockCreateDocument).not.toHaveBeenCalled();
  });
});
