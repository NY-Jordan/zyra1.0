import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editDocument } from '@zyra/conf/lib/query'
import { useSalon } from '@/hooks/useSalon'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'


export function useServices() {
  const { salon } = useSalon()
  const queryClient = useQueryClient()
  const salonId = salon?.id

  // Les services viennent directement du salon
  const services = salon?.services || []

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string
      price: number
      duration: number
      categoryId: string
      isActive?: boolean
      supplements: any[]
      imageUrl?: string | null
    }) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')
      // Créer le nouveau service selon l'interface ISalonService
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

      // Ajouter au tableau existant
      const updatedServices = [...services, newService]
      if (!salon.services.length) {
        return editDocument('salons', salonId, {
          services: updatedServices,
          progress : 90,
          updatedAt: new Date().toISOString(),
        })
      }
      // Mettre à jour le salon
      return editDocument('salons', salonId, {
        services: updatedServices,
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
      data: Partial<ISalonService>
    }) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')

      // Trouver et mettre à jour le service
      const updatedServices = services.map(service =>
        service.id === id
          ? { ...service, ...data }
          : service
      )

      // Mettre à jour le salon
      return editDocument('salons', salonId, {
        services: updatedServices,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon'] })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (service: ISalonService) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')

      // Inverser le statut du service
      const updatedServices = services.map(serv =>
        serv.id === service.id
          ? { ...serv, isActive: !serv.isActive }
          : serv
      )

      // Mettre à jour le salon
      return editDocument('salons', salonId, {
        services: updatedServices,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!salon || !salonId) throw new Error('Aucun salon sélectionné')

      // Supprimer le service du tableau
      const updatedServices = services.filter(service => service.id !== serviceId)
      if (updatedServices.length === 0) {
        return editDocument('salons', salonId, {
          services: updatedServices,
          progress : 80,
          updatedAt: new Date().toISOString(),
        })
      }
      // Mettre à jour le salon
      return editDocument('salons', salonId, {
        services: updatedServices,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon'] })
    },
  })

  return {
    services,
    isLoading: false,
    createService: createMutation.mutate,
    updateService: (id: string, data: Partial<ISalonService>) =>
      updateMutation.mutate({ id, data }),
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