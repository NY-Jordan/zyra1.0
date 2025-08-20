'use client'
import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { Edit, Trash2, Eye, Package as PackageIcon } from 'lucide-react'
import { Badge } from '@zyra/ui/components/badge'

interface Package {
  id: string
  name: string
  price: number
  currency: string
  countryId: string
  features: string[]
  duration: number
  active: boolean
  type?: 'salon' | 'client'
  createdAt?: any
  updatedAt?: any
}

interface PackageTableProps {
  packages: any[]
  countries: any[]
  isLoading: boolean
  onEdit: (pkg: any) => void
  onDelete: (id: string) => void
}

export default function PackageTable({ packages, countries, isLoading, onEdit, onDelete }: PackageTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des forfaits...</p>
        </div>
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-8 text-center">
          <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun forfait</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouveau forfait.</p>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' ' + currency
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Forfait
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pays
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map((pkg: any) => (
              <tr key={pkg.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-sm text-gray-500">
                      {pkg.features?.length || 0} fonctionnalité(s)
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(pkg.price, pkg.currency)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={pkg.type === 'salon' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {pkg.type || 'Non défini'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pkg.duration} jour(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pkg.countryId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={pkg.active ? 'default' : 'destructive'}>
                    {pkg.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(pkg)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(pkg.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
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
