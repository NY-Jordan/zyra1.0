'use client'

import React from 'react'
import { Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { Calendar as DateCalendar } from '@zyra/ui/components/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@zyra/ui/components/popover'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { getEndTime } from './helpers/timeSlots'
import { toast } from 'sonner'

export interface SlotPickerHairdresser {
  id: string
  name: string
  photo?: string | null
  speciality?: string
}

interface SlotPickerProps {
  /** Liste de coiffeurs sélectionnables (optionnel — masqué si non fourni). */
  hairdressers?: SlotPickerHairdresser[]
  hairdresserId: string
  onSelectHairdresser?: (id: string) => void
  date: Date | null
  onSelectDate: (d: Date | null) => void
  time: string | null
  onSelectTime: (t: string | null) => void
  durationMin: number
  slots: string[]
  isFetching: boolean
  workingHours: OpeningHour[]
}

/**
 * Sélecteur de créneau réutilisable : (coiffeur) → date → heure, avec validation
 * de la fin de prestation et récapitulatif. Présentation pure — la donnée vient
 * de useHairdresserSlots.
 */
export default function SlotPicker({
  hairdressers,
  hairdresserId,
  onSelectHairdresser,
  date,
  onSelectDate,
  time,
  onSelectTime,
  durationMin,
  slots,
  isFetching,
  workingHours,
}: SlotPickerProps) {
  const dayIsOpen = (d: Date) => {
    const dayName = d.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
    return !!workingHours.find(h => h.day.toLowerCase() === dayName)?.openDay
  }

  return (
    <div className="space-y-5">
      {/* Coiffeur (optionnel) */}
      {hairdressers && onSelectHairdresser && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Coiffeur</p>
          {hairdressers.length === 0 && (
            <p className="text-[12px] text-slate-400">Aucun coiffeur actif disponible.</p>
          )}
          <div className="space-y-2">
            {hairdressers.map(hd => (
              <button
                key={hd.id}
                type="button"
                onClick={() => { onSelectHairdresser(hd.id); onSelectDate(null); onSelectTime(null) }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  hairdresserId === hd.id
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-[#F0EAE4] dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800/50'
                }`}
              >
                {hd.photo ? (
                  <img src={hd.photo} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                    {hd.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{hd.name}</p>
                  {hd.speciality && <p className="text-[11px] text-slate-400 truncate">{hd.speciality}</p>}
                </div>
                {hairdresserId === hd.id && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date */}
      {hairdresserId && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3.5 h-10 rounded-xl border border-[#E8E0D8] dark:border-slate-700 bg-white dark:bg-slate-800/60 text-[13px] text-left transition-colors hover:border-emerald-300 dark:hover:border-emerald-700"
              >
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {date ? (
                  <span className="text-slate-700 dark:text-slate-200 font-medium">
                    {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                ) : (
                  <span className="text-slate-400">Sélectionner une date</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateCalendar
                mode="single"
                selected={date ?? undefined}
                onSelect={d => { if (d) { onSelectDate(d); onSelectTime(null) } }}
                disabled={d => {
                  const today = new Date(); today.setHours(0, 0, 0, 0)
                  if (d < today) return true
                  return !dayIsOpen(d)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Créneaux */}
      {hairdresserId && date && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Créneau · {durationMin} min
          </p>
          {isFetching ? (
            <div className="flex items-center gap-2 py-3 text-[12px] text-slate-400 dark:text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Vérification des disponibilités…
            </div>
          ) : slots.length === 0 ? (
            <p className="text-[12px] text-amber-600 dark:text-amber-400">
              Aucun créneau disponible pour ce coiffeur à cette date.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => {
                const isSelected = time === slot
                const endTime = getEndTime(slot, durationMin)
                const possible = slots.includes(endTime)
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!possible && !isSelected}
                    onClick={() => {
                      if (!possible) {
                        toast.error(`La prestation finirait à ${endTime}, hors des horaires`)
                        return
                      }
                      onSelectTime(isSelected ? null : slot)
                    }}
                    className={`py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
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
            <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
              <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' · '}{time} → {getEndTime(time, durationMin)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
