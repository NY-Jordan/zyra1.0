'use client'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { editDocument, fetchCollection } from '@zyra/conf/lib/query'
import { GeneralConfigForm } from '@zyra/conf/domain/entities/settings.entities'
import { GENERAL_CONFIG_DEFAULTS } from '@zyra/conf/lib/config'
import { where } from 'firebase/firestore'
import { toast } from 'sonner'
import { ConfigTypeEnum } from '@zyra/conf/domain/enums/ConfigTypeEnum'

export default function GeneralConfigs() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['general-configs'],
    queryFn: async () => fetchCollection('settings', [where('type', '==', ConfigTypeEnum.general)]),
  })

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async (values: GeneralConfigForm) => {
      if (!data || data.length === 0) throw new Error('No config document found')
      return editDocument('settings', data[0].id, values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-configs'] })
      toast.success('General config saved !!')
    },
  })

  const { register, handleSubmit, reset, control } = useForm<GeneralConfigForm>({
    defaultValues: GENERAL_CONFIG_DEFAULTS,
  })

  useEffect(() => {
    if (data && data.length > 0) {
        const values  = {...data[0] };
        reset(values)
    }
    else reset(GENERAL_CONFIG_DEFAULTS)
  }, [data, reset])

  const onSubmit = (values: GeneralConfigForm) => {
    save(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded shadow p-6 space-y-6">
      <div><h2 className='font-bold text-2xl'>Configuration Globale</h2></div>
      <div>
        <label className="block font-medium mb-1">Commission sur les réservations (%)</label>
        <Controller
          name="commission"
          control={control}
          rules={{ min: 0, max: 100 }}
          render={({ field }) => (
            <Input
              type="number"
              min={0}
              max={100}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <div className="text-xs text-gray-500 mt-1">
          Pourcentage que la plateforme prélève à chaque réservation. Exemple : 10%
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Devise par défaut</label>
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Ex: XAF"
              value={field.value ?? ''}
            />
          )}
        />
        <div className="text-xs text-gray-500 mt-1">
          Monnaie utilisée dans toute l'app. Exemple : XAF
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Fuseau horaire</label>
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Ex: Africa/Douala"
              value={field.value ?? ''}
            />
          )}
        />
        <div className="text-xs text-gray-500 mt-1">
          Pour afficher les heures de façon cohérente. Exemple : Africa/Douala
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Durée minimale d’une réservation</label>
        <div className="flex gap-2 items-center">
          <Controller
            name="minBookingDuration"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value ?? ''}
                className="w-full"
              />
            )}
          />
          <Controller
            name="minBookingDurationUnit"
            control={control}
            render={({ field }) => (
              <select {...field} className="border rounded px-2 py-1">
                <option value="min">min</option>
                <option value="h">h</option>
              </select>
            )}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Exemple : 30 min ou 1 h
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Délai minimum pour réserver à l’avance</label>
        <div className="flex gap-2 items-center">
          <Controller
            name="minAdvanceBookingTime"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                {...field}
                value={field.value ?? ''}
                className="w-full"
              />
            )}
          />
          <Controller
            name="minAdvanceBookingTimeUnit"
            control={control}
            render={({ field }) => (
              <select {...field} className="border rounded px-2 py-1">
                <option value="min">min</option>
                <option value="h">h</option>
              </select>
            )}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Exemple : 2 h ou 30 min
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
