import { useCallback } from 'react'
import { ReservationType } from '../app/booking/[id]/types'
import { toast } from 'sonner'

export const useBookingValidation = () => {
  const canGoNext = useCallback((
    reservationType: ReservationType,
    currentStep: number,
    currentPersonIndex: number,
    multipleBookings: any[]
  ) => {
    const currentBooking = multipleBookings[currentPersonIndex]
    if (!currentBooking) return false

    if (reservationType === 'single') {
      switch (currentStep) {
        case 1:
          return reservationType !== null
        case 2:
          return !!currentBooking.service
        case 3:
          return true // Suppléments optionnels
        case 4:
          return currentBooking.hairdresser !== null
        case 5:
          return !!currentBooking.date && !!currentBooking.time
        case 6:
          return true // Client info validation elsewhere
        default:
          return false
      }
    } else if (reservationType === 'multiple') {
      switch (currentStep) {
        case 1:
          return true // Choix du type fait
        case 2:
          return !!currentBooking.service
        case 3:
          return true // Suppléments optionnels
        case 4:
          return currentBooking.hairdresser !== null
        case 5:
          return !!currentBooking.date && !!currentBooking.time
        case 7:
          return true
        case 8:
          return true // Client info validation elsewhere
        default:
          return false
      }
    }
    return false
  }, [])

  const handleNext = useCallback((
    canGo: boolean,
    currentStep: number,
    reservationType: ReservationType,
    setCurrentStep: (step: number) => void
  ) => {
    if (!canGo) {
      toast.error('Veuillez compléter cette étape avant de continuer')
      return
    }
    if (currentStep < (reservationType === 'single' ? 6 : 8)) {
      setCurrentStep(currentStep + 1)
    }
  }, [])

  const handlePrevious = useCallback((
    currentStep: number,
    reservationType: ReservationType,
    currentPersonIndex: number,
    setCurrentStep: (step: number) => void,
    setCurrentPersonIndex: (index: number) => void
  ) => {
    if (currentStep > 1) {
      if (reservationType === 'multiple' && currentStep === 2 && currentPersonIndex > 0) {
        setCurrentPersonIndex(currentPersonIndex - 1)
        setCurrentStep(5)
      } else {
        setCurrentStep(currentStep - 1)
      }
    }
  }, [])

  return { canGoNext, handleNext, handlePrevious }
}
