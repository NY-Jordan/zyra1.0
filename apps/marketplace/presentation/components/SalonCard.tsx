'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { MapPin, Star, Clock } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import Image from 'next/image'

interface SalonCardProps {
  salon: ISalon
  onClick?: (salon: ISalon) => void
}

export default function SalonCard({ salon, onClick }: SalonCardProps) {
  // Récupérer la première photo
  const firstPhoto = salon.photos && salon.photos.length > 0 
    ? (typeof salon.photos[0] === 'string' ? salon.photos[0] : '/placeholder-salon.jpg')
    : '/placeholder-salon.jpg'

  // Calculer le nombre de services
  const servicesCount = salon.services?.length || 0
    console.log(firstPhoto);
  // Simuler une note (à remplacer par de vraies données plus tard)
  const rating = 4.5

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border hover:border-blue-200 bg-white"
      onClick={() => onClick?.(salon)}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={firstPhoto}
          alt={salon.name}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {/* Badge catégorie */}
        {salon.category && (
          <Badge 
            className="absolute top-3 right-3 bg-white/95 text-gray-800 backdrop-blur-sm border-0 shadow"
          >
            {salon.category}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Nom et Note */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg truncate text-gray-900 group-hover:text-blue-600 transition-colors">
            {salon.name}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm text-gray-900">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">
              ({salon.reservationsCount || 0} avis)
            </span>
          </div>
        </div>

        {/* Adresse */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">
            {salon.address}, {salon.city}
          </span>
        </div>

        {/* Services */}
        {servicesCount > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              {servicesCount} service{servicesCount > 1 ? 's' : ''} disponible{servicesCount > 1 ? 's' : ''}
            </p>
            {salon.services && salon.services.length > 0 && (
              <p className="text-base font-bold text-blue-600 mt-1">
                À partir de {Math.min(...salon.services.map(s => s.price)).toLocaleString()} XAF
              </p>
            )}
          </div>
        )}

        {/* Horaires (optionnel) */}
        {salon.openingHours && salon.openingHours.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {salon.openingHours[0]?.open || '09:00'} - {salon.openingHours[0]?.close || '18:00'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
