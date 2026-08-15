'use client'
import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { Building2, MapPin, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

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
      {salons.map((salon) => (
        <SalonListItem
          key={salon.id}
          salon={salon}
          isSelected={selectedSalonId === salon.id}
          onSelect={() => onSalonSelect(salon.id)}
        />
      ))}

      {/* Card "Ajouter un nouveau salon" */}
      <Card 
        className="border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer"
        onClick={onAddNewSalon}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Ajouter un nouveau salon</h3>
              <p className="text-sm text-gray-400 dark:text-slate-500">Créer et configurer un nouveau salon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface SalonListItemProps {
  salon: ISalon
  isSelected: boolean
  onSelect: () => void
}

function SalonListItem({ salon, isSelected, onSelect }: SalonListItemProps) {
  const { unreadCount } = useNotifications(salon.id)

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected
          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
        }
      `}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icône du salon */}
            <div className="relative">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${isSelected ? 'bg-blue-600' : 'bg-gray-100 dark:bg-slate-800'}
              `}>
                <Building2 className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-slate-400'}`} />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            {/* Informations du salon */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{salon.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400">
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
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Configuré</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Configuration incomplète ({salon.progress}%)
                  </span>
                </>
              )}
            </div>

            {/* Indicateur de sélection */}
            {isSelected && (
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
