import { useState, useCallback } from 'react'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { Booking, ClientInfo, ReservationType } from '../app/booking/[id]/types'
import { toast } from 'sonner'

const initialBooking: Booking = {
  personNumber: 1,
  service: null,
  supplements: [],
  hairdresser: null,
  date: null,
  time: null,
}

const initialClientInfo: ClientInfo = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  notes: '',
}

export const useBookingState = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [reservationType, setReservationType] = useState<ReservationType>(null)
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0)
  
  // Single reservation states
  const [selectedService, setSelectedService] = useState<ISalonService | null>(null)
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([])
  const [selectedHairdresser, setSelectedHairdresser] = useState<IHairDresser | null>(null)
  const [hairdresserSelectionMade, setHairdresserSelectionMade] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  // Multiple reservation states
  const [multipleBookings, setMultipleBookings] = useState<Booking[]>([initialBooking])
  const [clientInfo, setClientInfo] = useState<ClientInfo>(initialClientInfo)

  const handleToggleSupplement = useCallback((supplementId: string) => {
    setSelectedSupplements(prev => 
      prev.includes(supplementId)
        ? prev.filter(id => id !== supplementId)
        : [...prev, supplementId]
    )
  }, [])

  const handleServiceSelect = useCallback((service: ISalonService) => {
    if (reservationType === 'multiple') {
      const newBookings = [...multipleBookings]
      newBookings[currentPersonIndex] = {
        ...newBookings[currentPersonIndex],
        service,
      }
      setMultipleBookings(newBookings)
      setTimeout(() => setCurrentStep(3), 300)
    } else {
      setSelectedService(service)
      setTimeout(() => setCurrentStep(3), 300)
    }
  }, [reservationType, multipleBookings, currentPersonIndex])

  const handleHairdresserSelect = useCallback((hairdresser: IHairDresser | null) => {
    if (reservationType === 'multiple') {
      const newBookings = [...multipleBookings]
      newBookings[currentPersonIndex] = {
        ...newBookings[currentPersonIndex],
        hairdresser,
      }
      setMultipleBookings(newBookings)
      setHairdresserSelectionMade(true)
      setTimeout(() => setCurrentStep(5), 300)
    } else {
      setSelectedHairdresser(hairdresser)
      setHairdresserSelectionMade(true)
      setTimeout(() => setCurrentStep(5), 300)
    }
  }, [reservationType, multipleBookings, currentPersonIndex])

  const handleTimeSelect = useCallback((time: string) => {
    if (reservationType === 'multiple') {
      const newBookings = [...multipleBookings]
      newBookings[currentPersonIndex] = {
        ...newBookings[currentPersonIndex],
        time,
      }
      setMultipleBookings(newBookings)
      setTimeout(() => setCurrentStep(7), 300)
    } else {
      setSelectedTime(time)
      setTimeout(() => setCurrentStep(6), 300)
    }
  }, [reservationType, multipleBookings, currentPersonIndex])

  const handleClientInfoChange = useCallback((field: string, value: string) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }))
  }, [])

  return {
    currentStep,
    setCurrentStep,
    reservationType,
    setReservationType,
    numberOfPeople,
    setNumberOfPeople,
    currentPersonIndex,
    setCurrentPersonIndex,
    selectedService,
    setSelectedService,
    selectedSupplements,
    setSelectedSupplements,
    selectedHairdresser,
    setSelectedHairdresser,
    hairdresserSelectionMade,
    setHairdresserSelectionMade,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    multipleBookings,
    setMultipleBookings,
    clientInfo,
    setClientInfo,
    handleToggleSupplement,
    handleServiceSelect,
    handleHairdresserSelect,
    handleTimeSelect,
    handleClientInfoChange,
  }
}
