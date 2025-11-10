import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editDocument } from '@zyra/conf/lib/query'
import { useSalon } from '@/hooks/useSalon'
import { IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'


export function useServiceCategories() {
  const { salon } = useSalon()
  const queryClient = useQueryClient()
  const salonId = salon?.id
  // Les catégories viennent directement du salon
  const categories = salon?.serviceCategories || []

  const createMutation = useMutation({
    mutationFn: async (data: { 
      name: string
      description?: string
      isActive?: boolean
    }) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const newCategory: IServiceCategory = {
        id: crypto.randomUUID(),
        name: data.name.trim(),
        description: data.description?.trim() || '',
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedCategories = [...categories, newCategory]
      // Mettre à jour le salon
      return editDocument('salons', salonId, {
        serviceCategories: updatedCategories,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { 
      id: string
      data: Partial<IServiceCategory>
    }) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')

      const updatedCategories = categories.map(category => 
        category.id === id
          ? {
              ...category,
              ...data,
              updatedAt: new Date().toISOString() 
            }
          : category
      )
      // Mettre à jour le salon
      return editDocument('salons', salonId, {
        serviceCategories: updatedCategories,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon'] })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (category: IServiceCategory) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')

      // Inverser le statut de la catégorie
      const updatedCategories = categories.map(cat =>
        cat.id === category.id
          ? {
              ...cat,
              isActive: !cat.isActive,
              updatedAt: new Date().toISOString()
            }
          : cat
      )

      // Mettre à jour le salon
      return editDocument('salons', salonId, {
        serviceCategories: updatedCategories,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const updatedCategories = categories.filter(category => category.id !== categoryId)

      return editDocument('salons', salonId, {
        serviceCategories: updatedCategories,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon'] })
    },
  })

  return {
    categories,
    isLoading: false, // Pas de loading séparé puisque les données viennent du salon
    createCategory: createMutation.mutate,
    updateCategory: (id: string, data: Partial<IServiceCategory>) => 
      updateMutation.mutate({ id, data }),
    toggleActive: toggleActiveMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleActiveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
  }
}