import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, createDocument, editDocument, deleteDocument } from '@zyra/conf/lib/query'
import {
  IPermission,
  PERMISSIONS_SEED,
  PERMISSIONS_COLLECTION,
} from '@zyra/conf/domain/entities/permissions.entities'

export function usePermissionsUseCases() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['permissions'] })

  const usePermissions = () =>
    useQuery({
      queryKey: ['permissions'],
      queryFn: async () => {
        const data = (await fetchCollection(PERMISSIONS_COLLECTION)) as IPermission[]
        return [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      },
    })

  const useSeedDefaultPermissions = () =>
    useMutation({
      mutationFn: async () => {
        await Promise.all(
          PERMISSIONS_SEED.map(permission =>
            createDocument(PERMISSIONS_COLLECTION, permission, permission.key)
          )
        )
      },
      onSuccess: invalidate,
    })

  const useCreatePermission = () =>
    useMutation({
      mutationFn: async (data: Omit<IPermission, 'id' | 'createdAt' | 'updatedAt'>) =>
        createDocument(PERMISSIONS_COLLECTION, data, data.key),
      onSuccess: invalidate,
    })

  const useUpdatePermission = () =>
    useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<IPermission> }) =>
        editDocument(PERMISSIONS_COLLECTION, id, data),
      onSuccess: invalidate,
    })

  const useDeletePermission = () =>
    useMutation({
      mutationFn: async (id: string) => deleteDocument(PERMISSIONS_COLLECTION, id),
      onSuccess: invalidate,
    })

  return {
    usePermissions,
    useSeedDefaultPermissions,
    useCreatePermission,
    useUpdatePermission,
    useDeletePermission,
  }
}
