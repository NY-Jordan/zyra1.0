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
import { fetchCollection, createDocument, editDocument } from '@zyra/conf/lib/query';
import { toast } from 'sonner';

const mockFetchCollection = vi.mocked(fetchCollection);
const mockCreateDocument = vi.mocked(createDocument);
const mockEditDocument = vi.mocked(editDocument);

const SERVICE_NO_SUPP = {
  id: 'service-base',
  name: 'Coupe homme',
  price: 5000,
  duration: 30,
  categoryId: 'cat-coupe',
  supplements: [],
};

const SERVICE_WITH_SUPP = {
  id: 'service-supp',
  name: 'Coupe + Soins',
  price: 8000,
  duration: 60,
  categoryId: 'cat-soins',
  supplements: [
    { id: 'supp-1', name: 'Shampoing', price: 1500, duration: 10 },
    { id: 'supp-2', name: 'Massage crânien', price: 2000, duration: 15 },
  ],
};

// L'association coiffeur-salon stocke des IDs de CATÉGORIES de service dans
// "salonServiceIds" (champ mal nommé), pas des IDs de service directs.
// Qualifiés pour les deux catégories par défaut, afin que les flux existants
// (sélection d'un service puis d'un coiffeur) fonctionnent sans configuration
// supplémentaire. Le filtrage par qualification est testé séparément.
const HAIRDRESSER_1 = {
  id: 'hd-1',
  name: 'Marc',
  speciality: 'Coupe',
  photo: '',
  associationHairdresser: { salonServiceIds: ['cat-coupe', 'cat-soins'] },
};
const HAIRDRESSER_2 = {
  id: 'hd-2',
  name: 'Sophie',
  speciality: 'Coloration',
  photo: '',
  associationHairdresser: { salonServiceIds: ['cat-coupe', 'cat-soins'] },
};

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

