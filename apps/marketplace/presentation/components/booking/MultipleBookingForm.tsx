'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { X, ChevronDown } from 'lucide-react'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

interface PersonBooking {
  personNumber: number
  service: ISalonService | null
  supplements: string[]
  hairdresser: IHairDresser | null
}

interface MultipleBookingFormProps {
  numberOfPeople: number
  services: ISalonService[]
  supplements: any[]
  hairdressers: IHairDresser[]
  bookings: PersonBooking[]
  onBookingChange: (index: number, booking: PersonBooking) => void
  currentPersonIndex: number
  onPersonChange: (index: number) => void
}

export default function MultipleBookingForm({
  numberOfPeople,
  services,
  supplements,
  hairdressers,
  bookings,
  onBookingChange,
  currentPersonIndex,
  onPersonChange,
}: MultipleBookingFormProps) {
  const currentBooking = bookings[currentPersonIndex]

  if (!currentBooking) {
    return null
  }

  const handleServiceChange = (service: ISalonService) => {
    onBookingChange(currentPersonIndex, {
      ...currentBooking,
      service,
    })
  }

  const handleSupplementChange = (supplementId: string) => {
    const newSupplements = currentBooking?.supplements.includes(supplementId)
      ? currentBooking.supplements.filter((s) => s !== supplementId)
      : [...currentBooking?.supplements, supplementId]

    onBookingChange(currentPersonIndex, {
      ...currentBooking,
      supplements: newSupplements,
    })
  }

  const handleHairdresserChange = (hairdresser: IHairDresser) => {
    onBookingChange(currentPersonIndex, {
      ...currentBooking,
      hairdresser,
    })
  }

  return (
    <div className="space-y-6">
      {/* Person Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: numberOfPeople }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onPersonChange(idx)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              currentPersonIndex === idx
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Personne {idx + 1}
          </button>
        ))}
      </div>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Service pour Personne {currentPersonIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceChange(service)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  currentBooking?.service?.id === service.id
                    ? 'border-gray-900 bg-gray-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{service.name}</div>
                <div className="text-sm text-gray-600">{service.duration} min</div>
                <div className="text-lg font-bold text-gray-900 mt-2">${service.price}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplements Selection */}
      {supplements && supplements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suppléments (Optionnel)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supplements.map((supplement) => (
              <label key={supplement.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentBooking?.supplements.includes(supplement.id)}
                  onChange={() => handleSupplementChange(supplement.id)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{supplement.name}</div>
                  <div className="text-sm text-gray-600">{supplement.description}</div>
                </div>
                <div className="font-bold text-gray-900">+${supplement.price}</div>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Hairdresser Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Coiffeur (Optionnel)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button className="w-full p-3 border-2 rounded-lg text-left font-semibold transition-all hover:border-gray-300">
            Coiffeur au choix du salon
          </button>
          {hairdressers.map((hairdresser) => (
            <button
              key={hairdresser.id}
              onClick={() => handleHairdresserChange(hairdresser)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                currentBooking?.hairdresser?.id === hairdresser.id
                  ? 'border-gray-900 bg-gray-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{hairdresser.name}</div>
              {hairdresser.speciality && (
                <div className="text-sm text-gray-600">{hairdresser.speciality}</div>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Summary Cart */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 space-y-3">
        <h3 className="font-bold text-gray-900">Résumé pour Personne {currentPersonIndex + 1}</h3>
        <div className="space-y-2 text-sm">
          {currentBooking?.service && (
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-semibold">{currentBooking?.service.name}</span>
            </div>
          )}
          {currentBooking.supplements.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Suppléments:</span>
              <span className="font-semibold">{currentBooking?.supplements.length}</span>
            </div>
          )}
          {currentBooking?.hairdresser && (
            <div className="flex justify-between">
              <span className="text-gray-600">Coiffeur:</span>
              <span className="font-semibold">{currentBooking?.hairdresser.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
