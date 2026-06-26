'use client'

import React, { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { OpeningHour, ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import ErrorModal from './ErrorModal'
import { useDatePicker } from '@/hooks/useDatePicker'
import { HairDresserSalonAssociation } from '@zyra/conf/domain/entities/hairdressers.entities'
import { getEndTime } from '@/lib/timeHelpers'

interface DateTimeSelectionProps {
  selectedDate: Date | null
  selectedTime: string | null
  onSelectDate: (date: Date) => void
  onSelectTime: (time: string) => void
  availableSlots: string[]
  openingHours: OpeningHour[]
  selectedService: ISalonService | null
  selectedSupplementIds?: string[]
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
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string; reason: string }>({
    show: false,
    message: '',
    reason: '',
  })

  const { visibleDates, isDayClosed, getDayName, scroll, openDatePicker, filterHours } = useDatePicker({
    openingHours,
    hairdresserWorkingHours: selectedHairdresser?.workingHours || null,
  })

  const selectedSupplements = useMemo(() => {
    if (!selectedService) return []
    return selectedService.supplements?.filter(s => selectedSupplementIds?.includes(s.id)) || []
  }, [selectedService, selectedSupplementIds])

  const totalDuration = useMemo(() => {
    if (!selectedService) return 0
    let duration = selectedService.duration || 0
    selectedSupplements.forEach(supplement => { duration += supplement.duration || 0 })
    return duration
  }, [selectedService, selectedSupplements])

  const getBlockedSlots = (startTime: string): string[] => {
    if (totalDuration === 0) return [startTime]
    const blockedSlots = [startTime]
    const [startHour, startMin] = startTime.split(':').map(Number)
    if (startHour === undefined || startMin === undefined) return [startTime]
    let currentHour = startHour
    let currentMin = startMin
    let remainingMinutes = totalDuration
    while (remainingMinutes > 0) {
      remainingMinutes -= 30
      if (remainingMinutes >= 0) {
        currentMin += 30
        if (currentMin >= 60) { currentMin -= 60; currentHour += 1 }
        const slotStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
        blockedSlots.push(slotStr)
      }
    }
    return blockedSlots
  }

  const calculateEndTime = (startTime: string): string => getEndTime(startTime, totalDuration)

  const isReservationPossible = (startTime: string): { possible: boolean; reason?: string } => {
    const hoursSlots = filterHours(availableSlots, selectedDate)
    if (!hoursSlots.includes(startTime)) {
      return { possible: false, reason: "Cette heure de début n'est pas disponible." }
    }
    const endTime = calculateEndTime(startTime)
    if (!hoursSlots.includes(endTime)) {
      return {
        possible: false,
        reason: `La réservation se terminerait à ${endTime}, qui n'est pas disponible. Veuillez choisir une autre heure.`,
      }
    }
    return { possible: true }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-slate-800">Date et heure</h2>
        <p className="text-[13px] text-slate-500">Sélectionnez le créneau qui vous convient</p>
      </div>

      {/* Date picker */}
      <div className="bg-white rounded-2xl border border-[#F0EAE4] p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="h-4 w-4 text-emerald-500" />
          <p className="text-[13px] font-bold text-slate-700">Sélectionnez une date</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 flex-shrink-0 rounded-xl border border-[#E8E0D8] flex items-center justify-center hover:bg-[#F5F2EF] transition-colors"
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
                    className={`flex-shrink-0 w-[60px] h-[72px] flex flex-col items-center justify-center rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : isClosed
                        ? 'opacity-40 cursor-not-allowed bg-[#F8F4F0] text-slate-400'
                        : 'bg-[#F8F4F0] hover:bg-emerald-50 hover:border-emerald-200 border border-transparent text-slate-700'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {getDayName(date)}
                    </span>
                    <span className="text-[18px] font-extrabold mt-0.5">{date.getDate()}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {date.toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 flex-shrink-0 rounded-xl border border-[#E8E0D8] flex items-center justify-center hover:bg-[#F5F2EF] transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Time slots */}
      <div className="bg-white rounded-2xl border border-[#F0EAE4] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-emerald-500" />
          <p className="text-[13px] font-bold text-slate-700">Sélectionnez une heure</p>
          {selectedService && totalDuration > 0 && (
            <span className="ml-auto text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
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
              {filterHours(availableSlots, selectedDate).map((slot) => {
                const isSelected = selectedTime === slot
                let isCoveredBySelection = false
                if (selectedTime) {
                  isCoveredBySelection = getBlockedSlots(selectedTime).includes(slot)
                }
                const wouldBlockSlots = getBlockedSlots(slot)
                const isBlockedIfSelected = !isSelected && wouldBlockSlots.some(bs => !availableSlots.includes(bs) && bs !== slot)
                const isSlotAvailable = availableSlots.includes(slot)

                return (
                  <button
                    key={slot}
                    disabled={!isSlotAvailable && !isCoveredBySelection && !isSelected}
                    title={
                      isBlockedIfSelected
                        ? 'Ce créneau bloquerait des heures non disponibles'
                        : isCoveredBySelection && !isSelected
                        ? 'Couvert par la réservation'
                        : !isSlotAvailable && !isCoveredBySelection
                        ? 'Créneau non disponible'
                        : ''
                    }
                    className={`h-9 rounded-xl text-[12px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                        : isCoveredBySelection
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : isBlockedIfSelected
                        ? 'opacity-50 cursor-not-allowed bg-amber-50 border border-amber-200 text-amber-600'
                        : !isSlotAvailable
                        ? 'opacity-30 cursor-not-allowed bg-[#F8F4F0] text-slate-400'
                        : 'bg-[#F8F4F0] hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-transparent hover:border-emerald-200'
                    }`}
                    onClick={() => {
                      if (isSlotAvailable || isSelected) {
                        const validation = isReservationPossible(slot)
                        if (!validation.possible) {
                          setErrorModal({ show: true, message: 'Créneau non disponible', reason: validation.reason || 'Ce créneau ne peut pas être sélectionné' })
                        } else {
                          onSelectTime(slot)
                        }
                      }
                    }}
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

      <ErrorModal
        show={errorModal.show}
        message={errorModal.message}
        reason={errorModal.reason}
        onClose={() => setErrorModal({ show: false, message: '', reason: '' })}
      />
    </div>
  )
}
