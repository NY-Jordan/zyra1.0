import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, editDocument, deleteDocument, createDocument } from '@zyra/conf/lib/query'

type Category = {
  id: string
  name: string
  active: boolean
}

export function useSalonCategories() {
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: async () => {
      const res = await fetchCollection('salon_categories')
      return res.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        active: cat.active ?? true,
      }))
    },
  })

  const addMutation = useMutation({
    mutationFn: async (name: string) => createDocument('salon_categories', { name, active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-categories'] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async (cat: Category) => editDocument('salon_categories', cat.id, { active: !cat.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-categories'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteDocument('salon_categories', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-categories'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; name: string }) =>
      editDocument('salon_categories', params.id, { name: params.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-categories'] })
    },
  })

  return {
    categories,
    isLoading,
    addCategory: addMutation.mutate,
    toggleCategory: toggleMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    updateCategory: (id: string, name: string) => updateMutation.mutate({ id, name }),
    addPending: addMutation.isPending,
    togglePending: toggleMutation.isPending,
    deletePending: deleteMutation.isPending,
    updatePending: updateMutation.isPending,
  }
}