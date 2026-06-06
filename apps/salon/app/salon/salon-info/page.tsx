'use client'

import React, { useState } from 'react'
import { Card, CardHeader } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zyra/ui/components/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import PageHeader from '@/presentation/components/common/PageHeader'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import { useSalon } from '@/hooks/useSalon'
import {
  Store,
  MapPin,
  Phone,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { editDocument } from '@zyra/conf/lib/query'
import { ISalon, OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import SalonLocationForm from '@/presentation/components/SalonLocationForm'
import SalonGeneralInfo from '@/presentation/components/settings/SalonGeneralInfo'
import SalonOpeningHours from '@/presentation/components/settings/SalonOpeningHours'
import SalonLocation from '@/presentation/components/settings/SalonLocation'
import SalonGallery from '@/presentation/components/settings/SalonGallery'


interface SalonFormData {
  name: string
  description: string
  phone: string
  email: string
  category: string
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
]

export default function SalonInfoPage() {
  const { salon, isLoading, refetch } = useSalon()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingHours, setIsEditingHours] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SalonFormData>()

  React.useEffect(() => {
    if (salon) {
      reset({
        name: salon.name || '',
        description: salon.description || '',
        phone: salon.phone || '',
        email: salon.email || '',
        category: salon.category || ''
      })
      setOpeningHours(salon.openingHours || [])
    }
  }, [salon, reset])

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600'
    if (progress >= 60) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (!salon) {
    return (
      <ProtectedLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-muted-foreground">Aucun salon trouvé</div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Informations du salon"
          breadcrumbs={[
            { label: 'Dashboard', href: '/salon' },
            { label: 'Informations du salon', isCurrent: true }
          ]}
        />

        <div className="space-y-6">
          {/* En-tête avec photo et infos principales */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={Array.isArray(salon.photos) && salon.photos[0] ? salon.photos[0] : '/salon-placeholder.png'}
                      alt={salon.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg">
                      <Store className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{salon.name}</h1>
                    <Badge variant="outline" className="text-xs">
                      {salon.category || 'Non définie'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {salon.address}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {salon.phone}
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Configuration du salon</span>
                      <span className="font-medium">{salon.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getProgressColor(salon.progress || 0)}`}
                        style={{ width: `${salon.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="text-lg font-bold">{salon.services?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{salon.reservationsCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Réservations</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs pour les différentes sections */}
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="hours">Horaires</TabsTrigger>
              <TabsTrigger value="location">Localisation</TabsTrigger>
              <TabsTrigger value="gallery">Galerie</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <SalonGeneralInfo salon={salon} onUpdate={refetch} />
            </TabsContent>

            <TabsContent value="hours">
              <SalonOpeningHours salon={salon} onUpdate={refetch} />
            </TabsContent>

            <TabsContent value="location">
              <SalonLocation salon={salon} onUpdate={refetch} />
            </TabsContent>

            <TabsContent value="gallery">
              <SalonGallery salon={salon} onUpdate={refetch} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedLayout>
  )
}