'use client'
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { Badge } from '@zyra/ui/components/badge'
import { FeatureDisplayData } from '@zyra/conf/domain/entities/features.entities'
import { FeatureTypeEnum } from '@zyra/conf/domain/enums/FeatureTypeEnum'
import { Check, X } from 'lucide-react'

interface FeatureModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: FeatureDisplayData | null
}

const getTypeBadgeColor = (type: FeatureTypeEnum) => {
  switch (type) {
    case FeatureTypeEnum.ACCESS:
      return 'bg-green-100 text-green-800'
    case FeatureTypeEnum.LIMIT:
      return 'bg-blue-100 text-blue-800'
    case FeatureTypeEnum.SETTING:
      return 'bg-purple-100 text-purple-800'
    case FeatureTypeEnum.FEATURE:
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTypeLabel = (type: FeatureTypeEnum) => {
  switch (type) {
    case FeatureTypeEnum.ACCESS:
      return 'Accès'
    case FeatureTypeEnum.LIMIT:
      return 'Limite'
    case FeatureTypeEnum.SETTING:
      return 'Paramètre'
    case FeatureTypeEnum.FEATURE:
      return 'Fonctionnalité'
    default:
      return type
  }
}

const formatDefaultValue = (value: boolean | number | string) => {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="flex items-center gap-2 text-green-600">
        <Check size={16} />
        <span>Activé</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-red-600">
        <X size={16} />
        <span>Désactivé</span>
      </div>
    )
  }
  return value.toString()
}

export default function FeatureModal({ isOpen, onClose, feature }: FeatureModalProps) {
  if (!feature) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails de la fonctionnalité</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nom */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nom</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{feature.name}</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-gray-600">{feature.description}</p>
          </div>

          {/* Clé technique */}
          <div>
            <label className="text-sm font-medium text-gray-700">Clé technique</label>
            <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">{feature.key}</p>
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <div className="mt-1">
              <Badge className={getTypeBadgeColor(feature.type)}>
                {getTypeLabel(feature.type)}
              </Badge>
            </div>
          </div>

          {/* Valeur par défaut */}
          <div>
            <label className="text-sm font-medium text-gray-700">Valeur par défaut</label>
            <div className="mt-1">
              {formatDefaultValue(feature.defaultValue)}
            </div>
          </div>

          {/* Bouton de fermeture */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
