'use client'

import React, { useRef, useMemo } from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Clock, Check } from 'lucide-react'
import { ISalonService, IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'

interface ServiceSelectionProps {
  services: ISalonService[]
  categories: IServiceCategory[]
  selectedService: ISalonService | null
  onSelectService: (service: ISalonService) => void
}

export default function ServiceSelection({
  services,
  categories,
  selectedService,
  onSelectService,
}: ServiceSelectionProps) {
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Grouper les services par catégorie
  const servicesByCategory = useMemo(() => {
    const grouped: { [key: string]: ISalonService[] } = {}
    services.forEach(service => {
      if (!grouped[service.categoryId]) {
        grouped[service.categoryId] = []
      }
      grouped[service.categoryId]!.push(service)
    })
    return grouped
  }, [services])

  const scrollToCategory = (categoryId: string) => {
    categoryRefs.current[categoryId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choisissez un service</h2>
        <p className="text-gray-600 mt-1">Sélectionnez le service que vous souhaitez réserver</p>
      </div>

      {/* Bande de catégories sticky */}
      <div className="sticky top-16 z-10 bg-white border rounded-lg shadow-sm p-2 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const hasServices = (servicesByCategory[category.id]?.length ?? 0) > 0
            if (!hasServices) return null
            return (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-sm font-medium whitespace-nowrap transition-colors"
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Services groupés par catégorie */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryServices = servicesByCategory[category.id] || []
          if (categoryServices.length === 0) return null

          return (
            <div
              key={category.id}
              ref={(el) => { categoryRefs.current[category.id] = el }}
              className="scroll-mt-32"
            >
              {/* Titre de catégorie */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>

              {/* Services de la catégorie */}
              <div className="grid gap-4">
                {categoryServices.map((service) => {
                  const isSelected = selectedService?.id === service.id

                  return (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                      }`}
                      onClick={() => onSelectService(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{service.name}</h4>
                              {isSelected && (
                                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{service.duration} min</span>
                              </div>
                              <span className="font-bold text-blue-600 text-lg">
                                {service.price.toLocaleString()} XAF
                              </span>
                            </div>

                            {/* Badge suppléments disponibles */}
                            {service.supplements && service.supplements.length > 0 && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {service.supplements.length} supplément{service.supplements.length > 1 ? 's' : ''} disponible{service.supplements.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>

                          {/* Image si disponible */}
                          {service.imageUrl && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={service.imageUrl}
                                alt={service.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
