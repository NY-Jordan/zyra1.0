'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Calendar } from '@zyra/ui/components/calendar'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'

interface DateTimeSelectionProps {
  selectedDate: Date | null
  selectedTime: string | null
  onSelectDate: (date: Date) => void
  onSelectTime: (time: string) => void
  availableSlots: string[]
  openingHours: OpeningHour[]
}

export default function DateTimeSelection({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  availableSlots,
  openingHours,
}: DateTimeSelectionProps) {
  // Vérifier si un jour est fermé
  const isDayClosed = (date: Date) => {
    const dayOfWeek = date.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
    const daySchedule = openingHours.find(h => h.day.toLowerCase() === dayOfWeek);
    return !daySchedule || !daySchedule.openDay
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choisissez la date et l'heure</h2>
        <p className="text-gray-600 mt-1">Sélectionnez le créneau qui vous convient</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendrier */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Date</h3>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => date && onSelectDate(date)}
              disabled={(date) => 
                date < new Date(new Date().setHours(0, 0, 0, 0)) || isDayClosed(date)
              }
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Créneaux horaires */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Heure</h3>
            </div>

            {!selectedDate ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p className="text-center">Veuillez d'abord sélectionner une date</p>
              </div>
            ) : isDayClosed(selectedDate) ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p className="text-center">Le salon est fermé ce jour</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p className="text-center">Aucun créneau disponible pour cette date</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? 'default' : 'outline'}
                    className={`${
                      selectedTime === slot
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                    }`}
                    onClick={() => onSelectTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
