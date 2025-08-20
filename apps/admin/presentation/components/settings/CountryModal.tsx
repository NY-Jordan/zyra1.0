'use client'
import React, { useEffect } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@zyra/ui/components/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@zyra/ui/components/dialog'
import { useForm, Controller } from 'react-hook-form'

export type CountryData = {
  id?: string
  name: string
  currency: string
  active: boolean
}

interface CountryModalProps {
  isOpen: boolean
  onClose: () => void
  country?: CountryData | null
  onSubmit: (data: Omit<CountryData, 'id'>) => void
  loading?: boolean
}

type FormData = {
  name: string
  currency: string
  active: boolean
}

const currencies = [
  { code: 'XAF', name: 'Franc CFA' },
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'Dollar américain' },
  { code: 'GBP', name: 'Livre sterling' },
  { code: 'CAD', name: 'Dollar canadien' },
  { code: 'CHF', name: 'Franc suisse' },
  { code: 'JPY', name: 'Yen japonais' },
  { code: 'AUD', name: 'Dollar australien' },
  { code: 'CNY', name: 'Yuan chinois' },
  { code: 'INR', name: 'Roupie indienne' },
  { code: 'BRL', name: 'Real brésilien' },
  { code: 'ZAR', name: 'Rand sud-africain' },
  { code: 'NGN', name: 'Naira nigérian' },
  { code: 'KES', name: 'Shilling kenyan' },
  { code: 'GHS', name: 'Cedi ghanéen' },
  { code: 'MAD', name: 'Dirham marocain' },
  { code: 'TND', name: 'Dinar tunisien' },
  { code: 'EGP', name: 'Livre égyptienne' },
]

export default function CountryModal({ isOpen, onClose, country, onSubmit, loading = false }: CountryModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      currency: 'XAF',
      active: true
    }
  })

  useEffect(() => {
    if (country) {
      reset({
        name: country.name,
        currency: country.currency,
        active: country.active
      })
    } else {
      reset({
        name: '',
        currency: 'XAF',
        active: true
      })
    }
  }, [country, isOpen, reset])

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {country ? 'Modifier le pays' : 'Nouveau pays'}
          </DialogTitle>
        </DialogHeader>

        <form id="country-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nom du pays */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom du pays *
            </label>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Le nom du pays est requis' }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ex: Cameroun"
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Devise */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Devise *
            </label>
            <Controller
              name="currency"
              control={control}
              rules={{ required: 'La devise est requise' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.currency && (
              <p className="text-sm text-red-600 mt-1">{errors.currency.message}</p>
            )}
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
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="country-form"
            disabled={loading}
          >
            {loading ? '...' : (country ? 'Modifier' : 'Créer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
