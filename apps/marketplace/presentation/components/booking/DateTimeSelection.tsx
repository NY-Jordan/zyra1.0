'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
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
  // Utiliser le hook du date picker avec les horaires du coiffeur sélectionné
  const { visibleDates, isDayClosed, getDayName, scroll, openDatePicker, filterHours } = useDatePicker({
    openingHours,
    hairdresserWorkingHours: selectedHairdresser?.workingHours || null,
  })

  // Récupérer les objets suppléments à partir du service
  const selectedSupplements = useMemo(() => {
    if (!selectedService) return []
    return selectedService.supplements?.filter(s => selectedSupplementIds?.includes(s.id)) || []
  }, [selectedService, selectedSupplementIds])

  // Calculer la durée totale (service + suppléments)
  const totalDuration = useMemo(() => {
    if (!selectedService) return 0
    let duration = selectedService.duration || 0
    selectedSupplements.forEach(supplement => {
      duration += supplement.duration || 0
    })
    return duration
  }, [selectedService, selectedSupplements])

  // Vérifier si une heure est bloquée par la durée du service
  const getBlockedSlots = (startTime: string): string[] => {
    if (totalDuration === 0) return [startTime]
    const blockedSlots = [startTime]
    const [startHour, startMin] = startTime.split(':').map(Number)
    if (startHour === undefined || startMin === undefined) return [startTime]
    let currentHour = startHour
    let currentMin = startMin
    let remainingMinutes = totalDuration
    // Générer les créneaux couverts par la durée
    while (remainingMinutes > 0) {
      remainingMinutes -= 30 // Chaque créneau = 30 min
      if (remainingMinutes >= 0) {
        currentMin += 30
        if (currentMin >= 60) {
          currentMin -= 60
          currentHour += 1
        }
        const slotStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
        blockedSlots.push(slotStr)
      }
    }
    return blockedSlots
  }

  // Calculer l'heure de fin basée sur l'heure de début et la durée
  // Utilise le helper getEndTime de timeHelpers.ts
  const calculateEndTime = (startTime: string): string => {
    return getEndTime(startTime, totalDuration)
  }

  // Vérifier si une heure de réservation est possible
  const isReservationPossible = (startTime: string): { possible: boolean; reason?: string } => {
    const hoursSlots = filterHours(availableSlots, selectedDate)
    // Vérifier que l'heure de début est disponible
    if (!hoursSlots.includes(startTime)) {
      return { possible: false, reason: 'Cette heure de début n\'est pas disponible.' }
    }
    // Vérifier que l'heure de fin est disponible
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choisissez la date et l'heure</h2>
        <p className="text-gray-600 mt-1">Sélectionnez le créneau qui vous convient</p>
      </div>

      {/* Calendrier horizontal */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4 justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Sélectionnez une date</h3>
            </div>
            {/* <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => openDatePicker(selectedDate, onSelectDate)}
            >
              📅 Picker
            </Button> */}
          </div>

          <div className="flex items-center gap-4">
            {/* Bouton gauche */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-12 w-12"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Conteneur de scroll horizontal */}
            <div
              id="dates-scroll"
              className="flex-1 overflow-x-auto scrollbar-hide"
            >
              <div className="flex gap-2 pb-2">
                {visibleDates.map((date, idx) => {
                  const isSelected = selectedDate && 
                    date.toDateString() === selectedDate.toDateString()
                  const isClosed = isDayClosed(date)
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      disabled={isClosed}
                      onClick={() => onSelectDate(date)}
                      className={`flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-105'
                          : isClosed
                          ? 'opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {getDayName(date)}
                      </span>
                      <span className="text-lg font-bold mt-1">
                        {date.getDate()}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {date.toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Bouton droit */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-12 w-12"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Créneaux horaires */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-lg">Sélectionnez une heure</h3>
          </div>

          {!selectedDate ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p className="text-center text-sm">
                👆 Veuillez d'abord sélectionner une date ci-dessus
              </p>
            </div>
          ) : isDayClosed(selectedDate) ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p className="text-center text-sm">❌ Aucun créneau disponible pour ce coiffeur à cette date</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p className="text-center text-sm">
                ❌ Aucun créneau disponible pour cette date
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                📅 {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {selectedService && totalDuration > 0 && (
                <p className="text-xs text-blue-600 font-medium">
                  ⏱️ Durée: {selectedService.duration}min (service) {selectedSupplements.length > 0 ? `+ ${selectedSupplements.reduce((sum, s) => sum + (s.duration || 0), 0)}min (suppléments)` : ''} = <span className="text-lg font-bold">{totalDuration}min</span>
                </p>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {
                filterHours(availableSlots, selectedDate)
                .map((slot) => {
                  const isSelected = selectedTime === slot
                  // Récupérer les créneaux couverts si une heure est sélectionnée
                  let isCoveredBySelection = false
                  if (selectedTime) {
                    const selectedBlockedSlots = getBlockedSlots(selectedTime)
                    isCoveredBySelection = selectedBlockedSlots.includes(slot)
                  }
                  // Récupérer les créneaux qui seraient bloqués si on sélectionnait ce créneau
                  const wouldBlockSlots = getBlockedSlots(slot)
                  const isBlockedIfSelected = !isSelected && wouldBlockSlots.some(bs => !availableSlots.includes(bs) && bs !== slot)
                  const isSlotAvailable = availableSlots.includes(slot)
                  return (
                    <Button
                      key={slot}
                      variant="outline"
                      size="sm"
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
                      className={`transition-all ${
                        isSelected
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                          : isCoveredBySelection
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                          : isBlockedIfSelected
                          ? 'opacity-50 cursor-not-allowed bg-yellow-100 border-yellow-300'
                          : !isSlotAvailable
                          ? 'opacity-30 cursor-not-allowed bg-gray-100'
                          : 'hover:border-green-300 hover:bg-green-50'
                      }`}
                      onClick={() => {
                        if ((isSlotAvailable) || isSelected) {
                          const validation = isReservationPossible(slot)
                          if (!validation.possible) {
                            setErrorModal({
                              show: true,
                              message: 'Créneau non disponible',
                              reason: validation.reason || 'Ce créneau ne peut pas être sélectionné',
                            })
                          } else {
                            onSelectTime(slot)
                          }
                        }
                      }}
                    >
                      {slot}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Résumé du choix */}
          {selectedDate && selectedTime && (
            <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
              <p className="text-sm font-semibold text-green-900">
                ✓ Réservation confirmée pour le{' '}
                <span className="text-green-700">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })} 
                  <br />
                  de {selectedTime} à {calculateEndTime(selectedTime)}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Modal */}
      <ErrorModal
        show={errorModal.show}
        message={errorModal.message}
        reason={errorModal.reason}
        onClose={() => setErrorModal({ show: false, message: '', reason: '' })}
      />
    </div>
  )
}
