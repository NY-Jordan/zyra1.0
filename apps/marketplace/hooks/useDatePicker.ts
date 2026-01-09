import { useState, useMemo, useCallback } from 'react'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'

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
    (date: Date) => {
      const dayOfWeek = date
        .toLocaleDateString('en-EN', { weekday: 'long' })
        .toLowerCase()
      // Vérifier les horaires du salon
      const salonSchedule = openingHours.find(h => h.day.toLowerCase() === dayOfWeek)
      if (!salonSchedule || !salonSchedule.openDay) {
        return true // Le salon est fermé ce jour
      }
      // Si un coiffeur est sélectionné, vérifier ses horaires aussi
      if (hairdresserWorkingHours && hairdresserWorkingHours.length > 0) {
        const hairdresserSchedule = hairdresserWorkingHours.find(
          h => h.day.toLowerCase() === dayOfWeek
        )
        if (!hairdresserSchedule || !hairdresserSchedule.openDay) {
          return true // Le coiffeur ne travaille pas ce jour
        }
      }
      return false
    },
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

  // Filtrer les heures passées pour la date d'aujourd'hui
  const filterPassedHours = useCallback((slots: string[], selectedDate: Date | null) => {
    if (!selectedDate) return slots
    // Créer deux instances: une pour la date normalisée, une pour l'heure actuelle
    const today = new Date()
    const todayNormalized = new Date()
    todayNormalized.setHours(0, 0, 0, 0)
    const selectedDateNormalized = new Date(selectedDate)
    selectedDateNormalized.setHours(0, 0, 0, 0)
    // Si la date sélectionnée n'est pas aujourd'hui, retourner tous les slots
    if (selectedDateNormalized.getTime() !== todayNormalized.getTime()) {
      return slots
    }
    // Si c'est aujourd'hui, filtrer les heures passées
    const currentHour = today.getHours()
    const currentMinutes = today.getMinutes()
    return slots.filter(slot => {
      const [slotHour, slotMinutes] = slot.split(':').map(Number)
      if(!slotHour && slotHour !== 0 || !slotMinutes && slotMinutes !== 0) return false
      return slotHour > currentHour || (slotHour === currentHour && slotMinutes > currentMinutes)
    })
  }, []);


  const filterHairDresserHours = useCallback((slots: string[], selectedDate: Date | null) => {
    if (!selectedDate || !hairdresserWorkingHours || hairdresserWorkingHours.length === 0) {
      return slots
    }
    // Obtenir le jour de la semaine pour la date sélectionnée
    const dayOfWeek = selectedDate
      .toLocaleDateString('en-EN', { weekday: 'long' })
      .toLowerCase()

    const hairdresserSchedule = hairdresserWorkingHours.find(
      h => h.day.toLowerCase() === dayOfWeek
    )
    // Si le coiffeur ne travaille pas ce jour, retourner un tableau vide
    if (!hairdresserSchedule || !hairdresserSchedule.openDay) {
      return []
    }

    // Filtrer les slots en fonction des horaires de travail du coiffeur
    return slots.filter(slot => {
      const [slotHour, slotMinutes] = slot.split(':').map(Number)
      if (slotHour === undefined || slotMinutes === undefined) return false
      // Convertir le slot en minutes
      const slotTime = slotHour * 60 + slotMinutes
      // Convertir les horaires du coiffeur en minutes (même base)
      let openTime = 0
      if (hairdresserSchedule.open) {
        const [openHour, openMin] = hairdresserSchedule.open.split(':').map(Number)
        openTime = (openHour || 0) * 60 + (openMin || 0)
      }
      let closeTime = 1439 // 23:59 par défaut
      if (hairdresserSchedule.close) {
        const [closeHour, closeMin] = hairdresserSchedule.close.split(':').map(Number)
        closeTime = (closeHour || 23) * 60 + (closeMin || 0)
      }
      return slotTime >= openTime && slotTime <= closeTime
    })
  }, [hairdresserWorkingHours])


  function filterHours(slots: string[], selectedDate: Date | null) {
     const passedHours = filterPassedHours(slots, selectedDate)
     const data =  filterHairDresserHours(passedHours, selectedDate);
     return data
  }

  return {
    visibleDates,
    isDayClosed,
    getDayName,
    scroll,
    openDatePicker,
    visibleMonths,
    filterPassedHours,
    filterHours
  }
}
