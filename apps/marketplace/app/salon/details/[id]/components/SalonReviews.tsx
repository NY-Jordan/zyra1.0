'use client'

import React from 'react'
import { Star } from 'lucide-react'

const REVIEWS = [
  { name: 'Marie K.', ago: '2 jours', note: 'Accueil chaleureux, service impeccable. Mon coiffeur a parfaitement compris ce que je voulais !' },
  { name: 'Jean-Paul N.', ago: '5 jours', note: 'Salon très propre et équipe professionnelle. Je reviendrai sans hésiter.' },
  { name: 'Aline T.', ago: '1 semaine', note: 'Excellente expérience ! Résultat au-delà de mes attentes. Je recommande vivement.' },
]

export function SalonReviews() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">Avis clients</h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-[12px] font-bold text-amber-800">4.8</span>
          <span className="text-[11px] text-amber-600">(128)</span>
        </div>
      </div>

      <div className="space-y-3">
        {REVIEWS.map((review, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-[#F0EAE4] p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800">{review.name}</p>
                  <p className="text-[11px] text-slate-400">Il y a {review.ago}</p>
                </div>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed">{review.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
