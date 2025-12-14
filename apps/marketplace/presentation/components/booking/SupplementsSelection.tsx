'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Badge } from '@zyra/ui/components/badge'
import { Check, Plus, Minus } from 'lucide-react'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'

interface SupplementsSelectionProps {
  supplements: ISalonServiceSupplement[]
  selectedSupplements: string[]
  onToggleSupplement: (supplementId: string) => void
}

export default function SupplementsSelection({
  supplements,
  selectedSupplements,
  onToggleSupplement,
}: SupplementsSelectionProps) {
  const totalSupplementsPrice = supplements
    .filter(s => selectedSupplements.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Suppléments (optionnel)</h2>
        <p className="text-gray-600 mt-1">Ajoutez des options supplémentaires à votre service</p>
      </div>

      {supplements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Aucun supplément disponible pour ce service</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {supplements.map((supplement) => {
            const isSelected = selectedSupplements.includes(supplement.id)

            return (
              <Card
                key={supplement.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => onToggleSupplement(supplement.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{supplement.name}</h3>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span>+{supplement.duration} min</span>
                        <span className="font-bold text-blue-600">
                          +{supplement.price.toLocaleString()} XAF
                        </span>
                      </div>
                    </div>
                    
                    <button
                      className={`p-2 rounded-full transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSupplement(supplement.id)
                      }}
                    >
                      {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Total */}
      {selectedSupplements.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total suppléments :</span>
              <span className="text-xl font-bold text-blue-600">
                +{totalSupplementsPrice.toLocaleString()} XAF
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
