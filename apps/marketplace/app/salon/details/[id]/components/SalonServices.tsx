'use client'

import React from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { Button } from '@zyra/ui/components/button'
import { useRouter } from 'next/navigation'

// Add animation styles
const animationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`

interface SalonService {
  name: string
  price: number | string
  duration: number
  categoryId?: string
}

interface ServicesCategory {
  id: string
  name: string
}

interface SalonServicesProps {
  salonId: string
  serviceCategories: ServicesCategory[]
  services: SalonService[]
}

export function SalonServices({
  salonId,
  serviceCategories,
  services,
}: SalonServicesProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = React.useState(
    serviceCategories[0]?.id || ''
  )
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  const handleCategoryChange = (categoryId: string) => {
    setIsTransitioning(true)
    setSelectedCategory(categoryId)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  if (!serviceCategories || serviceCategories.length === 0) {
    return null
  }

  // Filter services by selected category
  const filteredServices = services.filter(
    (service) => service.categoryId === selectedCategory
  )

  return (
    <section className="space-y-6 sm:space-y-8">
      <style>{animationStyles}</style>
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Prestations</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {serviceCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 border whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105'
                : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Services Grid with Animation */}
      <div className={`space-y-2 sm:space-y-3 transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {filteredServices && filteredServices.slice(0, 6).map((service, idx) => (
          <div
            key={idx}
            className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 ${
              isTransitioning ? 'animate-fadeIn' : ''
            }`}
            style={{
              animation: isTransitioning ? `fadeIn 0.3s ease-out ${idx * 50}ms` : 'none',
            }}
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base mb-1 group-hover:text-blue-600 transition-colors">
                {service.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {service.duration || 30} min
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="text-right">
                <p className="font-bold text-slate-900 text-base sm:text-lg">
                  ${service.price || 'N/A'}
                </p>
              </div>
              <Button
                onClick={() => window.location.href = `/booking/${salonId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
              >
                Réserver
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(filteredServices?.length || 0) > 6 && (
        <div className="text-center pt-4">
          <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors inline-flex items-center gap-1 text-sm sm:text-base">
            Voir tous les services
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  )
}
