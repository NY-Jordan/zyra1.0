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
import StepIndicator from '../../../presentation/components/booking/StepIndicator'
import './booking.css'

// Types
import { Booking } from './types'
import { useBookingReducerHook } from '@/hooks/useBookingReducerHook'
import { useBookingValidation } from '@/hooks/useBookingValidation'
import { useReservationSave } from '@/hooks/useReservationSave'
import { useAvailableSlots, useHairdressersData, useSalonData } from '@/hooks/useData'
import { useOccupiedSlots } from '@/hooks/useOccupiedSlots'
import { getEndTime, addMinutesToDate } from '@/lib/timeHelpers'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'

const SINGLE_STEPS = [
  { number: 1, title: 'Type' },
  { number: 2, title: 'Service' },
  { number: 3, title: 'Options' },
  { number: 4, title: 'Coiffeur' },
  { number: 5, title: 'Horaire' },
  { number: 6, title: 'Infos' },
]

const MULTIPLE_STEPS = [
  { number: 1, title: 'Type' },
  { number: 2, title: 'Service' },
  { number: 3, title: 'Options' },
  { number: 4, title: 'Coiffeur' },
  { number: 5, title: 'Horaire' },
  { number: 6, title: 'Infos' },
  { number: 7, title: 'Résumé' },
  { number: 8, title: 'Confirmer' },
]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const salonId = params.id as string
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const bookingState = useBookingReducerHook()
  const { state } = bookingState
  const { canGoNext, handleNext: handleNavigateNext, handlePrevious: handleNavigatePrevious } = useBookingValidation()

  const { createAndSaveReservation } = useReservationSave()

  const currentBooking = state.multipleBookings[state.currentPersonIndex]
  const { data: salon, isLoading: loadingSalon } = useSalonData(salonId)
  const { data: hairdressersData, isLoading: loadingHairdressers } = useHairdressersData(
    salonId,
    currentBooking?.service
  )
  const openingSlots = useAvailableSlots(salon || null, currentBooking?.date || null)
  const occupiedSlots = useOccupiedSlots(salonId, currentBooking?.date || null, currentBooking?.hairdresser || null)
  // Créneaux réellement disponibles = ouverture − déjà réservés (temps réel)
  const availableSlots = React.useMemo(
    () => openingSlots.filter(s => !occupiedSlots.has(s)),
    [openingSlots, occupiedSlots],
  )
  const hairdressers = hairdressersData

  const handleSelectBooking = (index: number) => {
    bookingState.setCurrentPersonIndex(index)
    bookingState.setCurrentStep(2)
  }

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

  const handleMultipleDateSelect = (date: Date) => {
    bookingState.updateCurrentBooking({ date })
  }

  const handleMultipleSupplementToggle = (supplement: ISalonServiceSupplement) => {
    const currentBooking = state.multipleBookings[state.currentPersonIndex]
    if (!currentBooking) return
    const newSupplements = currentBooking.supplements.includes(supplement)
      ? currentBooking.supplements.filter((sups: ISalonServiceSupplement) => sups.id !== supplement.id)
      : [...currentBooking.supplements, supplement]
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
    handleNavigateNext(canContinue, state.currentStep, state.reservationType, bookingState.setCurrentStep)
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

    setIsSubmitting(true)
    try {
      const bookingsWithTimes = state.multipleBookings.map(booking => {
        const startDate = new Date(booking.date!)
        const [hour, minute] = booking.time!.split(':').map(Number)
        startDate.setHours(hour || 0, minute || 0, 0, 0)
        const totalDuration = (booking.service?.duration || 0) +
          booking.supplements.reduce((sum, supplement) => sum + (supplement.duration || 0), 0)
        const endDate = addMinutesToDate(startDate, totalDuration)
        return { booking, scheduledAt: startDate, endsAt: endDate }
      })

      const result = await createAndSaveReservation(
        salonId,
        bookingsWithTimes,
        {
          clientName: state.clientInfo.clientName,
          clientPhone: state.clientInfo.clientPhone,
          clientEmail: state.clientInfo.clientEmail,
          notes: state.clientInfo.notes,
          userId: null,
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = loadingSalon || loadingHairdressers
  const steps = state.reservationType === 'multiple' ? MULTIPLE_STEPS : SINGLE_STEPS

  return (
    <div
      className="booking-page min-h-screen bg-white"
      style={{ fontFamily: 'var(--font-sans), ui-sans-serif, sans-serif' }}
    >
      <BookingHeader
        salon={salon || null}
        currentStep={state.currentStep}
        isLoading={isLoading}
        onPrevious={handlePrev}
      />

      {!isLoading && salon && (
        <div className="pt-14">
          {/* Step indicator */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              <StepIndicator steps={steps} currentStep={state.currentStep} />
            </div>
          </div>

          {state.reservationType === 'multiple' ? (
            <>
              <MobileDrawer
                multipleBookings={state.multipleBookings}
                currentPersonIndex={state.currentPersonIndex}
                currentStep={state.currentStep}
                onSelectBooking={handleSelectBooking}
                onDeleteBooking={handleDeleteBooking}
              />

              <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                  <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
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

                    <div className="mt-4">
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
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  </div>

                  <DesktopSidebar
                    multipleBookings={state.multipleBookings}
                    currentPersonIndex={state.currentPersonIndex}
                    currentStep={state.currentStep}
                    onSelectBooking={handleSelectBooking}
                    onDeleteBooking={handleDeleteBooking}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
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

              <div className="mt-4">
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
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
