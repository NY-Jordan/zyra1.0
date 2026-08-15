'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Clock } from 'lucide-react'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { DAYS_OF_WEEK } from '@zyra/conf/lib/utils'

interface WorkingHoursFormProps {
  hairDresser: IHairDresser
  workingHours: OpeningHour[]
  onWorkingDayToggle: (dayKey: string) => void
  onHourChange: (dayKey: string, type: 'open' | 'close', value: string) => void
  onBreakToggle?: (dayKey: string) => void
  onBreakChange?: (dayKey: string, type: 'start' | 'end', value: string) => void
  salonOpeningHours?: OpeningHour[]
}


export default function WorkingHoursForm({
  hairDresser,
  workingHours,
  onWorkingDayToggle,
  onHourChange,
  onBreakToggle,
  onBreakChange,
  salonOpeningHours
}: WorkingHoursFormProps) {
  // Convertir format HH:MM en format français HH:MM (24h)
  const formatTimeToFrench = (time: string): string => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    return `${hours}h${minutes}`
  }

  // Obtenir les heures du salon pour le jour spécifié
  const getSalonHoursForDay = (dayKey: string) => {
    const salonDay = salonOpeningHours?.find(oh => oh.day === dayKey)
    if (!salonDay || !salonDay.openDay) return { minHour: 0, maxHour: 23 }
    const minHour = parseInt(salonDay.open.split(':')[0])
    const maxHour = parseInt(salonDay.close.split(':')[0])
    return { minHour, maxHour }
  }
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Sélectionnez les jours et horaires de travail pour {hairDresser?.name}
      </div>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const dayHours = workingHours.find(wh => wh.day === day.key)
          const isChecked = dayHours?.openDay || false
          const salonDay = salonOpeningHours?.find(oh => oh.day === day.key)
          const isSalonOpen = salonDay?.openDay || false
          const salonHours = getSalonHoursForDay(day.key)
          
          return (
            <Card key={day.key} className={`transition-all ${
              isChecked ? 'ring-1 ring-primary' : ''
            } ${!isSalonOpen ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onWorkingDayToggle(day.key)}
                      disabled={!isSalonOpen}
                      className="h-4 w-4 disabled:opacity-50"
                    />
                    <div>
                      <label className="font-medium">{day.label}</label>
                      {isSalonOpen && (
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          Salon: {formatTimeToFrench(salonDay?.open || '')} - {formatTimeToFrench(salonDay?.close || '')}
                        </p>
                      )}
                      {!isSalonOpen && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">Salon fermé ce jour</p>
                      )}
                    </div>
                  </div>

                  {isChecked && isSalonOpen && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatTimeToFrench(dayHours?.open || '09:00')}</span>
                      <span>à</span>
                      <span className="font-medium">{formatTimeToFrench(dayHours?.close || '18:00')}</span>
                      <div className="ml-2 flex gap-2">
                        <input
                          type="number"
                          min={salonHours.minHour}
                          max={salonHours.maxHour}
                          value={dayHours?.open ? parseInt(dayHours.open.split(':')[0]) : ''}
                          onChange={(e) => {
                            const hour = e.target.value.padStart(2, '0')
                            const minutes = dayHours?.open?.split(':')[1] || '00'
                            onHourChange(day.key, 'open', `${hour}:${minutes}`)
                          }}
                          className="border rounded px-2 py-1 text-xs w-16 placeholder-gray-400"
                          placeholder="09"
                          title={formatTimeToFrench(dayHours?.open || '09:00')}
                        />
                        <input
                          type="number"
                          min={salonHours.minHour}
                          max={salonHours.maxHour}
                          value={dayHours?.close ? parseInt(dayHours.close.split(':')[0]) : ''}
                          onChange={(e) => {
                            const hour = e.target.value.padStart(2, '0')
                            const minutes = dayHours?.close?.split(':')[1] || '00'
                            onHourChange(day.key, 'close', `${hour}:${minutes}`)
                          }}
                          className="border rounded px-2 py-1 text-xs w-16 placeholder-gray-400"
                          placeholder="18"
                          title={formatTimeToFrench(dayHours?.close || '18:00')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isChecked && isSalonOpen && onBreakToggle && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={!!dayHours?.breaks?.length}
                        onChange={() => onBreakToggle(day.key)}
                        className="h-3.5 w-3.5"
                      />
                      Pause
                    </label>
                    {!!dayHours?.breaks?.length && (
                      <div className="flex items-center gap-2 text-sm pl-6">
                        <input
                          type="time"
                          value={dayHours.breaks[0]!.start}
                          onChange={(e) => onBreakChange?.(day.key, 'start', e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                        />
                        <span className="text-muted-foreground">à</span>
                        <input
                          type="time"
                          value={dayHours.breaks[0]!.end}
                          onChange={(e) => onBreakChange?.(day.key, 'end', e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}