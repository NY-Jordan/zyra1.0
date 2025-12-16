'use client'

import React from 'react'
import { Users, Star } from 'lucide-react'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

interface TeamProps {
  hairdressers: IHairDresser[]
}

export function SalonTeam({ hairdressers }: TeamProps) {
  if (!hairdressers || hairdressers.length === 0) {
    return null
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Notre Équipe</h2>
        <p className="text-slate-600 text-base">Rencontrez nos professionnels qualifiés</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {hairdressers.map((hairdresser) => (
          <div
            key={hairdresser.id}
            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {hairdresser.photo ? (
                  <img
                    src={hairdresser.photo}
                    alt={hairdresser.name}
                    className="h-20 w-20 rounded-xl object-cover ring-2 ring-slate-200 group-hover:ring-green-400 transition-all duration-300"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-slate-200">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base mb-1">{hairdresser.name}</h3>
                <p className="text-sm text-green-600 font-semibold mb-2">{hairdresser.speciality}</p>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-600 ml-1">4.5</span>
                </div>

                {/* Languages */}
                <p className="text-xs text-slate-500">Langues: FR • EN</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
