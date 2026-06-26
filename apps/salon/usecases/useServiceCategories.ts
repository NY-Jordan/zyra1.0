import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editDocument } from '@zyra/conf/lib/query'
import { useSalon } from '@/hooks/useSalon'
import { IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'
import { logActivity, getCurrentActor } from '@/usecases/notificationsUseCases'

export function useServiceCategories() {
  const { salon } = useSalon()
  const queryClient = useQueryClient()
  const salonId = salon?.id
  const categories = salon?.serviceCategories || []

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; isActive?: boolean }) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const newCategory: IServiceCategory = {
        id: crypto.randomUUID(),
        name: data.name.trim(),
        description: data.description?.trim() || '',
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await editDocument('salons', salonId, {
        serviceCategories: [...categories, newCategory],
        updatedAt: new Date().toISOString(),
      })
      await logActivity({
        salonId,
        ...getCurrentActor(),
        type: 'category_created',
        action: 'created',
        resourceId: newCategory.id,
        resourceType: 'category',
        resourceLabel: newCategory.name,
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salon'] }); queryClient.invalidateQueries({ queryKey: ['activities'] }) },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IServiceCategory> }) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const updatedCategories = categories.map(c =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      )
      await editDocument('salons', salonId, { serviceCategories: updatedCategories, updatedAt: new Date().toISOString() })
      const cat = categories.find(c => c.id === id)
      await logActivity({
        salonId,
        ...getCurrentActor(),
        type: 'category_updated',
        action: 'updated',
        resourceId: id,
        resourceType: 'category',
        resourceLabel: (data.name ?? cat?.name) ?? 'Catégorie',
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salon'] }); queryClient.invalidateQueries({ queryKey: ['activities'] }) },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (category: IServiceCategory) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const newActive = !category.isActive
      const updatedCategories = categories.map(c =>
        c.id === category.id ? { ...c, isActive: newActive, updatedAt: new Date().toISOString() } : c
      )
      await editDocument('salons', salonId, { serviceCategories: updatedCategories, updatedAt: new Date().toISOString() })
      await logActivity({
        salonId,
        ...getCurrentActor(),
        type: 'category_toggled',
        action: newActive ? 'activated' : 'deactivated',
        resourceId: category.id,
        resourceType: 'category',
        resourceLabel: category.name,
        metadata: { statut: newActive ? 'Active' : 'Inactive' },
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salon'] }); queryClient.invalidateQueries({ queryKey: ['activities'] }) },
  })

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const cat = categories.find(c => c.id === categoryId)
      const updatedCategories = categories.filter(c => c.id !== categoryId)
      await editDocument('salons', salonId, { serviceCategories: updatedCategories, updatedAt: new Date().toISOString() })
      await logActivity({
        salonId,
        ...getCurrentActor(),
        type: 'category_deleted',
        action: 'deleted',
        resourceId: categoryId,
        resourceType: 'category',
        resourceLabel: cat?.name ?? 'Catégorie',
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salon'] }); queryClient.invalidateQueries({ queryKey: ['activities'] }) },
  })

  return {
    categories,
    isLoading: false,
    createCategory: createMutation.mutate,
    updateCategory: (id: string, data: Partial<IServiceCategory>) => updateMutation.mutate({ id, data }),
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
