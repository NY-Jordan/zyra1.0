'use client'

import React, { useState } from 'react'
import { Check, User, Wand2, Star, X, Phone, Mail, MapPin } from 'lucide-react'
import { IHairDresser, HairDresserSalonAssociation } from '@zyra/conf/domain/entities/hairdressers.entities'

interface HairdresserSelectionProps {
  hairdressers: { hairdresser: IHairDresser; association: HairDresserSalonAssociation; }[] | undefined
  selectedHairdresser: HairDresserSalonAssociation | null
  onSelectHairdresser: (hairdresser: HairDresserSalonAssociation | null) => void
}

export default function HairdresserSelection({
  hairdressers,
  selectedHairdresser,
  onSelectHairdresser,
}: HairdresserSelectionProps) {
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const isAnySelected = selectedHairdresser === null

  const detailsItem = detailsId && hairdressers
    ? hairdressers.find(h => h.hairdresser.id === detailsId)
    : null

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-gray-900">Choisissez un coiffeur</h2>
        <p className="text-[13px] text-gray-500">Sélectionnez un professionnel ou laissez-nous choisir</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Any hairdresser */}
        <button
          onClick={() => onSelectHairdresser(null)}
          className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
            isAnySelected
              ? 'border-gray-900 bg-gray-100'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          {isAnySelected && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              isAnySelected ? 'bg-gray-100' : 'bg-gradient-to-br from-violet-100 to-pink-100'
            }`}>
              <Wand2 className={`h-5 w-5 ${isAnySelected ? 'text-gray-900' : 'text-violet-500'}`} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">N'importe quel coiffeur</p>
              <p className="text-[12px] text-gray-500">Meilleur disponible</p>
            </div>
          </div>
        </button>

        {/* Specific hairdressers */}
        {hairdressers?.map((item) => {
          const isSelected = selectedHairdresser?.parentId === item.hairdresser.id
          const hd = item.hairdresser
          return (
            <button
              key={hd.id}
              onClick={() => onSelectHairdresser(item.association)}
              className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-gray-900 bg-gray-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  {hd.photo ? (
                    <img src={hd.photo} alt={hd.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-gray-900 truncate">{hd.name}</p>
                  {hd.speciality && (
                    <p className="text-[12px] text-gray-500 truncate">{hd.speciality}</p>
                  )}
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDetailsId(hd.id) }}
                className="mt-3 w-full h-7 rounded-lg text-[11px] font-semibold text-gray-500 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Voir détails
              </button>
            </button>
          )
        })}
      </div>

      {/* Details modal */}
      {detailsItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <p className="text-[14px] font-bold text-gray-900">{detailsItem.hairdresser.name}</p>
              <button
                onClick={() => setDetailsId(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                  {detailsItem.hairdresser.photo ? (
                    <img src={detailsItem.hairdresser.photo} alt={detailsItem.hairdresser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-gray-900">{detailsItem.hairdresser.name}</p>
                {detailsItem.hairdresser.speciality && (
                  <p className="text-[12px] text-gray-500">{detailsItem.hairdresser.speciality}</p>
                )}
              </div>
              <div className="space-y-2 border-t border-gray-200 pt-3">
                {detailsItem.hairdresser.email && (
                  <div className="flex items-center gap-2 text-[13px] text-gray-600">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>{detailsItem.hairdresser.email}</span>
                  </div>
                )}
                {detailsItem.hairdresser.phone && (
                  <div className="flex items-center gap-2 text-[13px] text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>{detailsItem.hairdresser.phone}</span>
                  </div>
                )}
                {(detailsItem.hairdresser.city || detailsItem.hairdresser.country) && (
                  <div className="flex items-center gap-2 text-[13px] text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>{[detailsItem.hairdresser.city, detailsItem.hairdresser.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => { onSelectHairdresser(detailsItem.association); setDetailsId(null) }}
                className="w-full h-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-bold transition-colors"
              >
                Choisir ce coiffeur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