// Sélectionne d'abord le service (ce qui fait apparaître la liste des coiffeurs
// qualifiés), puis le coiffeur, puis avance à l'étape paiement.
async function goToStep2(
  user: ReturnType<typeof userEvent.setup>,
  serviceName = 'Coupe homme',
  hairdresserName = 'Marc'
) {
  await goToStep1(user);
  await user.click(screen.getByRole('button', { name: new RegExp(serviceName) }));
  await user.click(screen.getByRole('button', { name: new RegExp(hairdresserName) }));
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
    expect(screen.getByText('Coupe homme', { exact: false })).toBeInTheDocument();
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
describe('NewOrderModal - Sélection du service puis du coiffeur', () => {
  it('liste tous les services du salon avant toute sélection', async () => {
    const user = userEvent.setup();
    renderModal();
    await goToStep1(user);

    expect(screen.getByRole('button', { name: /Coupe homme/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Coupe \+ Soins/ })).toBeInTheDocument();
    // Aucun coiffeur tant qu'aucun service n'est choisi
    expect(screen.queryByText('Coiffeur *')).not.toBeInTheDocument();
  });

  it('affiche la liste des coiffeurs qualifiés seulement après la sélection d\'un service', async () => {
    const user = userEvent.setup();
    renderModal();
    await goToStep1(user);

    await user.click(screen.getByRole('button', { name: /Coupe homme/ }));

    expect(screen.getByText('Coiffeur *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Marc/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sophie/ })).toBeInTheDocument();
  });

  it('ne propose que les coiffeurs qualifiés pour le service sélectionné', async () => {
    const user = userEvent.setup();
    mockHairDressers.value = [
      { id: 'hd-1', name: 'Marc', speciality: 'Coupe', photo: '', associationHairdresser: { salonServiceIds: ['cat-coupe'] } },
      { id: 'hd-2', name: 'Sophie', speciality: 'Coloration', photo: '', associationHairdresser: { salonServiceIds: ['cat-soins'] } },
    ];
    renderModal();
    await goToStep1(user);

    await user.click(screen.getByRole('button', { name: /Coupe homme/ }));

    expect(screen.getByRole('button', { name: /Marc/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sophie/ })).not.toBeInTheDocument();
  });

  it('affiche un message si aucun coiffeur n\'est associé au service choisi', async () => {
    const user = userEvent.setup();
    mockHairDressers.value = [
      { id: 'hd-1', name: 'Marc', speciality: 'Coupe', photo: '', associationHairdresser: { salonServiceIds: ['cat-soins'] } },
    ];
    renderModal();
    await goToStep1(user);

    await user.click(screen.getByRole('button', { name: /Coupe homme/ }));

    expect(screen.getByText('Aucun coiffeur n\'est encore associé à ce service.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marc/ })).not.toBeInTheDocument();
  });

  it('réinitialise le coiffeur sélectionné quand on change de service', async () => {
    const user = userEvent.setup();
    mockHairDressers.value = [
      { id: 'hd-1', name: 'Marc', speciality: 'Coupe', photo: '', associationHairdresser: { salonServiceIds: ['cat-coupe'] } },
      { id: 'hd-2', name: 'Sophie', speciality: 'Coloration', photo: '', associationHairdresser: { salonServiceIds: ['cat-soins'] } },
    ];
    renderModal();
    await goToStep1(user);

    await user.click(screen.getByRole('button', { name: /Coupe homme/ }));
    await user.click(screen.getByRole('button', { name: /Marc/ }));

    await user.click(screen.getByRole('button', { name: /Coupe \+ Soins/ }));

    // Marc n'est plus qualifié pour ce service, donc plus listé ; Sophie apparaît à sa place
    expect(screen.queryByRole('button', { name: /Marc/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sophie/ })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Suppléments et calcul du prix', () => {
  it('affiche les suppléments et calcule le total quand on les sélectionne', async () => {
    const user = userEvent.setup();
    renderModal();
    await goToStep1(user);
    await user.click(screen.getByRole('button', { name: /Coupe \+ Soins/ }));
    await user.click(screen.getByRole('button', { name: /Marc/ }));

    expect(screen.getByText('Shampoing')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Shampoing/ }));

    expect(screen.getByText('9,500 XAF')).toBeInTheDocument(); // 8000 + 1500 total
  });

  it('réinitialise les suppléments quand on change de service', async () => {
    const user = userEvent.setup();
    renderModal();
    await goToStep1(user);
    await user.click(screen.getByRole('button', { name: /Coupe \+ Soins/ }));
    await user.click(screen.getByRole('button', { name: /Marc/ }));
    await user.click(screen.getByRole('button', { name: /Shampoing/ }));

    await user.click(screen.getByRole('button', { name: /Coupe homme/ }));

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

  it('invalide aussi le cache des clients (liste + recherche d\'import) après création', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce('order-id-1');
    const { invalidateSpy } = renderModal();

    await goToStep2(user);
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clients'] }));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['salon-clients'] });
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
    await user.click(screen.getByRole('button', { name: /Coupe \+ Soins/ }));
    await user.click(screen.getByRole('button', { name: /Marc/ }));
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
describe('NewOrderModal - Import d\'un client existant', () => {
  it('préremplit le formulaire et affiche le bandeau "client importé" après sélection', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('Importer un client existant'));
    expect(screen.getByTestId('client-search-modal')).toBeInTheDocument();

    await user.click(screen.getByText('Choisir Client Existant'));

    expect(screen.getByLabelText('Nom complet *')).toHaveValue('Client Existant');
    expect(screen.getByLabelText('Téléphone *')).toHaveValue('+237611111111');
    expect(screen.getByLabelText('Email (optionnel)')).toHaveValue('existant@test.com');
    expect(screen.getByText('Client existant importé')).toBeInTheDocument();
  });

  it('grise (désactive) les champs client une fois un client importé', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('Importer un client existant'));
    await user.click(screen.getByText('Choisir Client Existant'));

    expect(screen.getByLabelText('Nom complet *')).toBeDisabled();
    expect(screen.getByLabelText('Téléphone *')).toBeDisabled();
    expect(screen.getByLabelText('Email (optionnel)')).toBeDisabled();
    // Le toggle "client régulier" n'a plus lieu d'être : le client existe déjà
    expect(screen.queryByLabelText('Enregistrer comme client régulier')).not.toBeInTheDocument();
  });

  it('permet de retirer le client importé : champs réactivés et vidés', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('Importer un client existant'));
    await user.click(screen.getByText('Choisir Client Existant'));
    await user.click(screen.getByText('Retirer'));

    expect(screen.queryByText('Client existant importé')).not.toBeInTheDocument();
    expect(screen.getByText('Importer un client existant')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom complet *')).not.toBeDisabled();
    expect(screen.getByLabelText('Nom complet *')).toHaveValue('');
    expect(screen.getByLabelText('Téléphone *')).toHaveValue('');
    expect(screen.getByLabelText('Email (optionnel)')).toHaveValue('');
  });

  it('utilise directement l\'ID du client importé, sans nouvelle recherche par nom/téléphone', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([{ id: 'client-existing', history: ['old-order'] }]); // relecture pour historique uniquement
    mockCreateDocument.mockResolvedValueOnce('order-id-import');
    renderModal();

    await user.click(screen.getByText('Importer un client existant'));
    await user.click(screen.getByText('Choisir Client Existant'));
    await user.click(screen.getByText('Suivant'));
    await user.click(screen.getByRole('button', { name: /Coupe homme/ }));
    await user.click(screen.getByRole('button', { name: /Marc/ }));
    await user.click(screen.getByText('Suivant'));
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockCreateDocument).toHaveBeenCalledWith(
        'orders',
        expect.objectContaining({ clientId: 'client-existing' })
      )
    );
    // Aucune recherche par nom/téléphone : un seul appel fetchCollection (relecture pour l'historique)
    expect(mockFetchCollection).toHaveBeenCalledTimes(1);
    expect(mockFetchCollection).toHaveBeenCalledWith('clients', expect.anything());
    // Pas de création de document client : on réutilise le client importé
    expect(mockCreateDocument).not.toHaveBeenCalledWith('clients', expect.anything());
  });

  it('incrémente (pousse dans l\'historique) le nombre de commandes du client importé', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([{ id: 'client-existing', history: ['old-order-1', 'old-order-2'] }]);
    mockCreateDocument.mockResolvedValueOnce('order-id-new');
    renderModal();

    await user.click(screen.getByText('Importer un client existant'));
    await user.click(screen.getByText('Choisir Client Existant'));
    await user.click(screen.getByText('Suivant'));
    await user.click(screen.getByRole('button', { name: /Coupe homme/ }));
    await user.click(screen.getByRole('button', { name: /Marc/ }));
    await user.click(screen.getByText('Suivant'));
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockEditDocument).toHaveBeenCalledWith(
        'clients',
        'client-existing',
        expect.objectContaining({ history: ['old-order-1', 'old-order-2', 'order-id-new'] })
      )
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Nouveau client (saisie manuelle)', () => {
  it('crée un nouveau client quand "client régulier" est coché, sans recherche préalable', async () => {
    const user = userEvent.setup();
    mockFetchCollection
      .mockResolvedValueOnce([]) // vérification de doublon par téléphone -> aucun client trouvé
      .mockResolvedValueOnce([{ id: 'new-client-id', history: [] }]); // relecture pour historique
    mockCreateDocument
      .mockResolvedValueOnce('new-client-id') // création du client
      .mockResolvedValueOnce('order-id-2'); // création de la commande
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000000');
    await user.click(screen.getByLabelText('Enregistrer comme client régulier'));

    // Attend que la vérification de doublon (debounce 500ms) se résolve avant de continuer
    await waitFor(() => expect(mockFetchCollection).toHaveBeenCalledTimes(1), { timeout: 1500 });

    await user.click(screen.getByText('Suivant'));
    await user.click(screen.getByRole('button', { name: /Coupe homme/ }));
    await user.click(screen.getByRole('button', { name: /Marc/ }));
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
    // Une seule recherche par téléphone (vérif. doublon) + une relecture pour l'historique
    expect(mockFetchCollection).toHaveBeenCalledTimes(2);
  });

  it('ne crée aucun client si "client régulier" n\'est pas coché', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce('order-id-no-client');
    renderModal();

    await goToStep2(user);
    await user.click(screen.getByText('Créer la commande'));

    await waitFor(() =>
      expect(mockCreateDocument).toHaveBeenCalledWith(
        'orders',
        expect.objectContaining({ clientId: null })
      )
    );
    expect(mockCreateDocument).not.toHaveBeenCalledWith('clients', expect.anything());
    expect(mockFetchCollection).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NewOrderModal - Détection de doublon (saisie manuelle)', () => {
  it('signale un client existant même si "client régulier" n\'est PAS coché, sans bouton importer', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([
      { id: 'client-dup', name: 'Alice Martin', phone: '+237600000099', email: null, history: [] },
    ]);
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000099');

    expect(
      await screen.findByText('"Alice Martin" existe déjà avec ce numéro de téléphone.', {}, { timeout: 1500 })
    ).toBeInTheDocument();
    expect(screen.queryByText('Importer ce client')).not.toBeInTheDocument();
    expect(screen.queryByText('Client déjà existant')).not.toBeInTheDocument();
  });

  it('ne bloque pas le passage à l\'étape suivante quand "client régulier" n\'est pas coché', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([
      { id: 'client-dup', name: 'Alice Martin', phone: '+237600000099', email: null, history: [] },
    ]);
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000099');
    await screen.findByText(/Alice Martin/, {}, { timeout: 1500 });

    await user.click(screen.getByText('Suivant'));

    expect(screen.getByText('Étape 2 sur 3')).toBeInTheDocument();
  });

  it('propose d\'importer un client existant si "client régulier" est coché', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([
      { id: 'client-dup', name: 'Alice Martin', phone: '+237600000099', email: null, history: [] },
    ]);
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000099');
    await user.click(screen.getByLabelText('Enregistrer comme client régulier'));

    expect(await screen.findByText('Client déjà existant', {}, { timeout: 1500 })).toBeInTheDocument();
    expect(
      screen.getByText('"Alice Martin" utilise déjà ce numéro de téléphone.')
    ).toBeInTheDocument();
    expect(screen.getByText('Importer ce client')).toBeInTheDocument();
  });

  it('bloque le passage à l\'étape suivante si la case est cochée et qu\'un doublon est détecté', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([
      { id: 'client-dup', name: 'Alice Martin', phone: '+237600000099', email: null, history: [] },
    ]);
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000099');
    await user.click(screen.getByLabelText('Enregistrer comme client régulier'));
    await screen.findByText('Client déjà existant', {}, { timeout: 1500 });

    await user.click(screen.getByText('Suivant'));

    expect(toast.error).toHaveBeenCalledWith(
      '"Alice Martin" existe déjà avec ce numéro : importez-le ou décochez "client régulier"'
    );
    expect(screen.getByText('Étape 1 sur 3')).toBeInTheDocument();
  });

  it('décocher "client régulier" lève le blocage et bascule vers le signal informatif', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([
      { id: 'client-dup', name: 'Alice Martin', phone: '+237600000099', email: null, history: [] },
    ]);
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000099');
    await user.click(screen.getByLabelText('Enregistrer comme client régulier'));
    await screen.findByText('Client déjà existant', {}, { timeout: 1500 });

    await user.click(screen.getByLabelText('Enregistrer comme client régulier')); // décoche

    expect(screen.queryByText('Client déjà existant')).not.toBeInTheDocument();
    expect(screen.queryByText('Importer ce client')).not.toBeInTheDocument();
    expect(screen.getByText('"Alice Martin" existe déjà avec ce numéro de téléphone.')).toBeInTheDocument();

    await user.click(screen.getByText('Suivant'));
    expect(screen.getByText('Étape 2 sur 3')).toBeInTheDocument();
  });

  it('n\'affiche rien si aucun client n\'a ce numéro', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([]);
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000000');

    await waitFor(() => expect(mockFetchCollection).toHaveBeenCalledTimes(1), { timeout: 1500 });
    expect(screen.queryByText('Client déjà existant')).not.toBeInTheDocument();
    expect(screen.queryByText(/existe déjà avec ce numéro/)).not.toBeInTheDocument();
  });

  it('importe le client suggéré au clic sur "Importer ce client"', async () => {
    const user = userEvent.setup();
    mockFetchCollection.mockResolvedValueOnce([
      { id: 'client-dup', name: 'Alice Martin', phone: '+237600000099', email: 'alice@test.com', history: [] },
    ]);
    renderModal();

    await user.type(screen.getByLabelText('Nom complet *'), 'Jean Dupont');
    await user.type(screen.getByLabelText('Téléphone *'), '+237600000099');
    await user.click(screen.getByLabelText('Enregistrer comme client régulier'));

    await screen.findByText('Importer ce client', {}, { timeout: 1500 });
    await user.click(screen.getByText('Importer ce client'));

    expect(screen.getByText('Client existant importé')).toBeInTheDocument();
    expect(screen.queryByText('Client déjà existant')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nom complet *')).toHaveValue('Alice Martin');
    expect(screen.getByLabelText('Téléphone *')).toHaveValue('+237600000099');
    expect(screen.getByLabelText('Nom complet *')).toBeDisabled();
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
