'use client'

import React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { Calendar as DateCalendar } from '@zyra/ui/components/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@zyra/ui/components/popover'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { toast } from 'sonner'
import { getBlockedSlots, getEndTime } from '../helpers/timeSlots'
import { FieldLabel } from '../ui/ReservationWizardPrimitives'

interface DateTimeStepProps {
  date: Date | null
  time: string | null
  availableSlots: string[]
  totalDuration: number
  hairdresserId: string
  hairdresserWorkingHours: OpeningHour[]
  onDateChange: (date: Date) => void
  onTimeChange: (time: string | null) => void
}

function isDayClosed(date: Date, workingHours: OpeningHour[]): boolean {
  const dayName = date.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
  const schedule = workingHours.find(h => h.day.toLowerCase() === dayName)
  return !schedule?.openDay
}

export function DateTimeStep({
  date,
  time,
  availableSlots,
  totalDuration,
  hairdresserId,
  hairdresserWorkingHours,
  onDateChange,
  onTimeChange,
}: DateTimeStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Date *</FieldLabel>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3.5 h-10 rounded-xl border border-[#E8E0D8] dark:border-slate-700 bg-white dark:bg-slate-800/60 text-[13px] text-left transition-colors hover:border-emerald-300 dark:hover:border-emerald-700"
            >
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {date
                ? <span className="text-slate-700 dark:text-slate-200 font-medium">
                    {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                : <span className="text-slate-400">Sélectionner une date</span>
              }
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DateCalendar
              mode="single"
              selected={date ?? undefined}
              onSelect={d => { if (d) onDateChange(d) }}
              disabled={d => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return d < today || isDayClosed(d, hairdresserWorkingHours)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {!hairdresserId && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
            Retournez à l&apos;étape précédente pour choisir un coiffeur.
          </p>
        )}
      </div>

      {date && (
        <div>
          <FieldLabel>Créneau * · durée totale : {totalDuration} min</FieldLabel>
          {availableSlots.length === 0 ? (
            <p className="text-[12px] text-amber-600 dark:text-amber-400">
              Aucun créneau disponible pour ce coiffeur à cette date.
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {availableSlots.map(slot => {
                const isSelected = time === slot
                const endTime = getEndTime(slot, totalDuration)
                const possible = availableSlots.includes(slot) && availableSlots.includes(endTime)
                const covered = time
                  ? getBlockedSlots(time, totalDuration).includes(slot) && !isSelected
                  : false

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!possible && !isSelected}
                    title={!possible ? `Fin à ${endTime} — hors horaires` : undefined}
                    onClick={() => {
                      if (!possible) {
                        toast.error(`La prestation finirait à ${endTime}, hors des horaires du coiffeur`)
                        return
                      }
                      onTimeChange(isSelected ? null : slot)
                    }}
                    className={`py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                        : covered
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : !possible
                        ? 'opacity-30 cursor-not-allowed bg-[#F5F2EF] dark:bg-slate-800 border-[#F0EAE4] dark:border-slate-700 text-slate-400'
                        : 'border-[#F0EAE4] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          )}

          {time && (
            <div className="mt-3 px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
              <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' · '}{time} → {getEndTime(time, totalDuration)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
