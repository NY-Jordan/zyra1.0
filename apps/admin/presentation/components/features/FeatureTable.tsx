'use client'
import React from 'react'
import { Eye, Check, X } from 'lucide-react'
import { Button } from '@zyra/ui/components/button'
import { Badge } from '@zyra/ui/components/badge'
import { FeatureDisplayData } from '@zyra/conf/domain/entities/features.entities'
import { FeatureTypeEnum } from '@zyra/conf/domain/enums/FeatureTypeEnum'

interface FeatureTableProps {
  features: FeatureDisplayData[]
  isLoading: boolean
  onView: (feature: FeatureDisplayData) => void
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
      <div className="flex items-center gap-1 text-green-600">
        <Check size={16} />
        <span>Activé</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-red-600">
        <X size={16} />
        <span>Désactivé</span>
      </div>
    )
  }
  return value.toString()
}

export default function FeatureTable({ features, isLoading, onView }: FeatureTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des fonctionnalités...</p>
        </div>
      </div>
    )
  }

  if (features.length === 0) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-6 text-center">
          <p className="text-gray-600">Aucune fonctionnalité trouvée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur par défaut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {features.map((feature) => (
              <tr key={feature.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{feature.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {feature.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getTypeBadgeColor(feature.type)}>
                    {getTypeLabel(feature.type)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDefaultValue(feature.defaultValue)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(feature)}
                      className="flex items-center gap-1"
                    >
                      <Eye size={16} />
                      Voir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
