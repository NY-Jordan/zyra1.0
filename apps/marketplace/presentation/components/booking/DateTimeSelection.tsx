'use client'

import React, { useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { OpeningHour, ISalonService, ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'
import { useDatePicker } from '@/hooks/useDatePicker'
import { HairDresserSalonAssociation } from '@zyra/conf/domain/entities/hairdressers.entities'
import { getEndTime, getBlockedSlots } from '@zyra/core/usecases/slotsUseCases'

interface DateTimeSelectionProps {
  selectedDate: Date | null
  selectedTime: string | null
  onSelectDate: (date: Date) => void
  onSelectTime: (time: string) => void
  availableSlots: string[]
  openingHours: OpeningHour[]
  selectedService: ISalonService | null
  selectedSupplementIds?: ISalonServiceSupplement[]
  selectedHairdresser: HairDresserSalonAssociation | null
}

export default function DateTimeSelection({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  availableSlots,
  openingHours,
  selectedService,
  selectedSupplementIds = [],
  selectedHairdresser,
}: DateTimeSelectionProps) {
  const { visibleDates, isDayClosed, getDayName, scroll, openDatePicker } = useDatePicker({
    openingHours,
    hairdresserWorkingHours: selectedHairdresser?.workingHours || null,
  })

  const selectedSupplements = useMemo(() => {
    if (!selectedService) return []
    return selectedService.supplements?.filter(s => selectedSupplementIds?.some(sel => sel.id === s.id)) || []
  }, [selectedService, selectedSupplementIds])

  const totalDuration = useMemo(() => {
    if (!selectedService) return 0
    let duration = selectedService.duration || 0
    selectedSupplements.forEach(supplement => { duration += supplement.duration || 0 })
    return duration
  }, [selectedService, selectedSupplements])

  const calculateEndTime = (startTime: string): string => getEndTime(startTime, totalDuration)

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-slate-900">Date et heure</h2>
        <p className="text-[13px] text-slate-500">Sélectionnez le créneau qui vous convient</p>
      </div>

      {/* Unified date + time card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Date picker */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="h-4 w-4 text-slate-900" />
            <p className="text-[13px] font-bold text-slate-700">Sélectionnez une date</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 flex-shrink-0 rounded-xl border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>

            <div id="dates-scroll" className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-1">
                {visibleDates.map((date, idx) => {
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                  const isClosed = isDayClosed(date)
                  return (
                    <button
                      key={idx}
                      disabled={isClosed}
                      onClick={() => onSelectDate(date)}
                      className={`flex-shrink-0 w-[60px] h-[72px] flex flex-col items-center justify-center rounded-xl text-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#22C55E] text-white shadow-md shadow-emerald-500/10'
                          : isClosed
                          ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                          : 'bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border border-transparent text-slate-700 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {getDayName(date)}
                      </span>
                      <span className="text-[18px] font-extrabold mt-0.5">{date.getDate()}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {date.toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 flex-shrink-0 rounded-xl border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Time slots */}
        <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-slate-900" />
          <p className="text-[13px] font-bold text-slate-700">Sélectionnez une heure</p>
          {selectedService && totalDuration > 0 && (
            <span className="ml-auto text-[11px] font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalDuration} min
            </span>
          )}
        </div>

        {!selectedDate ? (
          <div className="h-24 flex items-center justify-center text-[13px] text-slate-400">
            Choisissez d'abord une date
          </div>
        ) : isDayClosed(selectedDate) ? (
          <div className="h-24 flex items-center justify-center text-[13px] text-slate-400">
            Aucun créneau disponible pour ce coiffeur à cette date
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-[13px] text-slate-400">
            Aucun créneau disponible pour cette date
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDate && (
              <p className="text-[12px] text-slate-500">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot
                let isCoveredBySelection = false
                if (selectedTime) {
                  isCoveredBySelection = getBlockedSlots(selectedTime, totalDuration).includes(slot)
                }

                return (
                  <button
                    key={slot}
                    title={isCoveredBySelection && !isSelected ? 'Couvert par la réservation' : ''}
                    className={`h-9 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#22C55E] text-white shadow-sm shadow-emerald-500/10'
                        : isCoveredBySelection
                        ? 'bg-slate-100 text-slate-900 border border-slate-300'
                        : 'bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-600 border border-transparent hover:border-slate-300 hover:scale-105 active:scale-95'
                    }`}
                    onClick={() => onSelectTime(slot)}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-[12px] font-semibold text-emerald-800">
              Réservé pour le{' '}
              {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}{' '}
              de {selectedTime} à {calculateEndTime(selectedTime)}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
