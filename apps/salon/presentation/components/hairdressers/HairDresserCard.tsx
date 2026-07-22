'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Badge } from '@zyra/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Ban,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zyra/ui/components/dropdown-menu'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { HairDresserWithSalonAssociation } from '@/usecases/useHairDressers'
import { useHasPermission } from '@/hooks/useHasPermission'

interface HairDresserCardProps {
  hairDresser: HairDresserWithSalonAssociation
  onDeleteClick: (hairDresser: HairDresserWithSalonAssociation) => void
  onStatusClick: (hairDresser: HairDresserWithSalonAssociation) => void
  onEditClick?: (hairDresser: HairDresserWithSalonAssociation) => void
  onViewClick?: (hairDresser: HairDresserWithSalonAssociation) => void
  isToggling?: boolean
  isDeleting?: boolean
}

export default function HairDresserCard({ 
  hairDresser, 
  onDeleteClick, 
  onStatusClick,
  onEditClick,
  onViewClick,
  isToggling = false,
  isDeleting = false
}: HairDresserCardProps) {
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission('hairdressers.edit')
  const canChangeStatus = hasPermission('hairdressers.status')
  const canDelete = hasPermission('hairdressers.delete')

  const getStatusColor = (active: boolean) => {
    switch (active) {
      case true:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      case false:
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />
      case 'suspended':
        return <XCircle className="h-3 w-3" />
      default:
        return <Ban className="h-3 w-3" />
    }
  }

  // Composant pour afficher les étoiles
  const StarRating = ({ rating }: { rating: number }) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    // Étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      )
    }

    // Étoile à moitié pleine
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300 dark:text-slate-600" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    }

    // Étoiles vides
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300 dark:text-slate-600" />
      )
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }


  const handleDeleteClick = () => {
    onDeleteClick(hairDresser)
  }

  const handleStatusClick = () => {
    onStatusClick(hairDresser)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* En-tête du coiffeur */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={hairDresser.photo} alt={hairDresser.name} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{hairDresser.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{hairDresser.speciality}</p>
            {/* Note avec étoiles */}
            <div className="mb-2">
              <StarRating rating={2.5} />
            </div>
            <Badge
              className={`text-xs ${getStatusColor(hairDresser.associationHairdresser.active)}`}
            >
              {getStatusIcon(hairDresser.status)}
              <span className="ml-1">
                {hairDresser.associationHairdresser.active   === true ? 'Actif' : 'Suspendu'}
              </span>
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isToggling || isDeleting}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewClick && (
                <DropdownMenuItem onClick={() => onViewClick(hairDresser)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les détails
                </DropdownMenuItem>
              )}
              {onEditClick && canEdit && (
                <DropdownMenuItem onClick={() => onEditClick(hairDresser)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
              )}
              {canChangeStatus && (
                <DropdownMenuItem onClick={handleStatusClick}>
                  {hairDresser.associationHairdresser.active === true ? (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Suspendre
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activer
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Informations de contact */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{hairDresser.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{hairDresser.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{hairDresser.city}, {hairDresser.country}</span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{hairDresser.reservationsTaken || 0}</p>
            <p className="text-xs text-muted-foreground">Prises</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{hairDresser.reservationsConfirmed || 0}</p>
            <p className="text-xs text-muted-foreground">Confirmées</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-600">{hairDresser.reservationsDone || 0}</p>
            <p className="text-xs text-muted-foreground">Finies</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}