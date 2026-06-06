import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks Firebase ───────────────────────────────────────────────────────────
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
}));

vi.mock('@zyra/conf/lib/firebase', () => ({
  auth: {},
}));

vi.mock('@zyra/conf/lib/query', () => ({
  fetchCollection: vi.fn(),
  editDocument: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  where: vi.fn(),
}));

vi.mock('@zyra/conf/domain/enums/statusEnum', () => ({
  SalonStatusEnum: { payment: 'payment' },
}));

// ─── Imports (après les mocks) ────────────────────────────────────────────────
import { signInWithEmailAndPassword } from 'firebase/auth';
import { fetchCollection, editDocument } from '@zyra/conf/lib/query';
import { ownerAuthService } from '@/services/ownerAuthService';

const mockSignIn = vi.mocked(signInWithEmailAndPassword);
const mockFetchCollection = vi.mocked(fetchCollection);
const mockEditDocument = vi.mocked(editDocument);

// ─────────────────────────────────────────────────────────────────────────────
describe('ownerAuthService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restaurer localStorage
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
      writable: true,
    });
  });

  it('retourne l\'utilisateur quand les identifiants sont valides', async () => {
    const fakeUser = { uid: 'user-123', email: 'test@test.com' };
    mockSignIn.mockResolvedValueOnce({ user: fakeUser } as any);

    const result = await ownerAuthService.login('test@test.com', 'password123');

    expect(mockSignIn).toHaveBeenCalledWith({}, 'test@test.com', 'password123');
    expect(result).toEqual(fakeUser);
  });

  it('lance une erreur lisible pour auth/invalid-email', async () => {
    mockSignIn.mockRejectedValueOnce({ code: 'auth/invalid-email' });

    await expect(ownerAuthService.login('bad', 'pass')).rejects.toMatchObject({
      message: "L'adresse email est invalide.",
    });
  });

  it('lance une erreur lisible pour auth/user-disabled', async () => {
    mockSignIn.mockRejectedValueOnce({ code: 'auth/user-disabled' });

    await expect(ownerAuthService.login('a@b.com', 'pass')).rejects.toMatchObject({
      message: 'Ce compte a été désactivé.',
    });
  });

  it('lance une erreur lisible pour auth/user-not-found', async () => {
    mockSignIn.mockRejectedValueOnce({ code: 'auth/user-not-found' });

    await expect(ownerAuthService.login('a@b.com', 'pass')).rejects.toMatchObject({
      message: 'Aucun compte ne correspond à cet email.',
    });
  });

  it('lance une erreur lisible pour auth/wrong-password', async () => {
    mockSignIn.mockRejectedValueOnce({ code: 'auth/wrong-password' });

    await expect(ownerAuthService.login('a@b.com', 'wrongpass')).rejects.toMatchObject({
      message: 'Mot de passe incorrect.',
    });
  });

  it('lance une erreur lisible pour auth/too-many-requests', async () => {
    mockSignIn.mockRejectedValueOnce({ code: 'auth/too-many-requests' });

    await expect(ownerAuthService.login('a@b.com', 'pass')).rejects.toMatchObject({
      message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
    });
  });

  it('lance un message générique pour un code d\'erreur inconnu', async () => {
    mockSignIn.mockRejectedValueOnce({ code: 'auth/unknown-error' });

    await expect(ownerAuthService.login('a@b.com', 'pass')).rejects.toMatchObject({
      message: 'Une erreur est survenue. Veuillez réessayer.',
    });
  });

  it('expose l\'erreur originale Firebase dans originalError', async () => {
    const firebaseError = { code: 'auth/wrong-password', message: 'firebase raw' };
    mockSignIn.mockRejectedValueOnce(firebaseError);

    await expect(ownerAuthService.login('a@b.com', 'pass')).rejects.toMatchObject({
      originalError: firebaseError,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ownerAuthService.getOwnerById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne le propriétaire quand il existe', async () => {
    const owner = { id: 'user-123', name: 'Alice' };
    mockFetchCollection.mockResolvedValueOnce([owner] as any);

    const result = await ownerAuthService.getOwnerById('user-123');

    expect(result).toEqual(owner);
  });

  it('lance une erreur quand aucun propriétaire n\'est trouvé (tableau vide)', async () => {
    mockFetchCollection.mockResolvedValueOnce([] as any);

    await expect(ownerAuthService.getOwnerById('inexistant')).rejects.toThrow(
      'Propriétaire introuvable'
    );
  });

  it('lance une erreur quand fetchCollection retourne null/undefined', async () => {
    mockFetchCollection.mockResolvedValueOnce(null as any);

    await expect(ownerAuthService.getOwnerById('inexistant')).rejects.toThrow(
      'Propriétaire introuvable'
    );
  });

  it('propage les erreurs réseau depuis fetchCollection', async () => {
    mockFetchCollection.mockRejectedValueOnce(new Error('réseau indisponible'));

    await expect(ownerAuthService.getOwnerById('user-123')).rejects.toThrow(
      'réseau indisponible'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ownerAuthService.checkSubscriptionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
      writable: true,
    });
  });

  it('redirige vers /auth/login si aucun salon n\'est associé', async () => {
    mockFetchCollection.mockResolvedValueOnce([] as any); // salons vide

    const result = await ownerAuthService.checkSubscriptionStatus('user-123');

    expect(result).toEqual({
      hasSubscription: false,
      redirectTo: '/auth/login',
      message: 'Vous ne posseder aucun salon. Veuillez contacter le support.',
    });
  });

  it('redirige vers /payment/packages si aucun abonnement actif', async () => {
    const salon = { id: 'salon-1', ownerId: 'user-123' };
    mockFetchCollection
      .mockResolvedValueOnce([salon] as any)   // salons
      .mockResolvedValueOnce([] as any);        // abonnements vide

    const result = await ownerAuthService.checkSubscriptionStatus('user-123');

    expect(result).toEqual({
      hasSubscription: false,
      redirectTo: '/payment/packages',
      message: 'Votre forfait a expiré. Veuillez en sélectionner un nouveau.',
    });
    expect(mockEditDocument).toHaveBeenCalledWith('owners', 'user-123', {
      status: { name: 'payment' },
    });
  });

  it('redirige vers /salon/dashboard et sauvegarde salonId avec 1 salon actif', async () => {
    const salon = { id: 'salon-abc', ownerId: 'user-123' };
    const subscription = { userId: 'user-123', status: 'active' };
    mockFetchCollection
      .mockResolvedValueOnce([salon] as any)
      .mockResolvedValueOnce([subscription] as any);

    const result = await ownerAuthService.checkSubscriptionStatus('user-123');

    expect(result).toEqual({
      hasSubscription: true,
      redirectTo: '/salon/dashboard',
      message: 'Connexion réussie',
    });
    expect(window.localStorage.setItem).toHaveBeenCalledWith('salonId', 'salon-abc');
  });

  it('redirige vers /salon si l\'utilisateur possède plusieurs salons', async () => {
    const salons = [
      { id: 'salon-1', ownerId: 'user-123' },
      { id: 'salon-2', ownerId: 'user-123' },
    ];
    const subscription = { userId: 'user-123', status: 'active' };
    mockFetchCollection
      .mockResolvedValueOnce(salons as any)
      .mockResolvedValueOnce([subscription] as any);

    const result = await ownerAuthService.checkSubscriptionStatus('user-123');

    expect(result).toEqual({
      hasSubscription: true,
      redirectTo: '/salon',
      message: 'Connexion réussie',
    });
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });

  it('retourne hasSubscription:true par défaut en cas d\'erreur inattendue', async () => {
    mockFetchCollection.mockRejectedValueOnce(new Error('Firestore indisponible'));

    const result = await ownerAuthService.checkSubscriptionStatus('user-123');

    expect(result).toEqual({
      hasSubscription: true,
      redirectTo: '/salon',
      message: 'Connexion réussie',
    });
  });
});
