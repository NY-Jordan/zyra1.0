'use client'

import React from 'react'
import { List } from 'lucide-react'

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

function formatDuration(min: number) {
  const m = min || 30
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? `${h}h` : `${h} h et ${rem} min`
}

export function SalonServices({ salonId, serviceCategories, services }: SalonServicesProps) {
  const [selectedCategory, setSelectedCategory] = React.useState(serviceCategories[0]?.id || '')
  const [showAll, setShowAll] = React.useState(false)

  if (!serviceCategories || serviceCategories.length === 0) return null

  const filtered = services.filter(s => s.categoryId === selectedCategory)
  const visible = showAll ? filtered : filtered.slice(0, 6)

  return (
    <section id="services" className="scroll-mt-20">
      <h2 className="text-gray-900 mb-5">Prestations</h2>

      {/* Pill category tabs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 min-w-0">
          {serviceCategories.map(cat => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setShowAll(false) }}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition-all duration-300 ease-out ${
                  active
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
        <button
          aria-label="Toutes les catégories"
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Service cards — re-keyed to animate on category switch */}
      <div key={selectedCategory} className="zyra-fade space-y-3">
        {visible.map((service, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-gray-900 leading-snug">{service.name}</p>
              <p className="text-[14px] text-gray-500 mt-1">{formatDuration(service.duration)}</p>
              <p className="text-[15px] font-semibold text-gray-900 mt-2">
                à partir de {Number(service.price).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <button
              onClick={() => window.location.href = `/booking/${salonId}`}
              className="h-10 px-5 rounded-full text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Réserver
            </button>
          </div>
        ))}
      </div>

      {filtered.length > 6 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-4 text-gray-900 hover:underline"
        >
          {showAll ? 'Voir moins' : `Afficher tout (${filtered.length})`}
        </button>
      )}

      {filtered.length === 0 && (
        <p className="text-[14px] text-gray-400 py-2">Aucun service dans cette catégorie.</p>
      )}
    </section>
  )
}
