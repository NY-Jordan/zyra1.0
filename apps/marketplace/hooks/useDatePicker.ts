import { useState, useMemo, useCallback } from 'react'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { isDayClosed as isDayClosedForHours, getEffectiveWorkingHours } from '@zyra/core/usecases/slotsUseCases'

interface UseDatePickerProps {
  openingHours: OpeningHour[]
  hairdresserWorkingHours?: OpeningHour[] | null
}

export function useDatePicker({ openingHours, hairdresserWorkingHours }: UseDatePickerProps) {
  const [visibleMonths, setVisibleMonths] = useState(3)

  // Générer des dates groupées par mois (chargement progressif)
  const datesList = useMemo(() => {
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Générer 90 jours (3 mois) pour le chargement progressif
    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [])

  // Filtrer les dates visibles basées sur le nombre de mois à afficher
  const visibleDates = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setMonth(maxDate.getMonth() + visibleMonths)

    return datesList.filter(date => date <= maxDate)
  }, [datesList, visibleMonths])

  // Vérifier si un jour est fermé (pour le salon ET le coiffeur si sélectionné)
  const isDayClosed = useCallback(
    (date: Date) => isDayClosedForHours(date, getEffectiveWorkingHours(openingHours, hairdresserWorkingHours)),
    [openingHours, hairdresserWorkingHours]
  )

  // Obtenir le jour de la semaine
  const getDayName = useCallback((date: Date) => {
    return date
      .toLocaleDateString('fr-FR', { weekday: 'short' })
      .slice(0, 3)
  }, [])

  // Scroll horizontal
  const scroll = useCallback((direction: 'left' | 'right') => {
    const scrollContainer = document.getElementById('dates-scroll')
    if (scrollContainer) {
      const scrollAmount = 300
      scrollContainer.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })

      // Charger plus de mois quand on scroll à droite
      if (direction === 'right') {
        setTimeout(() => {
          if (
            scrollContainer.scrollLeft >
            scrollContainer.scrollWidth - scrollContainer.clientWidth - 100
          ) {
            setVisibleMonths(prev => prev + 1)
          }
        }, 300)
      }
    }
  }, [])

  // Ouvrir le date picker natif
  const openDatePicker = useCallback((selectedDate: Date | null, onSelectDate: (date: Date) => void) => {
   /*  const input = document.createElement('input')
    input.type = 'date'
    input.value = selectedDate
      ? selectedDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.value) {
        const pickedDate = new Date(target.value)
        pickedDate.setHours(0, 0, 0, 0)
        onSelectDate(pickedDate)
        // Scroll vers la date sélectionnée
        setTimeout(() => {
          const scrollContainer = document.getElementById('dates-scroll')
          if (scrollContainer) {
            const dateButtons = scrollContainer.querySelectorAll('button')
            dateButtons.forEach((btn, idx) => {
              const buttonDate = visibleDates[idx]
              if (
                buttonDate &&
                buttonDate.toDateString() === pickedDate.toDateString()
              ) {
                btn.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'center',
                })
              }
            })
          }
        }, 100)
      }
    }
    input.click() */
  }, [visibleDates])

  return {
    visibleDates,
    isDayClosed,
    getDayName,
    scroll,
    openDatePicker,
    visibleMonths,
  }
}
