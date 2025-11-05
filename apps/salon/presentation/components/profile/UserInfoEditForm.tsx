'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { User, Mail, Phone, Save } from 'lucide-react'
import { toast } from 'sonner'
import { editDocument } from '@zyra/conf/lib/query'
import { IOwner } from '@zyra/conf/domain/entities/owners.entities'

interface ProfileFormData {
  name: string
  email: string
  phone?: string
}

interface UserInfoEditFormProps {
  owner: IOwner
  onSuccess: () => void
  onCancel: () => void
}

export default function UserInfoEditForm({ owner, onSuccess, onCancel }: UserInfoEditFormProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: owner?.name || '',
      email: owner?.email || '',
      phone: owner?.phone || ''
    }
  })

  // Mettre à jour les valeurs par défaut quand owner change
  useEffect(() => {
    if (owner) {
      reset({
        name: owner.name || '',
        email: owner.email || '',
        phone: owner.phone || ''
      })
    }
  }, [owner, reset])

  const onSubmit = async (data: ProfileFormData) => {
    if (!owner?.id) {
      toast.error('Impossible de mettre à jour le profil')
      return
    }

    setIsUpdating(true)
    try {
      await editDocument('owners', owner.id, {
        name: data.name,
        email: data.email,
        phone: data.phone
      })

      toast.success('Profil mis à jour avec succès')
      onSuccess()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier les informations</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  {...register('name', {
                    required: 'Le nom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le nom doit contenir au moins 2 caractères'
                    }
                  })}
                  placeholder="Entrez votre nom complet"
                  className="pl-10"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  placeholder="votre@email.com"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone', {
                    pattern: {
                      value: /^[+]?[(]?[\d\s\-\(\)]{8,}$/,
                      message: 'Numéro de téléphone invalide'
                    }
                  })}
                  placeholder="+33 6 12 34 56 78"
                  className="pl-10"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}