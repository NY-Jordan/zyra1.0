'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Components
import {
  BookingHeader,
  BookingNavigation,
  SingleReservationFlow,
  MultipleReservationFlow,
  MobileDrawer,
  DesktopSidebar,
} from '../../../presentation/components/booking/Process'

// Types
import { Booking } from './types'
import { useBookingReducerHook } from '@/hooks/useBookingReducerHook'
import { useBookingValidation } from '@/hooks/useBookingValidation'
import { useReservationSave } from '@/hooks/useReservationSave'
import { useAvailableSlots, useHairdressersData, useSalonData } from '@/hooks/useData'
import { getEndTime, addMinutesToDate } from '@/lib/timeHelpers'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const salonId = params.id as string

  // State management with reducer
  const bookingState = useBookingReducerHook()
  const { state } = bookingState
  const { canGoNext, handleNext: handleNavigateNext, handlePrevious: handleNavigatePrevious } = useBookingValidation()

  // Reservation hook - MUST be at component level
  const { createAndSaveReservation } = useReservationSave()

  // Data fetching
  const currentBooking = state.multipleBookings[state.currentPersonIndex]
  const { data: salon, isLoading: loadingSalon } = useSalonData(salonId)
  const { data: hairdressersData, isLoading: loadingHairdressers } = useHairdressersData(
    salonId,
    currentBooking?.service
  )
  const availableSlots = useAvailableSlots(salon || null, currentBooking?.date || null)
  
  // Hairdressers formatting
  const hairdressers = hairdressersData

  // Handlers for single booking
  const handleSelectBooking = (index: number) => {
    bookingState.setCurrentPersonIndex(index)
    bookingState.setCurrentStep(2)
  }

  // Handlers for multiple booking
  const handleDeleteBooking = (index: number) => {
    bookingState.deleteBooking(index)
  }

  const handleAddPerson = () => {
    const newBooking: Booking = {
      personNumber: state.multipleBookings.length + 1,
      service: null,
      supplements: [],
      hairdresser: null,
      date: null,
      time: null,
    }
    bookingState.addBooking(newBooking)
    bookingState.setCurrentPersonIndex(state.currentPersonIndex + 1)
    bookingState.resetCurrentPersonState()
    bookingState.setCurrentStep(2)
  }

  const handleFinalize = () => {
    bookingState.setCurrentStep(8)
  }

  // Navigation handlers
  const handleMultipleDateSelect = (date: Date) => {
    bookingState.updateCurrentBooking({ date })
  }

  const handleMultipleSupplementToggle = (supplement: ISalonServiceSupplement) => {
    const currentBooking = state.multipleBookings[state.currentPersonIndex]
    if (!currentBooking) return
    const newSupplements = currentBooking.supplements.includes(supplement)
      ? currentBooking.supplements.filter((sups: ISalonServiceSupplement) => sups.id !== supplement.id)
      : [...currentBooking.supplements, supplement]
      console.log(newSupplements);
    bookingState.updateCurrentBooking({ supplements: newSupplements })
  }

  const handleServiceSelect = (service: any) => {
    bookingState.updateCurrentBooking({ service })
    setTimeout(() => bookingState.setCurrentStep(3), 300)
  }

  const handleHairdresserSelect = (hairdresser: any) => {
    bookingState.updateCurrentBooking({ hairdresser })
    setTimeout(() => bookingState.setCurrentStep(5), 300)
  }

  const handleTimeSelect = (time: string) => {
    bookingState.updateCurrentBooking({ time })
  }

  const handleNext = () => {
    const canContinue = canGoNext(
      state.reservationType,
      state.currentStep,
      state.currentPersonIndex,
      state.multipleBookings
    )
    handleNavigateNext(
      canContinue,
      state.currentStep,
      state.reservationType,
      bookingState.setCurrentStep
    )
  }

  const handlePrev = () => {
    handleNavigatePrevious(
      state.currentStep,
      state.reservationType,
      state.currentPersonIndex,
      bookingState.setCurrentStep,
      bookingState.setCurrentPersonIndex
    )
  }

  const handleSubmit = async () => {
    const currentBooking = state.multipleBookings[state.currentPersonIndex]
    const clientInfoComplete = state.clientInfo.clientName.trim() !== '' && state.clientInfo.clientPhone.trim() !== ''
    
    if (!currentBooking || !clientInfoComplete) {
      toast.error('Veuillez compléter tous les champs obligatoires')
      return
    }

    try {
      // Construire le tableau avec les heures de début et fin
      const bookingsWithTimes = state.multipleBookings.map(booking => {
        const startDate = new Date(booking.date!)
        const [hour, minute] = booking.time!.split(':').map(Number)
        startDate.setHours(hour || 0, minute || 0, 0, 0)
        console.log(booking);
        // Calculer la durée totale pour l'heure de fin
        const totalDuration = (booking.service?.duration || 0) + 
          booking.supplements.reduce((sum, suppId) => {
            const supplement = booking.service?.supplements?.find(s => s.id === suppId)
            return sum + (supplement?.duration || 0)
          }, 0)
        // Utiliser le helper addMinutesToDate pour calculer l'heure de fin
        const endDate = addMinutesToDate(startDate, totalDuration)
        return {
          booking,
          scheduledAt: startDate,
          endsAt: endDate,
        }
      })

      // Utiliser createAndSaveReservation directement (hook appelé au niveau du composant)
      const result = await createAndSaveReservation(
        salonId,
        bookingsWithTimes,
        {
          clientName: state.clientInfo.clientName,
          clientPhone: state.clientInfo.clientPhone,
          clientEmail: state.clientInfo.clientEmail,
          notes : state.clientInfo.notes,
          userId: null, // À adapter selon l'auth
        },
        state.reservationType === 'single'
      )
      if (result.success) {
        toast.success(`Réservation #${result.reservationId} créée avec succès!`)
        router.push('/')
      } else {
        toast.error(result.error || 'Erreur lors de la création de la réservation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création de la réservation')
    }
  }

  const isLoading = loadingSalon || loadingHairdressers

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <BookingHeader
        salon={salon || null}
        currentStep={state.currentStep}
        isLoading={isLoading}
        onPrevious={handlePrev}
      />

      {!isLoading && salon && (
        <div className="container mx-auto px-4">
          {state.reservationType === 'multiple' ? (
            <>
              {/* Mobile Drawer */}
              <MobileDrawer
                multipleBookings={state.multipleBookings}
                currentPersonIndex={state.currentPersonIndex}
                currentStep={state.currentStep}
                onSelectBooking={handleSelectBooking}
                onDeleteBooking={handleDeleteBooking}
              />

              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* Main content */}
                <div className="lg:col-span-4">
                  <div className="mt-8 mb-8">
                    <MultipleReservationFlow
                      salon={salon}
                      currentStep={state.currentStep}
                      currentPersonIndex={state.currentPersonIndex}
                      multipleBookings={state.multipleBookings}
                      availableSlots={availableSlots}
                      hairdressers={hairdressers}
                      reservationType={state.reservationType}
                      clientInfo={state.clientInfo}
                      onSelectReservationType={(type) => {
                        bookingState.setReservationType(type)
                        setTimeout(() => bookingState.setCurrentStep(2), 300)
                      }}
                      onSelectService={handleServiceSelect}
                      onToggleSupplement={handleMultipleSupplementToggle}
                      onSelectHairdresser={handleHairdresserSelect}
                      onSelectDate={handleMultipleDateSelect}
                      onSelectTime={handleTimeSelect}
                      onChangeClientInfo={bookingState.updateClientInfo}
                      onAddPerson={handleAddPerson}
                      onFinalize={handleFinalize}
                    />
                  </div>

                  {/* Navigation */}
                  <BookingNavigation
                    currentStep={state.currentStep}
                    reservationType={state.reservationType}
                    canGoNext={canGoNext(
                      state.reservationType,
                      state.currentStep,
                      state.currentPersonIndex,
                      state.multipleBookings
                    )}
                    isLastStep={state.currentStep === 7}
                    onPrevious={handlePrev}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    disablePrevious={state.currentStep === 1 || state.currentStep === 7}
                  />
                </div>

                {/* Sidebar */}
                <DesktopSidebar
                  multipleBookings={state.multipleBookings}
                  currentPersonIndex={state.currentPersonIndex}
                  currentStep={state.currentStep}
                  onSelectBooking={handleSelectBooking}
                  onDeleteBooking={handleDeleteBooking}
                />
              </div>
            </>
          ) : (
            <>
              <div className="max-w-4xl mx-auto">
                <div className="mt-8 mb-8">
                  <SingleReservationFlow
                    salon={salon}
                    currentStep={state.currentStep}
                    currentPersonIndex={state.currentPersonIndex}
                    multipleBookings={state.multipleBookings}
                    availableSlots={availableSlots}
                    hairdressers={hairdressers}
                    reservationType={state.reservationType}
                    clientInfo={state.clientInfo}
                    onSelectReservationType={(type) => {
                      bookingState.setReservationType(type)
                      setTimeout(() => bookingState.setCurrentStep(2), 300)
                    }}
                    onSelectService={handleServiceSelect}
                    onToggleSupplement={handleMultipleSupplementToggle}
                    onSelectHairdresser={handleHairdresserSelect}
                    onSelectDate={handleMultipleDateSelect}
                    onSelectTime={handleTimeSelect}
                    onChangeClientInfo={bookingState.updateClientInfo}
                  />
                </div>

                {/* Navigation */}
                <BookingNavigation
                  currentStep={state.currentStep}
                  reservationType={state.reservationType}
                  canGoNext={canGoNext(
                    state.reservationType,
                    state.currentStep,
                    state.currentPersonIndex,
                    state.multipleBookings
                  )}
                  isLastStep={state.currentStep === 6}
                  onPrevious={handlePrev}
                  onNext={handleNext}
                  onSubmit={handleSubmit}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
