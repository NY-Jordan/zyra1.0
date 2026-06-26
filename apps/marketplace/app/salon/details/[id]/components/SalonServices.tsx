'use client'

import React from 'react'
import { Clock, ArrowRight } from 'lucide-react'

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

export function SalonServices({ salonId, serviceCategories, services }: SalonServicesProps) {
  const [selectedCategory, setSelectedCategory] = React.useState(serviceCategories[0]?.id || '')

  if (!serviceCategories || serviceCategories.length === 0) return null

  const filteredServices = services.filter(s => s.categoryId === selectedCategory)

  return (
    <section className="space-y-5">
      <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">Prestations</h2>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {serviceCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-full border transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-[#E8E0D8] hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services list */}
      <div className="space-y-2">
        {filteredServices.slice(0, 8).map((service, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#F0EAE4] hover:border-emerald-200 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-slate-800 truncate">{service.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-[12px] text-slate-500">{service.duration || 30} min</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-[15px] font-extrabold text-slate-800">
                {Number(service.price).toLocaleString()} <span className="text-[11px] font-semibold text-slate-500">XAF</span>
              </span>
              <button
                onClick={() => window.location.href = `/booking/${salonId}`}
                className="h-8 px-3 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Réserver
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length > 8 && (
        <button className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          Voir tous les services
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </section>
  )
}
