'use client'

import React from 'react'
import { Star, ChevronRight } from 'lucide-react'

export function SalonReviews() {
  return (
    <section className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Avis Clients</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-amber-600 to-transparent rounded-full" />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  C{idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">Client {idx + 1}</p>
                  <p className="text-xs sm:text-sm text-slate-500">Il y a {idx + 1} jour(s)</p>
                </div>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Service excellent ! L'équipe est très accueillante et professionnelle. Je recommande vivement !
            </p>
          </div>
        ))}
      </div>

      <div className="text-center pt-4 sm:pt-6">
        <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors inline-flex items-center gap-1 text-sm sm:text-base">
          Voir tous les avis
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  )
}
