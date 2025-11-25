'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@zyra/ui/components/input'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import {
  Search,
  User,
  MapPin,
  Mail,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { fetchCollection } from '@zyra/conf/lib/query'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { where } from 'firebase/firestore'
import useSalon from '@/hooks/useSalon'

interface SearchHairDresserFormProps {
  searchTerm: string
  onSearchTermChange: (term: string) => void
  selectedHairDresser: IHairDresser | null
  onSelectHairDresser: (hairDresser: IHairDresser) => void
}

export default function SearchHairDresserForm({
  searchTerm,
  onSearchTermChange,
  selectedHairDresser,
  onSelectHairDresser
}: SearchHairDresserFormProps) {
  const { salon } = useSalon();
  
  // Récupérer les invitations en attente pour ce salon
  const { data: pendingInvitations = [] } = useQuery({
    queryKey: ['pending-invitations', salon?.id],
    queryFn: async (): Promise<string[]> => {
      if (!salon?.id) return []
      const invitations = await fetchCollection('hair_dresser_invitations', [
        where('salonId', '==', salon.id),
        where('status', '==', 'pending')
      ])
      return invitations.map((inv: any) => inv.hairDresserId)
    },
    enabled: !!salon?.id
  })


  // Recherche des coiffeurs dans toute la plateforme
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['search-hairdressers', searchTerm, pendingInvitations],
    queryFn: async (): Promise<IHairDresser[]> => {
      // Recherche par nom (utilise where pour filtrer côté serveur)
      const nameResults = await fetchCollection('hair_dressers', [
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
      ]) as IHairDresser[]
      // Recherche par email
      const emailResults = await fetchCollection('hair_dressers', [
        where('email', '>=', searchTerm.toLowerCase()),
        where('email', '<=', searchTerm.toLowerCase() + '\uf8ff')
      ]) as IHairDresser[]
      // Recherche par spécialité
      const specialityResults = await fetchCollection('hair_dressers', [
        where('speciality', '>=', searchTerm),
        where('speciality', '<=', searchTerm + '\uf8ff')
      ]) as IHairDresser[]
      // Combiner les résultats et éliminer les doublons
      const allResults = [...nameResults, ...emailResults, ...specialityResults]
      const uniqueResults = allResults.filter((hd, index, self) =>
        self.findIndex(h => h.id === hd.id) === index
      )
      console.log(uniqueResults);
      // Retourner tous les coiffeurs (filtrage uniquement pour ceux déjà associés)
      return uniqueResults.filter(hd => {
        return hd.salonIds ? !hd.salonIds.some(salonAssociation => salonAssociation.salonId === salon?.id) : true;
      })
    },
    enabled: !!searchTerm && searchTerm.length >= 2
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email ou spécialité..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {searchLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {searchResults.map((hairDresser: IHairDresser) => {
            const hasInvitation = pendingInvitations.includes(hairDresser.id)
            const isDisabled = hasInvitation
            return (
              <Card
                key={hairDresser.id}
                className={`transition-all ${
                  isDisabled 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                    : `cursor-pointer hover:shadow-md ${
                        selectedHairDresser?.id === hairDresser.id
                          ? 'ring-2 ring-primary border-primary'
                          : ''
                      }`
                }`}
                onClick={() => !isDisabled && onSelectHairDresser(hairDresser)}
              >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={hairDresser.photo} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{hairDresser.name}</h3>
                      {hasInvitation && (
                        <Badge variant="secondary" className="text-xs">
                          Invitation en attente
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{hairDresser.speciality}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {hairDresser.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hairDresser.city}
                      </span>
                    </div>
                  </div>
                  {selectedHairDresser?.id === hairDresser.id && !isDisabled && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      {searchTerm && searchTerm.length >= 2 && !searchLoading && searchResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun coiffeur trouvé pour "{searchTerm}"
        </div>
      )}

      {!searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          Tapez au moins 2 caractères pour rechercher
        </div>
      )}
    </div>
  )
}