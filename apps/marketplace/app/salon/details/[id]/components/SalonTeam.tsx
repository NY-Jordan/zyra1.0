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
    <section className="scroll-mt-20">
      <h2 className="text-[26px] font-extrabold tracking-tight text-gray-900 mb-5">Notre équipe</h2>

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
              <div className="w-[72px] h-[72px] rounded-full bg-gray-100 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-gray-500" />
              </div>
            )}
            <div className="text-center w-full">
              <p className="text-[13px] font-bold text-gray-900 truncate">{hd.name}</p>
              {hd.speciality && (
                <p className="text-[11px] text-gray-400 truncate">{hd.speciality}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
