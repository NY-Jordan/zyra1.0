import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@zyra/conf/lib/query', () => ({
  editDocument: vi.fn(),
  deleteDocument: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@zyra/core/usecases/notificationsUseCases', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
  createNotification: vi.fn().mockResolvedValue(undefined),
  getCurrentActor: vi.fn().mockReturnValue({ actorId: 'user-1', actorName: 'Test User' }),
}));

vi.mock('@zyra/core/hooks/useSalon', () => ({
  useSalon: vi.fn().mockReturnValue({ salonId: 'salon-1', salon: { id: 'salon-1', name: 'Test Salon' } }),
}));

// ─── Imports (après les mocks) ────────────────────────────────────────────────
import { editDocument, deleteDocument } from '@zyra/conf/lib/query';
import { toast } from 'sonner';
import {
  useMarkOrderAsPaid,
  useCancelOrder,
  useUpdateOrderStatus,
  useDeleteOrder,
} from '@zyra/core/usecases/ordersUseCases';

const mockEditDocument = vi.mocked(editDocument);
const mockDeleteDocument = vi.mocked(deleteDocument);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
    queryClient,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('useMarkOrderAsPaid', () => {
  it('appelle editDocument avec isPaid:true et une date de mise à jour', async () => {
    mockEditDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMarkOrderAsPaid(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockEditDocument).toHaveBeenCalledWith(
      'orders',
      'order-1',
      expect.objectContaining({ isPaid: true, updatedAt: expect.any(String) })
    );
  });

  it('affiche un toast de succès quand la mise à jour réussit', async () => {
    mockEditDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMarkOrderAsPaid(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-1' });
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Commande marquée comme payée'));
  });

  it('affiche un toast d\'erreur avec le message de l\'exception', async () => {
    mockEditDocument.mockRejectedValueOnce(new Error('Firestore indisponible'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMarkOrderAsPaid(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Firestore indisponible');
  });

  it('affiche un message générique si l\'erreur n\'a pas de message', async () => {
    mockEditDocument.mockRejectedValueOnce({});
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMarkOrderAsPaid(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Erreur lors de la mise à jour');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('useCancelOrder', () => {
  it('appelle editDocument avec status:canceled', async () => {
    mockEditDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCancelOrder(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-2' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockEditDocument).toHaveBeenCalledWith(
      'orders',
      'order-2',
      expect.objectContaining({ status: 'canceled' })
    );
  });

  it('affiche un toast de succès dédié à l\'annulation', async () => {
    mockEditDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCancelOrder(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-2' });
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Commande annulée'));
  });

  it('affiche un toast d\'erreur dédié si l\'annulation échoue', async () => {
    mockEditDocument.mockRejectedValueOnce(new Error('Réseau coupé'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCancelOrder(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-2' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Réseau coupé');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('useUpdateOrderStatus', () => {
  it('met à jour le statut sans completedAt si le statut n\'est pas "completed"', async () => {
    mockEditDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-3', status: 'pending' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const payload = mockEditDocument.mock.calls[0][2];
    expect(payload).toMatchObject({ status: 'pending' });
    expect(payload).not.toHaveProperty('completedAt');
  });

  it('ajoute completedAt quand le statut passe à "completed"', async () => {
    mockEditDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-3', status: 'completed' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const payload = mockEditDocument.mock.calls[0][2];
    expect(payload).toMatchObject({ status: 'completed', completedAt: expect.any(String) });
  });

  it('affiche un toast de succès générique pour la mise à jour de statut', async () => {
    mockEditDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-3', status: 'canceled' });
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Statut mis à jour'));
  });

  it('affiche un toast d\'erreur si la mise à jour de statut échoue', async () => {
    mockEditDocument.mockRejectedValueOnce(new Error('Permission refusée'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-3', status: 'completed' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Permission refusée');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('useDeleteOrder', () => {
  it('appelle deleteDocument avec la bonne collection et le bon id', async () => {
    mockDeleteDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteOrder(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-4' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteDocument).toHaveBeenCalledWith('orders', 'order-4');
  });

  it('affiche un toast de succès après suppression', async () => {
    mockDeleteDocument.mockResolvedValueOnce(undefined as any);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteOrder(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-4' });
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Commande supprimée avec succès')
    );
  });

  it('affiche un toast d\'erreur dédié si la suppression échoue', async () => {
    mockDeleteDocument.mockRejectedValueOnce(new Error('Document introuvable'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteOrder(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-4' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Document introuvable');
  });

  it('affiche un message générique si l\'erreur de suppression n\'a pas de message', async () => {
    mockDeleteDocument.mockRejectedValueOnce({});
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteOrder(), { wrapper });

    act(() => {
      result.current.mutate({ orderId: 'order-4' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Erreur lors de la suppression');
  });
});
