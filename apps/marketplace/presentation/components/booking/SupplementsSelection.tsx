'use client'

import React from 'react'
import { Check, Plus, Minus } from 'lucide-react'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'

interface SupplementsSelectionProps {
  supplements: ISalonServiceSupplement[]
  selectedSupplements: ISalonServiceSupplement[]
  onToggleSupplement: (supplement: ISalonServiceSupplement) => void
}

export default function SupplementsSelection({
  supplements,
  selectedSupplements,
  onToggleSupplement,
}: SupplementsSelectionProps) {
  const totalExtra = supplements
    .filter(s => selectedSupplements.some(sel => sel.id === s.id))
    .reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-gray-900">Suppléments</h2>
        <p className="text-[13px] text-gray-500">Ajoutez des options supplémentaires à votre service (optionnel)</p>
      </div>

      {supplements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-[13px] text-gray-500">Aucun supplément disponible pour ce service</p>
        </div>
      ) : (
        <div className="space-y-2">
          {supplements.map((supplement, key) => {
            const isSelected = selectedSupplements.some(sel => sel.id === supplement.id)
            return (
              <button
                key={key}
                onClick={() => onToggleSupplement(supplement)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-gray-900 bg-gray-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-gray-900">{supplement.name}</p>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-500">
                      <span>+{supplement.duration} min</span>
                      <span className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        +{Number(supplement.price).toLocaleString()} XAF
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
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
        <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-900">Total suppléments</span>
          <span className="text-[16px] font-extrabold text-gray-900">+{totalExtra.toLocaleString()} XAF</span>
        </div>
      )}
    </div>
  )
}
