'use client'

import React from 'react'

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
  return rem === 0 ? `${h}h` : `${h}h${rem}`
}

export function SalonServices({ salonId, serviceCategories, services }: SalonServicesProps) {
  const [selectedCategory, setSelectedCategory] = React.useState(serviceCategories[0]?.id || '')
  const [showAll, setShowAll] = React.useState(false)

  if (!serviceCategories || serviceCategories.length === 0) return null

  const filtered = services.filter(s => s.categoryId === selectedCategory)
  const visible = showAll ? filtered : filtered.slice(0, 6)

  return (
    <section id="services" className="scroll-mt-20">
      <style>{`
        @keyframes zyraFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .zyra-fade { animation: zyraFadeIn .28s cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>

      <h2 className="text-[26px] font-extrabold tracking-tight text-gray-900 mb-5">Prestations</h2>

      {/* Pill category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
        {serviceCategories.map(cat => {
          const active = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setShowAll(false) }}
              className={`px-4 py-2 text-[13px] font-semibold rounded-full whitespace-nowrap flex-shrink-0 transition-all duration-300 ease-out ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 scale-[1.02]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Service cards — re-keyed to animate on category switch */}
      <div key={selectedCategory} className="zyra-fade space-y-3">
        {visible.map((service, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-gray-200 hover:border-emerald-200 hover:shadow-[0_2px_12px_rgba(16,185,129,0.10)] transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-gray-900 leading-snug">{service.name}</p>
              <p className="text-[13px] text-gray-500 mt-1">{formatDuration(service.duration)}</p>
              <p className="text-[14px] text-gray-900 mt-2">
                à partir de <span className="font-semibold text-emerald-700">{Number(service.price).toLocaleString('fr-FR')} FCFA</span>
              </p>
            </div>
            <button
              onClick={() => window.location.href = `/booking/${salonId}`}
              className="h-10 px-5 rounded-full text-[13px] font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all whitespace-nowrap flex-shrink-0"
            >
              Réserver
            </button>
          </div>
        ))}
      </div>

      {filtered.length > 6 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-4 text-[14px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
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
