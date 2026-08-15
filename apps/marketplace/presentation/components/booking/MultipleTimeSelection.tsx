'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'

interface PersonTimeSlot {
  personNumber: number
  date: Date | null
  time: string | null
}

interface MultipleTimeSelectionProps {
  numberOfPeople: number
  timeSlots: PersonTimeSlot[]
  onTimeChange: (personIndex: number, date: Date, time: string) => void
  currentPersonIndex: number
  onPersonChange: (index: number) => void
}

export default function MultipleTimeSelection({
  numberOfPeople,
  timeSlots,
  onTimeChange,
  currentPersonIndex,
  onPersonChange,
}: MultipleTimeSelectionProps) {
  const currentSlot = timeSlots[currentPersonIndex]
  if (!currentSlot) return null;

  const [selectedDate, setSelectedDate] = React.useState<string>(
    currentSlot.date?.toISOString().split('T')[0] ?? ''
  )

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const handleTimeChange = (time: string) => {
    if (selectedDate && currentSlot.date) {
      const newDate = new Date(selectedDate)
      onTimeChange(currentPersonIndex, newDate, time)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Créneaux horaires</h2>
        <p className="text-slate-600">Sélectionnez un créneau pour chaque personne</p>
      </div>

      {/* Person Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: numberOfPeople }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onPersonChange(idx)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              currentPersonIndex === idx
                ? 'bg-[#22C55E] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Personne {idx + 1}
            {timeSlots[idx]?.time && <span className="ml-2">✓</span>}
          </button>
        ))}
      </div>

      {/* Summary Cart */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des créneaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map((slot, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
              >
                <span className="font-semibold text-slate-900">Personne {idx + 1}</span>
                <div className="text-right">
                  {slot.date && slot.time ? (
                    <div>
                      <div className="font-semibold text-slate-900">
                        {slot.date.toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-slate-600">{slot.time}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400">À sélectionner</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date and Time Selection for Current Person */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Heure
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'].map((time) => (
              <button
                key={time}
                onClick={() => handleTimeChange(time)}
                className={`p-2 rounded-lg font-semibold transition-all ${
                  currentSlot.time === time
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
