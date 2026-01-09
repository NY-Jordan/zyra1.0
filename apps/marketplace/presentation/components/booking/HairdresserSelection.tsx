'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Check, User, Wand2, Star, Info } from 'lucide-react'
import { Button } from '@zyra/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { IHairDresser, HairDresserSalonAssociation } from '@zyra/conf/domain/entities/hairdressers.entities'

interface HairdresserWithAssociation {
  hairdresser: IHairDresser
  association: HairDresserSalonAssociation
}

interface HairdresserSelectionProps {
  hairdressers: { hairdresser: IHairDresser; association: HairDresserSalonAssociation; }[] | undefined
  selectedHairdresser: HairDresserSalonAssociation | null
  onSelectHairdresser: (hairdresser: HairDresserSalonAssociation | null) => void
}

export default function HairdresserSelection({
  hairdressers,
  selectedHairdresser,
  onSelectHairdresser,
}: HairdresserSelectionProps) {
  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null)
  const isAnySelected = selectedHairdresser === null

  const detailsHairdresser = selectedDetailsId && hairdressers
    ? hairdressers.find(h => h.hairdresser.id === selectedDetailsId)
    : null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choisissez un coiffeur</h2>
        <p className="text-gray-600 mt-1">Sélectionnez le professionnel qui s'occupera de vous ou laissez-nous choisir</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* "Any Hairdresser" Option */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            isAnySelected ? 'ring-2 ring-blue-600 bg-blue-50' : ''
          }`}
          onClick={() => onSelectHairdresser(null)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 flex-shrink-0 flex items-center justify-center">
                  <Wand2 className="h-8 w-8 text-purple-600" />
                </div>
                {isAnySelected && (
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-white">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">N'importe quel coiffeur</h3>
                <p className="text-sm text-gray-600 mt-1">Nous choisissons le meilleur professionnel</p>

                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Flexible
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specific Hairdressers */}
        {hairdressers?.map((item, key) => {
          const isSelected = selectedHairdresser?.parentId === item.hairdresser.id
          const hairdresser = item.hairdresser

          return (
            <Card
              key={hairdresser.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-600 bg-blue-50' : ''
              }`}
              onClick={() => onSelectHairdresser(item.association)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {hairdresser.photo ? (
                        <img
                          src={hairdresser.photo}
                          alt={hairdresser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-white">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{hairdresser.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{hairdresser.speciality}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(2.5)
                              ? 'fill-yellow-400 text-yellow-400'
                              : i === Math.floor(2.5) && 2.5 % 1 !== 0
                              ? 'fill-yellow-200 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">2.5</span>
                    </div>

                    {/* Details Button */}
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDetailsId(hairdresser.id)
                        }}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Details Modal */}
      <Dialog open={!!detailsHairdresser} onOpenChange={() => setSelectedDetailsId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Détails de {detailsHairdresser?.hairdresser.name}
            </DialogTitle>
          </DialogHeader>

          {detailsHairdresser && (
            <div className="space-y-4">
              {/* Profile Photo */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                  {detailsHairdresser.hairdresser.photo ? (
                    <img
                      src={detailsHairdresser.hairdresser.photo}
                      alt={detailsHairdresser.hairdresser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-lg">{detailsHairdresser.hairdresser.name}</h3>
                <p className="text-sm text-gray-600">{detailsHairdresser.hairdresser.speciality}</p>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(2.5)
                          ? 'fill-yellow-400 text-yellow-400'
                          : i === Math.floor(2.5) && 2.5 % 1 !== 0
                          ? 'fill-yellow-200 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">2.5</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t pt-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-medium">{detailsHairdresser.hairdresser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="text-sm font-medium">{detailsHairdresser.hairdresser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Localisation</p>
                  <p className="text-sm font-medium">
                    {detailsHairdresser.hairdresser.city}, {detailsHairdresser.hairdresser.country}
                  </p>
                </div>
              </div>

              
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
