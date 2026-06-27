'use client'

import React from 'react'
import { Star } from 'lucide-react'

const REVIEWS = [
  { name: 'Marie K.', ago: 'Juin 2026', rating: 5, note: 'Accueil chaleureux, service impeccable. Mon coiffeur a parfaitement compris ce que je voulais !' },
  { name: 'Jean-Paul N.', ago: 'Juin 2026', rating: 5, note: 'Salon très propre et équipe professionnelle. Je reviendrai sans hésiter.' },
  { name: 'Aline T.', ago: 'Mai 2026', rating: 4, note: 'Excellente expérience ! Résultat au-delà de mes attentes. Je recommande vivement.' },
]

export function SalonReviews() {
  return (
    <section id="avis" className="scroll-mt-20">
      <div className="flex items-baseline gap-2 mb-5">
        <h2 className="text-[26px] font-extrabold tracking-tight text-gray-900">Avis</h2>
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-[16px] font-bold text-gray-900">4,7</span>
          <span className="text-[14px] text-gray-500">(151)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {REVIEWS.map((review, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-[15px] font-bold flex-shrink-0">
                {review.name.charAt(0)}
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">{review.name}</p>
                <p className="text-[12px] text-gray-400">{review.ago}</p>
              </div>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <p className="text-[14px] text-gray-600 leading-relaxed">{review.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
