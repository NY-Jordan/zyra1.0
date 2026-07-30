import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editDocument } from '@zyra/conf/lib/query'
import { useSalon } from '../hooks/useSalon'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { logActivity, getCurrentActor } from './notificationsUseCases'

export function useServices() {
  const { salon } = useSalon()
  const queryClient = useQueryClient()
  const salonId = salon?.id
  const services = salon?.services || []

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string; price: number; duration: number; categoryId: string
      isActive?: boolean; supplements: any[]; imageUrl?: string | null
    }) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const newService: ISalonService = {
        id: crypto.randomUUID(),
        name: data.name.trim(),
        price: data.price,
        duration: data.duration,
        categoryId: data.categoryId,
        isActive: data.isActive ?? true,
        supplements: data.supplements || [],
        imageUrl: data.imageUrl || null,
      }
      const updatedServices = [...services, newService]
      await editDocument('salons', salonId, {
        services: updatedServices,
        ...(!salon.services.length && { progress: 90 }),
        updatedAt: new Date().toISOString(),
      })
      await logActivity({
        salonId,
        ...getCurrentActor(),
        type: 'service_created',
        action: 'created',
        resourceId: newService.id,
        resourceType: 'service',
        resourceLabel: newService.name,
        metadata: { prix: `${newService.price} XAF`, durée: `${newService.duration} min` },
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salon'] }); queryClient.invalidateQueries({ queryKey: ['activities'] }) },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ISalonService> }) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const updatedServices = services.map(s => s.id === id ? { ...s, ...data } : s)
      await editDocument('salons', salonId, { services: updatedServices, updatedAt: new Date().toISOString() })
      const service = services.find(s => s.id === id)
      await logActivity({
        salonId,
        ...getCurrentActor(),
        type: 'service_updated',
        action: 'updated',
        resourceId: id,
        resourceType: 'service',
        resourceLabel: (data.name ?? service?.name) ?? 'Service',
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salon'] }); queryClient.invalidateQueries({ queryKey: ['activities'] }) },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (service: ISalonService) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const newActive = !service.isActive
      const updatedServices = services.map(s => s.id === service.id ? { ...s, isActive: newActive } : s)
      await editDocument('salons', salonId, { services: updatedServices, updatedAt: new Date().toISOString() })
      await logActivity({
        salonId,
        ...getCurrentActor(),
        type: 'service_toggled',
        action: newActive ? 'activated' : 'deactivated',
        resourceId: service.id,
        resourceType: 'service',
        resourceLabel: service.name,
        metadata: { statut: newActive ? 'Actif' : 'Inactif' },
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salon'] }); queryClient.invalidateQueries({ queryKey: ['activities'] }) },
  })

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      const service = services.find(s => s.id === serviceId)
      const updatedServices = services.filter(s => s.id !== serviceId)
      await editDocument('salons', salonId, {
        services: updatedServices,
        ...(!updatedServices.length && { progress: 80 }),
        updatedAt: new Date().toISOString(),
      })
      await logActivity({
        salonId,
        ...getCurrentActor(),
        type: 'service_deleted',
        action: 'deleted',
        resourceId: serviceId,
        resourceType: 'service',
        resourceLabel: service?.name ?? 'Service',
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salon'] }); queryClient.invalidateQueries({ queryKey: ['activities'] }) },
  })

  return {
    services,
    isLoading: false,
    createService: createMutation.mutate,
    updateService: (id: string, data: Partial<ISalonService>) => updateMutation.mutate({ id, data }),
    toggleActive: toggleActiveMutation.mutate,
    deleteService: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleActiveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
  }
}
