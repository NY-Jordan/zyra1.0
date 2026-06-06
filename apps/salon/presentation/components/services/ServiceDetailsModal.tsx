'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@zyra/ui/components/dialog'
import { Badge } from '@zyra/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Separator } from '@zyra/ui/components/separator'
import { Clock, DollarSign, Tag, Eye, Star, ImageIcon, Plus } from 'lucide-react'
import { formatPrice } from '@zyra/conf/lib/utils'
import { ISalonService, IServiceCategory, ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'

interface ServiceDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ISalonService | null
  categories: IServiceCategory[]
}

export default function ServiceDetailsModal({
  open,
  onOpenChange,
  service,
  categories
}: ServiceDetailsModalProps) {
  if (!service) return null

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0min'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
    }
    return `${mins}min`
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'Non catégorisé'
  }

  const calculateSupplementsTotal = (supplements: ISalonServiceSupplement[]) => {
    if (!supplements || supplements.length === 0) {
      return { totalPrice: 0, totalDuration: 0 }
    }
    
    return supplements.reduce(
      (acc, supplement) => ({
        totalPrice: acc.totalPrice + (supplement.price || 0),
        totalDuration: acc.totalDuration + (supplement.duration || 0)
      }),
      { totalPrice: 0, totalDuration: 0 }
    )
  }

  const supplementsTotal = calculateSupplementsTotal(service.supplements || [])
  const grandTotal = {
    price: service.price + supplementsTotal.totalPrice,
    duration: service.duration + supplementsTotal.totalDuration
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Détails du service
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête du service */}
          <div className="flex items-start gap-4">
            {service.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{service.name}</h2>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={service.isActive !== false ? "default" : "secondary"}>
                  {service.isActive !== false ? "Actif" : "Inactif"}
                </Badge>
                <Badge variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {getCategoryName(service.categoryId)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Prix de base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(service.price, 'XAF')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Durée de base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {formatDuration(service.duration)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Suppléments */}
          {service.supplements && service.supplements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Suppléments disponibles ({service.supplements.length})
                </h3>
                
                <div className="grid gap-3">
                  {service.supplements.map((supplement, index) => (
                    <Card key={`${supplement.id}-${index}`} className="border-l-4 border-l-orange-400">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{supplement.name}</h4>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="font-medium text-green-600">
                                +{formatPrice(supplement.price, 'XAF')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-blue-600" />
                              <span className="font-medium text-blue-600">
                                +{formatDuration(supplement.duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Total des suppléments */}
                <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-orange-800 dark:text-orange-300">Total suppléments</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="font-medium text-green-600">
                            +{formatPrice(supplementsTotal.totalPrice, 'XAF')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-600" />
                          <span className="font-medium text-blue-600">
                            +{formatDuration(supplementsTotal.totalDuration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Prix total */}
          <Separator />
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Prix total du service
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Prix total</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(grandTotal.price, 'XAF')}
                </p>
                {service.supplements && service.supplements.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    Base: {formatPrice(service.price, 'XAF')} + Suppléments: {formatPrice(supplementsTotal.totalPrice, 'XAF')}
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Durée totale</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatDuration(grandTotal.duration)}
                </p>
                {service.supplements && service.supplements.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    Base: {formatDuration(service.duration)} + Suppléments: {formatDuration(supplementsTotal.totalDuration)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message si pas de suppléments */}
          {(!service.supplements || service.supplements.length === 0) && (
            <div className="text-center py-8">
              <Plus className="h-12 w-12 mx-auto text-gray-400 dark:text-slate-500 mb-3" />
              <p className="text-gray-600 dark:text-slate-400">Aucun supplément configuré pour ce service</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}