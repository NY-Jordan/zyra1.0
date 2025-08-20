import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, createDocument, editDocument, deleteDocument } from '@zyra/conf/lib/query'

export type Country = {
  id: string
  name: string
  currency: string
  active: boolean
}

export function useCountries() {
  const queryClient = useQueryClient()

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries')
      return res.map((c: any) => ({
        id: c.id,
        name: c.name,
        currency: c.currency || 'XAF',
        active: c.active ?? true,
      }))
    },
  })

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; currency: string; active: boolean }) => 
      createDocument('countries', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async (country: Country) => editDocument('countries', country.id, { active: !country.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteDocument('countries', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Country> }) =>
      editDocument('countries', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
    },
  })

  return {
    countries,
    isLoading,
    addCountry: addMutation.mutate,
    toggleCountry: toggleMutation.mutate,
    deleteCountry: deleteMutation.mutate,
    updateCountry: (id: string, data: Partial<Country>) => updateMutation.mutate({ id, data }),
    addPending: addMutation.isPending,
    togglePending: toggleMutation.isPending,
    deletePending: deleteMutation.isPending,
    updatePending: updateMutation.isPending,
  }
}