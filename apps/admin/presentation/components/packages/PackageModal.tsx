'use client'
import React, { useEffect } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Check } from 'lucide-react'
import { usePackagesUseCases } from '../../../usecases/packagesUseCases'
import { useFeaturesUseCases } from '../../../usecases/featuresUseCases'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@zyra/ui/components/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@zyra/ui/components/dialog'
import { useForm, Controller } from 'react-hook-form'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { UserTypeEnum } from '@zyra/conf/domain/enums/UserTypeEnum'
import { FeatureDisplayData } from '@zyra/conf/domain/entities/features.entities'

interface PackageModalProps {
  isOpen: boolean
  onClose: () => void
  package?: PackageData | null
  countries: any[]
}

type FormData = {
  name: string
  price: number
  currency: string
  countryId: string
  features: string[] // Array des clés des features sélectionnées
  duration: number
  active: boolean
  popular: boolean
  type: 'salon' | 'client'
}

export default function PackageModal({ isOpen, onClose, package: editPackage, countries }: PackageModalProps) {
  const { 
    useCreatePackage, 
    useUpdatePackage
  } = usePackagesUseCases()

  const { useFeatures } = useFeaturesUseCases()

  const createMutation = useCreatePackage()
  const updateMutation = useUpdatePackage()

  // Récupérer toutes les features disponibles
  const { data: featuresResult } = useFeatures({
    page: 1,
    pageSize: 100, // Récupérer toutes les features
    language: 'fr'
  })

  const availableFeatures = (featuresResult?.data || []) as FeatureDisplayData[]

  const { control, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<FormData>({
    defaultValues: {
      name: '',
      price: 0,
      currency: '',
      countryId: '',
      features: [],
      duration: 30,
      active: true,
      popular: false,
      type: UserTypeEnum.SALON
    }
  })

  const watchedFeatures = watch('features')
  const watchedCountryId = watch('countryId')

  // Auto-update currency when country changes
  useEffect(() => {
    if (watchedCountryId && countries.length > 0) {
      const selectedCountry = countries.find(country => country.id === watchedCountryId)
      if (selectedCountry && selectedCountry.currency) {
        const currentValues = watch()
        reset({
          ...currentValues,
          currency: selectedCountry.currency
        })
      }
    }
  }, [watchedCountryId, countries, watch, reset])

  useEffect(() => {
    if (editPackage) {
      reset({
        name: editPackage.name,
        price: editPackage.price,
        currency: editPackage.currency,
        countryId: editPackage.countryId,
        features: editPackage.features || [], // Features sélectionnées comme array de clés
        duration: editPackage.duration,
        active: editPackage.active,
        type: editPackage.type === UserTypeEnum.SALON? UserTypeEnum.SALON : UserTypeEnum.CLIENT
      })
    } else {
      reset({
        name: '',
        price: 0,
        currency: '',
        countryId: '',
        features: [], // Array vide
        duration: 30,
        active: true,
        popular: false,
        type: UserTypeEnum.SALON
      })
    }
  }, [editPackage, isOpen, reset])

  const onSubmit = (data: FormData) => {
    if (data.features.length === 0) {
      toast.error('Au moins une fonctionnalité est requise')
      return
    }

    const dataToSubmit = {
      ...data,
      popular :false,
      type: data.type === UserTypeEnum.SALON  ? UserTypeEnum.SALON : UserTypeEnum.CLIENT
    }

    if (editPackage && editPackage.id) {
      updateMutation.mutate(
        { id: editPackage.id, data: dataToSubmit },
        {
          onSuccess: () => onClose()
        }
      )
    } else {
      createMutation.mutate(
        dataToSubmit,
        {
          onSuccess: () => onClose()
        }
      )
    }
  }

  // Fonction pour gérer la sélection/désélection d'une feature
  const toggleFeature = (featureKey: string) => {
    const currentFeatures = watchedFeatures || []
    const isSelected = currentFeatures.includes(featureKey)
    if (isSelected) {
      setValue('features', currentFeatures.filter(key => key !== featureKey))
    } else {
      setValue('features', [...currentFeatures, featureKey])
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editPackage ? 'Modifier le forfait' : 'Nouveau forfait'}
          </DialogTitle>
        </DialogHeader>

        <form id="package-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom du forfait *
            </label>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Le nom est requis' }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ex: Forfait Premium"
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Type *
            </label>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Le type est requis' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salon">Salon</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Pays */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Pays *
            </label>
            <Controller
              name="countryId"
              control={control}
              rules={{ required: 'Le pays est requis' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country: any) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name} ({country.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.countryId && (
              <p className="text-sm text-red-600 mt-1">{errors.countryId.message}</p>
            )}
          </div>

          {/* Prix et Devise */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Prix *
              </label>
              <Controller
                name="price"
                control={control}
                rules={{ 
                  required: 'Le prix est requis',
                  min: { value: 1, message: 'Le prix doit être supérieur à 0' }
                }}
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="0"
                    min="1"
                  />
                )}
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Devise (automatique)
              </label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center h-10 px-3 py-2 border border-gray-200 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-600">
                      {field.value || 'Sélectionner un pays d\'abord'}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Durée (jours) *
            </label>
            <Controller
              name="duration"
              control={control}
              rules={{ 
                required: 'La durée est requise',
                min: { value: 1, message: 'La durée doit être supérieure à 0' }
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="30"
                  min="1"
                />
              )}
            />
            {errors.duration && (
              <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
            )}
          </div>

          {/* Fonctionnalités */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Fonctionnalités *
            </label>
            <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
              {availableFeatures?.map((feature: FeatureDisplayData) => (
                <div key={feature.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={feature.key}
                    checked={watchedFeatures.includes(feature.key)}
                    onChange={() => toggleFeature(feature.key)}
                    className="rounded"
                  />
                  <label htmlFor={feature.key} className="flex-1 cursor-pointer">
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-gray-600">{feature.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Type: {feature.type}
                      {feature.defaultValue && ` • Valeur par défaut: ${feature.defaultValue}`}
                    </div>
                  </label>
                </div>
              ))}
              {availableFeatures?.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucune fonctionnalité disponible
                </p>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center gap-2">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="active"
                  checked={field.value}
                  onChange={field.onChange}
                  className="rounded"
                />
              )}
            />
            <label htmlFor="active" className="text-sm font-medium">
              Actif
            </label>
          </div>

          {/* Actions */}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="package-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editPackage ? 'Modifier' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
