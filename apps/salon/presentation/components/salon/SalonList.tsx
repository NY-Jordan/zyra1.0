'use client'
import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { Building2, MapPin, CheckCircle, AlertCircle, Plus } from 'lucide-react'

interface SalonListProps {
  salons: ISalon[]
  selectedSalonId: string | null
  onSalonSelect: (salonId: string) => void
  onAddNewSalon?: () => void
}

export default function SalonList({ 
  salons, 
  selectedSalonId, 
  onSalonSelect, 
  onAddNewSalon 
}: SalonListProps) {
  return (
    <div className="space-y-4">
      {/* Liste des salons existants */}
      {salons.map((salon) => 
      {
        console.log(salon.progress);
        return (
        <Card
          key={salon.id}
          className={`
            cursor-pointer transition-all duration-200 hover:shadow-md
            ${selectedSalonId === salon.id 
              ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
          onClick={() => onSalonSelect(salon.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icône du salon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${selectedSalonId === salon.id ? 'bg-blue-600' : 'bg-gray-100'}
                `}>
                  <Building2 className={`h-6 w-6 ${selectedSalonId === salon.id ? 'text-white' : 'text-gray-600'}`} />
                </div>
                
                {/* Informations du salon */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{salon.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{salon.address || salon.city}</span>
                  </div>
                </div>
              </div>
              
              {/* Badge de statut et sélection */}
              <div className="flex items-center gap-3">
                {/* Badge de progression */}
                <div className="flex items-center gap-2">
                  {salon.progress >= 80 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Configuré</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700">
                        Configuration incomplète ({salon.progress}%)
                      </span>
                    </>
                  )}
                </div>
                
                {/* Indicateur de sélection */}
                {selectedSalonId === salon.id && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )
      })}

      {/* Card "Ajouter un nouveau salon" */}
      <Card 
        className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
        onClick={onAddNewSalon}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 text-gray-500 hover:text-blue-600">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Ajouter un nouveau salon</h3>
              <p className="text-sm text-gray-400">Créer et configurer un nouveau salon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
