'use client'

import React from 'react'
import { Scissors } from 'lucide-react'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

interface TeamProps {
  hairdressers: IHairDresser[]
}

export function SalonTeam({ hairdressers }: TeamProps) {
  if (!hairdressers || hairdressers.length === 0) return null

  return (
    <section className="space-y-5">
      <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">Notre Équipe</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hairdressers.map(hd => (
          <div
            key={hd.id}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#F0EAE4] hover:border-emerald-200 hover:shadow-sm transition-all"
          >
            {hd.photo ? (
              <img
                src={hd.photo}
                alt={hd.name}
                className="h-14 w-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-[#F0EAE4]"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Scissors className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-800 truncate">{hd.name}</p>
              {hd.speciality && (
                <p className="text-[12px] text-emerald-600 font-medium mt-0.5 truncate">{hd.speciality}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
