'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchSubCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IHairDresser, HairDresserSalonAssociation, hairDresserAssociationNameEnum } from '@zyra/conf/domain/entities/hairdressers.entities'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { Button } from '@zyra/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, TrendingUp, CheckCircle, Clock, Inbox } from 'lucide-react'
import PageHeader from '@/presentation/components/common/PageHeader'
import { Separator } from '@zyra/ui/components/separator'
import HairDresserInvitationsModal from '@/presentation/components/hairdressers/HairDresserInvitationsModal'

interface SalonAssociationWithDetails extends HairDresserSalonAssociation {
  salon: ISalon
}

export default function HairDresserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const hairDresserId = params.id as string
  const [invitationsModalOpen, setInvitationsModalOpen] = useState(false)

  // Fetch hairdresser details
  const { data: hairDresser, isLoading: loadingHairDresser } = useQuery<IHairDresser>({
    queryKey: ['hair-dresser', hairDresserId],
    queryFn: async () => {
      const result = await fetchCollection('hair_dressers', [
        where('id', '==', hairDresserId)
      ])
      return result[0] as IHairDresser
    },
    enabled: !!hairDresserId
  })

  // Fetch salon associations
  const { data: associations = [], isLoading: loadingAssociations } = useQuery<SalonAssociationWithDetails[]>({
    queryKey: ['hair-dresser-associations', hairDresserId],
    queryFn: async () => {
      // Get all associations for this hairdresser
      const associations = await fetchSubCollection(
        'hair_dressers',
        hairDresserId,
        hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
        []
      ) as HairDresserSalonAssociation[]

      if (!associations || associations.length === 0) return []

      // Fetch salon details for each association
      const salonIds = associations.map(a => a.salonId)
      const salons = await fetchCollection('salons', [
        where('id', 'in', salonIds)
      ]) as ISalon[]

      // Combine associations with salon details
      return associations.map(assoc => ({
        ...assoc,
        salon: salons.find(s => s.id === assoc.salonId)!
      })).filter(a => a.salon) // Filter out associations without salon data
    },
    enabled: !!hairDresserId
  })

  // Fetch country name
  const { data: country } = useQuery({
    queryKey: ['country', hairDresser?.country],
    queryFn: async () => {
      if (!hairDresser?.country) return null
      const result = await fetchCollection('countries', [
        where('id', '==', hairDresser.country)
      ])
      return result[0]
    },
    enabled: !!hairDresser?.country
  })

  const isLoading = loadingHairDresser || loadingAssociations

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!hairDresser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Coiffeur non trouvé</p>
          <Button onClick={() => router.push('/admin/hair-dressers')} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </div>
    )
  }

  const activeAssociations = associations.filter(a => a.active)
  const inactiveAssociations = associations.filter(a => !a.active)

  return (
    <>
      <PageHeader
        title="Détails du coiffeur"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Coiffeurs", href: "/admin/hair-dressers" },
          { label: hairDresser.name, isCurrent: true }
        ]}
      />

      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="outline"
          onClick={() => router.push('/admin/hair-dressers')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Button>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setInvitationsModalOpen(true)}
            className="gap-2"
          >
            <Inbox className="h-4 w-4" />
            Invitations
          </Button>
        </div>

        {/* Header Card - Info personnelles */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={hairDresser.photo || '/assets/avatar.jpg'} alt={hairDresser.name} />
                <AvatarFallback>{hairDresser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{hairDresser.name}</h1>
                    <p className="text-gray-600 text-lg">{hairDresser.speciality}</p>
                  </div>
                  <Badge variant={hairDresser.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                    {hairDresser.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{hairDresser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{hairDresser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{hairDresser.city}, {country?.name || hairDresser.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Membre depuis {new Date(hairDresser.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salons associés</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{associations.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeAssociations.length} actif{activeAssociations.length > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réservations prises</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hairDresser.reservationsTaken || 0}</div>
              <p className="text-xs text-muted-foreground">Total toutes périodes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réservations confirmées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hairDresser.reservationsConfirmed || 0}</div>
              <p className="text-xs text-muted-foreground">
                {hairDresser.reservationsTaken > 0 
                  ? `${Math.round((hairDresser.reservationsConfirmed / hairDresser.reservationsTaken) * 100)}% du total`
                  : 'Aucune réservation'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réservations réalisées</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hairDresser.reservationsDone || 0}</div>
              <p className="text-xs text-muted-foreground">
                {hairDresser.reservationsConfirmed > 0
                  ? `${Math.round((hairDresser.reservationsDone / hairDresser.reservationsConfirmed) * 100)}% des confirmées`
                  : 'Aucune réservation'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Salons associés actifs */}
        {activeAssociations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Salons actifs ({activeAssociations.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAssociations.map((assoc) => (
                <Card key={assoc.salonId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{assoc.salon.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {assoc.salon.city}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-500">Actif</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Statut du salon</p>
                        <Badge variant={assoc.salon.status?.name === 'active' ? 'default' : 'secondary'}>
                          {assoc.salon.status?.name || 'N/A'}
                        </Badge>
                      </div>
                      
                      {assoc.salonServiceIds && assoc.salonServiceIds.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Services assignés</p>
                          <p className="text-sm font-medium">{assoc.salonServiceIds.length} service{assoc.salonServiceIds.length > 1 ? 's' : ''}</p>
                        </div>
                      )}

                      <Separator />

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Prises</p>
                          <p className="text-sm font-bold">-</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Confirmées</p>
                          <p className="text-sm font-bold">-</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Réalisées</p>
                          <p className="text-sm font-bold">-</p>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push(`/admin/salons/details/${assoc.salon.id}`)}
                      >
                        Voir le salon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Salons associés inactifs */}
        {inactiveAssociations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Salons inactifs ({inactiveAssociations.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveAssociations.map((assoc) => (
                <Card key={assoc.salonId} className="opacity-75 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{assoc.salon.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {assoc.salon.city}
                        </p>
                      </div>
                      <Badge variant="secondary">Inactif</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Statut du salon</p>
                        <Badge variant={assoc.salon.status?.name === 'active' ? 'default' : 'secondary'}>
                          {assoc.salon.status?.name || 'N/A'}
                        </Badge>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push(`/admin/salons/details/${assoc.salon.id}`)}
                      >
                        Voir le salon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No associations message */}
        {associations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Ce coiffeur n'est associé à aucun salon pour le moment.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invitations Modal */}
      <HairDresserInvitationsModal
        open={invitationsModalOpen}
        onOpenChange={setInvitationsModalOpen}
        hairDresserId={hairDresserId}
      />
    </>
  )
}
