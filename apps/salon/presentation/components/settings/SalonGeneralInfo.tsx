'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Textarea } from '@zyra/ui/components/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Edit, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { editDocument } from '@zyra/conf/lib/query'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { logActivity, getCurrentActor } from '@zyra/core/usecases/notificationsUseCases'
import { useHasPermission } from '@/hooks/useHasPermission'

interface SalonFormData {
  name: string
  description: string
  phone: string
  email: string
  category: string
}

interface SalonGeneralInfoProps {
  salon: ISalon
  onUpdate: () => void
}

export default function SalonGeneralInfo({ salon, onUpdate }: SalonGeneralInfoProps) {
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission('settings.general')
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SalonFormData>({
    defaultValues: {
      name: salon.name || '',
      description: salon.description || '',
      phone: salon.phone || '',
      email: salon.email || '',
      category: salon.category || ''
    }
  })

  React.useEffect(() => {
    reset({
      name: salon.name || '',
      description: salon.description || '',
      phone: salon.phone || '',
      email: salon.email || '',
      category: salon.category || ''
    })
  }, [salon, reset])

  const onSubmit = async (data: SalonFormData) => {
    if (!salon?.id) return

    try {
      await editDocument('salons', salon.id, {
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        category: data.category
      })

      await logActivity({
        salonId: salon.id,
        ...getCurrentActor(),
        type: 'salon_info_updated',
        action: 'updated',
        resourceId: salon.id,
        resourceType: 'salon',
        resourceLabel: data.name,
      })
      toast.success('Informations mises à jour avec succès')
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Informations générales</CardTitle>
          {!isEditing ? (
            canEdit && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSubmit(onSubmit)}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom du salon</label>
                <Input
                  {...register('name', { required: 'Le nom est requis' })}
                  placeholder="Nom de votre salon"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Input
                  {...register('category')}
                  placeholder="Ex: Salon de coiffure, Barbier..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  {...register('phone', { required: 'Le téléphone est requis' })}
                  placeholder="+33 6 12 34 56 78"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="contact@monsalon.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Décrivez votre salon, vos spécialités..."
                rows={4}
              />
            </div>
          </form>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom du salon</p>
                <p className="font-medium">{salon.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Catégorie</p>
                <p className="font-medium">{salon.category || 'Non définie'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{salon.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{salon.email || 'Non renseigné'}</p>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{salon.description || 'Aucune description'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}