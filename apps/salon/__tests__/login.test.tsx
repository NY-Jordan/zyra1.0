import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Hoisted mocks (évite le problème de hoisting de vi.mock) ────────────────
const { mockPush, mockReplace, mockLogin, mockCheckSubscription, mockOnAuthStateChanged } =
  vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockReplace: vi.fn(),
    mockLogin: vi.fn(),
    mockCheckSubscription: vi.fn(),
    mockOnAuthStateChanged: vi.fn(),
  }));

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

vi.mock('@/services/ownerAuthService', () => ({
  ownerAuthService: {
    login: mockLogin,
    checkSubscriptionStatus: mockCheckSubscription,
  },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
}));

vi.mock('@zyra/conf/lib/firebase', () => ({
  auth: {},
}));

// Stub des composants UI
vi.mock('@zyra/ui/components/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@zyra/ui/components/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@zyra/ui/components/alert', () => ({
  Alert: ({ children, ...props }: any) => <div role="alert" {...props}>{children}</div>,
  AlertDescription: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('firebase/firestore', () => ({ where: vi.fn() }));

vi.mock('@zyra/conf/lib/query', () => ({ fetchCollection: vi.fn() }));

// ─── Import du composant ──────────────────────────────────────────────────────
import Login from '@/app/auth/login/page';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
describe('Page Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Par défaut : aucun utilisateur connecté (pas de redirection auto)
    mockOnAuthStateChanged.mockImplementation((_auth: any, cb: (u: null) => void) => {
      cb(null);
      return vi.fn(); // unsubscribe
    });
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  // ─── Rendu ────────────────────────────────────────────────────────────────
  describe('Rendu initial', () => {
    it('affiche le titre "Connexion"', () => {
      render(<Login />);
      expect(screen.getByText('Connexion')).toBeInTheDocument();
    });

    it('affiche le champ email', () => {
      render(<Login />);
      expect(screen.getByLabelText(/adresse e-mail/i)).toBeInTheDocument();
    });

    it('affiche le champ mot de passe', () => {
      render(<Login />);
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it('affiche le bouton "Se connecter"', () => {
      render(<Login />);
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('n\'affiche pas de lien vers la page d\'inscription', () => {
      render(<Login />);
      expect(screen.queryByText(/créer un compte/i)).not.toBeInTheDocument();
    });

    it('affiche le lien "Mot de passe oublié ?"', () => {
      render(<Login />);
      expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument();
    });

    it('le bouton est activé au chargement', () => {
      render(<Login />);
      expect(screen.getByRole('button', { name: /se connecter/i })).not.toBeDisabled();
    });
  });

  // ─── Redirection utilisateur déjà connecté ────────────────────────────────
  describe('Redirection si déjà connecté', () => {
    it('redirige vers /salon/dashboard si l\'utilisateur est déjà authentifié', () => {
      mockOnAuthStateChanged.mockImplementation((_auth: any, cb: (u: { uid: string }) => void) => {
        cb({ uid: 'existing-user' });
        return vi.fn();
      });

      render(<Login />);

      expect(mockReplace).toHaveBeenCalledWith('/salon/dashboard');
    });

    it('ne redirige pas si aucun utilisateur n\'est connecté', () => {
      render(<Login />);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  // ─── Validation du formulaire ─────────────────────────────────────────────
  describe('Validation des champs', () => {
    it('affiche une erreur si l\'email est vide à la soumission', async () => {
      const user = userEvent.setup();
      render(<Login />);

      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(await screen.findByText(/l'adresse e-mail est requise/i)).toBeInTheDocument();
    });

    it('affiche une erreur si le mot de passe est vide à la soumission', async () => {
      const user = userEvent.setup();
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(await screen.findByText(/le mot de passe est requis/i)).toBeInTheDocument();
    });

    it('affiche une erreur si le format de l\'email est invalide', async () => {
      render(<Login />);

      // fireEvent.change contourne la validation HTML native du type="email"
      // afin que react-hook-form puisse valider son pattern custom
      fireEvent.change(screen.getByLabelText(/adresse e-mail/i), {
        target: { value: 'pas-un-email' },
      });
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

      expect(await screen.findByText(/l'adresse e-mail est invalide/i)).toBeInTheDocument();
    });

    it('affiche une erreur si le mot de passe a moins de 6 caractères', async () => {
      const user = userEvent.setup();
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@test.com');
      await user.type(screen.getByLabelText(/mot de passe/i), '12345');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(await screen.findByText(/au moins 6 caractères/i)).toBeInTheDocument();
    });

    it('n\'affiche aucune erreur si le formulaire est valide', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ uid: 'user-1' });
      mockCheckSubscription.mockResolvedValueOnce({
        hasSubscription: true,
        redirectTo: '/salon/dashboard',
        message: 'Connexion réussie',
      });
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@test.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => expect(mockLogin).toHaveBeenCalled());
      expect(screen.queryByText(/est requis/i)).not.toBeInTheDocument();
    });
  });

  // ─── Soumission réussie ───────────────────────────────────────────────────
  describe('Soumission réussie', () => {
    it('appelle ownerAuthService.login avec les bonnes données', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ uid: 'user-1' });
      mockCheckSubscription.mockResolvedValueOnce({
        hasSubscription: true,
        redirectTo: '/salon/dashboard',
        message: 'Connexion réussie',
      });
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'salon@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'secret123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() =>
        expect(mockLogin).toHaveBeenCalledWith('salon@zyra.com', 'secret123')
      );
    });

    it('appelle checkSubscriptionStatus après un login réussi', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ uid: 'user-42' });
      mockCheckSubscription.mockResolvedValueOnce({
        hasSubscription: true,
        redirectTo: '/salon/dashboard',
        message: 'Connexion réussie',
      });
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => expect(mockCheckSubscription).toHaveBeenCalledWith('user-42'));
    });

    it('affiche le toast de succès après la connexion', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ uid: 'user-1' });
      mockCheckSubscription.mockResolvedValueOnce({
        hasSubscription: true,
        redirectTo: '/salon/dashboard',
        message: 'Connexion réussie',
      });
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Connexion réussie')
      );
    });

    it('affiche un toast info si l\'abonnement est expiré', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ uid: 'user-1' });
      mockCheckSubscription.mockResolvedValueOnce({
        hasSubscription: false,
        redirectTo: '/payment/packages',
        message: 'Votre forfait a expiré. Veuillez en sélectionner un nouveau.',
      });
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() =>
        expect(toast.info).toHaveBeenCalledWith(
          'Votre forfait a expiré. Veuillez en sélectionner un nouveau.'
        )
      );
    });

    it('affiche le message d\'abonnement dans l\'alerte si hasSubscription est false', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ uid: 'user-1' });
      mockCheckSubscription.mockResolvedValueOnce({
        hasSubscription: false,
        redirectTo: '/payment/packages',
        message: 'Votre forfait a expiré. Veuillez en sélectionner un nouveau.',
      });
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(
        await screen.findByText(/votre forfait a expiré/i)
      ).toBeInTheDocument();
    });
  });

  // ─── Gestion des erreurs ──────────────────────────────────────────────────
  describe('Gestion des erreurs de connexion', () => {
    it('affiche le message d\'erreur si le login échoue', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce({ message: 'Mot de passe incorrect.' });
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(await screen.findByText('Mot de passe incorrect.')).toBeInTheDocument();
    });

    it('affiche un message générique si l\'erreur n\'a pas de message', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce({});
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(
        await screen.findByText(/une erreur de connexion est survenue/i)
      ).toBeInTheDocument();
    });

    it('réinitialise l\'erreur avant chaque tentative de connexion', async () => {
      const user = userEvent.setup();
      // Première tentative : échec
      mockLogin.mockRejectedValueOnce({ message: 'Mot de passe incorrect.' });
      // Deuxième tentative : succès
      mockLogin.mockResolvedValueOnce({ uid: 'user-1' });
      mockCheckSubscription.mockResolvedValueOnce({
        hasSubscription: true,
        redirectTo: '/salon/dashboard',
        message: 'Connexion réussie',
      });

      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));
      await screen.findByText('Mot de passe incorrect.');

      // Deuxième soumission
      await user.clear(screen.getByLabelText(/mot de passe/i));
      await user.type(screen.getByLabelText(/mot de passe/i), 'correctpass');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() =>
        expect(screen.queryByText('Mot de passe incorrect.')).not.toBeInTheDocument()
      );
    });
  });

  // ─── État de chargement ───────────────────────────────────────────────────
  describe('État de chargement', () => {
    it('désactive le bouton pendant la connexion', async () => {
      const user = userEvent.setup();
      // Promesse qui ne se résout pas immédiatement pour observer le loading
      mockLogin.mockImplementationOnce(() => new Promise(() => {}));
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /connexion en cours/i })).toBeDisabled()
      );
    });

    it('affiche "Connexion en cours..." pendant la requête', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementationOnce(() => new Promise(() => {}));
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() =>
        expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument()
      );
    });

    it('réactive le bouton après un échec de connexion', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce({ message: 'Erreur' });
      render(<Login />);

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'test@zyra.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /se connecter/i })).not.toBeDisabled()
      );
    });
  });

  // ─── Navigation ───────────────────────────────────────────────────────────
  describe('Navigation', () => {
    it('navigue vers /auth/forgot-password au clic sur "Mot de passe oublié"', async () => {
      const user = userEvent.setup();
      render(<Login />);

      await user.click(screen.getByText(/mot de passe oublié/i));

      expect(mockPush).toHaveBeenCalledWith('/auth/forgot-password');
    });

    it('n\'a pas de lien de navigation vers /auth/register', () => {
      render(<Login />);
      expect(screen.queryByText(/créer un compte/i)).not.toBeInTheDocument();
    });
  });
});
