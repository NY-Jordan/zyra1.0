'use client'

import React, { useRef, useMemo } from 'react'
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

  const servicesByCategory = useMemo(() => {
    const grouped: { [key: string]: ISalonService[] } = {}
    services.forEach(service => {
      if (!grouped[service.categoryId]) grouped[service.categoryId] = []
      grouped[service.categoryId]!.push(service)
    })
    return grouped
  }, [services])

  const scrollToCategory = (categoryId: string) => {
    categoryRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-gray-900">Choisissez un service</h2>
        <p className="text-[13px] text-gray-500">Sélectionnez le service que vous souhaitez réserver</p>
      </div>

      {/* Category tabs */}
      <div className="sticky top-14 z-10 bg-gray-50 py-2 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((category) => {
            const hasServices = (servicesByCategory[category.id]?.length ?? 0) > 0
            if (!hasServices) return null
            return (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className="px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 text-[12px] font-semibold text-gray-600 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Services by category */}
      <div className="space-y-7">
        {categories.map((category) => {
          const categoryServices = servicesByCategory[category.id] || []
          if (categoryServices.length === 0) return null

          return (
            <div
              key={category.id}
              ref={(el) => { categoryRefs.current[category.id] = el }}
              className="scroll-mt-28"
            >
              <div className="mb-3">
                <h3 className="text-[15px] font-bold text-gray-700">{category.name}</h3>
                {category.description && (
                  <p className="text-[12px] text-gray-500 mt-0.5">{category.description}</p>
                )}
              </div>

              <div className="space-y-2">
                {categoryServices.map((service) => {
                  const isSelected = selectedService?.id === service.id
                  return (
                    <button
                      key={service.id}
                      onClick={() => onSelectService(service)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        isSelected
                          ? 'border-gray-900 bg-gray-100'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Image */}
                      {service.imageUrl && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold text-gray-900 truncate">{service.name}</p>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-[12px] text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration} min</span>
                          </div>
                          {service.supplements && service.supplements.length > 0 && (
                            <span className="text-[11px] text-gray-900 font-medium">
                              +{service.supplements.length} option{service.supplements.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-[15px] font-extrabold ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                          {Number(service.price).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-gray-400">XAF</p>
                      </div>
                    </button>
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
