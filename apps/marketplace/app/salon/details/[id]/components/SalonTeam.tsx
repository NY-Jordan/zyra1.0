'use client'

import React from 'react'
import { Scissors } from 'lucide-react'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

interface TeamProps {
  hairdressers: IHairDresser[]
  title: string
}

export function SalonTeam({ hairdressers, title }: TeamProps) {
  if (!hairdressers || hairdressers.length === 0) return null

  return (
    <section className="scroll-mt-20">
      <h2 className="text-slate-900 mb-5">{title}</h2>

      <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
        {hairdressers.map(hd => (
          <div key={hd.id} className="flex flex-col items-center gap-2.5 flex-shrink-0 w-[88px]">
            {hd.photo ? (
              <img
                src={hd.photo}
                alt={hd.name}
                className="w-[72px] h-[72px] rounded-full object-cover"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-slate-100 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-slate-500" />
              </div>
            )}
            <div className="text-center w-full">
              <p className="text-[13px] font-bold text-slate-900 truncate">{hd.name}</p>
              {hd.speciality && (
                <p className="text-[11px] text-slate-400 truncate">{hd.speciality}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
