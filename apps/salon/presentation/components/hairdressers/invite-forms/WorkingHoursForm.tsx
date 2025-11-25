'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Clock } from 'lucide-react'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

interface WorkingHours {
  [key: string]: { start: string; end: string; active: boolean }
}

interface WorkingHoursFormProps {
  hairDresser: IHairDresser
  workingDays: string[]
  workingHours: WorkingHours
  onWorkingDayToggle: (dayKey: string) => void
  onHourChange: (dayKey: string, type: 'start' | 'end', value: string) => void
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
]

export default function WorkingHoursForm({
  hairDresser,
  workingDays,
  workingHours,
  onWorkingDayToggle,
  onHourChange
}: WorkingHoursFormProps) {
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Sélectionnez les jours et horaires de travail pour {hairDresser?.name}
      </div>
      
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => (
          <Card key={day.key} className={`transition-all ${
            workingDays.includes(day.key) ? 'ring-1 ring-primary' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={workingDays.includes(day.key)}
                    onChange={() => onWorkingDayToggle(day.key)}
                    className="h-4 w-4"
                  />
                  <label className="font-medium">{day.label}</label>
                </div>
                
                {workingDays.includes(day.key) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="time"
                      value={workingHours[day.key].start}
                      onChange={(e) => onHourChange(day.key, 'start', e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                    <span>à</span>
                    <input
                      type="time"
                      value={workingHours[day.key].end}
                      onChange={(e) => onHourChange(day.key, 'end', e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}