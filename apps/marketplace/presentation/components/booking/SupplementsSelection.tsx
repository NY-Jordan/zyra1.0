'use client'

import React from 'react'
import { Check, Plus, Minus } from 'lucide-react'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'

interface SupplementsSelectionProps {
  supplements: ISalonServiceSupplement[]
  selectedSupplements: string[]
  onToggleSupplement: (supplement: ISalonServiceSupplement) => void
}

export default function SupplementsSelection({
  supplements,
  selectedSupplements,
  onToggleSupplement,
}: SupplementsSelectionProps) {
  const totalExtra = supplements
    .filter(s => selectedSupplements.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-slate-800">Suppléments</h2>
        <p className="text-[13px] text-slate-500">Ajoutez des options supplémentaires à votre service (optionnel)</p>
      </div>

      {supplements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F0EAE4] p-8 text-center">
          <p className="text-[13px] text-slate-500">Aucun supplément disponible pour ce service</p>
        </div>
      ) : (
        <div className="space-y-2">
          {supplements.map((supplement, key) => {
            const isSelected = selectedSupplements.includes(supplement.name)
            return (
              <button
                key={key}
                onClick={() => onToggleSupplement(supplement)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-[#F0EAE4] bg-white hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-slate-800">{supplement.name}</p>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-slate-500">
                      <span>+{supplement.duration} min</span>
                      <span className={`font-semibold ${isSelected ? 'text-emerald-600' : 'text-slate-600'}`}>
                        +{Number(supplement.price).toLocaleString()} XAF
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-[#F0EAE4] text-slate-500'
                    }`}
                    onClick={(e) => { e.stopPropagation(); onToggleSupplement(supplement) }}
                  >
                    {isSelected ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {totalExtra > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-emerald-800">Total suppléments</span>
          <span className="text-[16px] font-extrabold text-emerald-600">+{totalExtra.toLocaleString()} XAF</span>
        </div>
      )}
    </div>
  )
}
