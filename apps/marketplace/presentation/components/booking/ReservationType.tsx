'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Users, User } from 'lucide-react'

interface ReservationTypeProps {
  selectedType: 'single' | 'multiple' | null
  onSelectType: (type: 'single' | 'multiple') => void
}

export default function ReservationType({
  selectedType,
  onSelectType,
}: ReservationTypeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Type de réservation</h2>
        <p className="text-gray-600">Choisissez si vous réservez pour vous-même ou plusieurs personnes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Reservation */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedType === 'single'
              ? 'border-blue-600 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSelectType('single')}
        >
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center text-lg">Réservation personnelle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 text-sm">
              Je réserve un créneau pour moi-même
            </p>
            <Button
              className={`w-full mt-6 ${
                selectedType === 'single'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border border-gray-300'
              }`}
              variant={selectedType === 'single' ? 'default' : 'outline'}
              onClick={() => onSelectType('single')}
            >
              {selectedType === 'single' ? '✓ Sélectionné' : 'Choisir'}
            </Button>
          </CardContent>
        </Card>

        {/* Multiple Reservations */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedType === 'multiple'
              ? 'border-blue-600 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSelectType('multiple')}
        >
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-lg">Réservations multiples</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 text-sm">
              Je réserve plusieurs créneaux pour d'autres personnes
            </p>
            <Button
              className={`w-full mt-6 ${
                selectedType === 'multiple'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border border-gray-300'
              }`}
              variant={selectedType === 'multiple' ? 'default' : 'outline'}
              onClick={() => onSelectType('multiple')}
            >
              {selectedType === 'multiple' ? '✓ Sélectionné' : 'Choisir'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
