'use client'
import React, { useEffect } from 'react'
import { Input } from '@zyra/ui/components/input'
import { Button } from '@zyra/ui/components/button'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { where } from 'firebase/firestore'
import { editDocument, fetchCollection } from '@zyra/conf/lib/query'
import { ConfigTypeEnum } from '@zyra/conf/domain/enums/ConfigTypeEnum'
import { toast } from 'sonner'
import { SalonConfigForm } from '@zyra/conf/domain/entities/settings.entities'
import { SALON_CONFIG_DEFAULTS } from '@zyra/conf/lib/config'




export default function SalonConfigs() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['salon-configs'],
    queryFn: async () => fetchCollection('settings', [where('type', '==', ConfigTypeEnum.salon)]),
  })

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async (values: SalonConfigForm) => {
      if (!data || data.length === 0) throw new Error('No config document found')
      return editDocument('settings', data[0].id, values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-configs'] })
      toast.success('Salon config saved!')
    },
  })

  const { handleSubmit, reset, control } = useForm<SalonConfigForm>({
    defaultValues: SALON_CONFIG_DEFAULTS,
  })

  useEffect(() => {
    if (data && data.length > 0) {
      reset({ ...SALON_CONFIG_DEFAULTS, ...data[0] })
    } else {
      reset(SALON_CONFIG_DEFAULTS)
    }
  }, [data, reset])

  const onSubmit = (values: SalonConfigForm) => {
    save(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded shadow p-6 space-y-6">
      <div className="flex items-center gap-2">
        <h2 className='font-bold text-2xl'>Gestion des salons</h2>
      </div>
      <div>
        <label className="block font-medium mb-1">Nombre maximum de salons</label>
        <Controller
          name="maxSalons"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              min={1}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <div className="text-xs text-gray-500 mt-1">
          Limite du nombre de salons pouvant être créés sur la plateforme.
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Statut par défaut d'un salon</label>
        <Controller
          name="defaultSalonStatus"
          control={control}
          render={({ field }) => (
            <select
              className="border rounded px-3 py-2 w-full"
              {...field}
              value={field.value ?? 'actif'}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="en_attente">En attente</option>
            </select>
          )}
        />
        <div className="text-xs text-gray-500 mt-1">
          Statut appliqué lors de la création d'un nouveau salon.
        </div>
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={saving || isLoading}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
