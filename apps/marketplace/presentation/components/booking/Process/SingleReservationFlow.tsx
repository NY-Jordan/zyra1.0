import React from 'react'
import { ISalon, ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'
import ReservationType from '@/presentation/components/booking/ReservationType'
import ServiceSelection from '@/presentation/components/booking/ServiceSelection'
import SupplementsSelection from '@/presentation/components/booking/SupplementsSelection'
import HairdresserSelection from '@/presentation/components/booking/HairdresserSelection'
import DateTimeSelection from '@/presentation/components/booking/DateTimeSelection'
import ClientInfoForm from '@/presentation/components/booking/ClientInfoForm'
import { Booking } from '../../../../app/booking/[id]/types'

interface SingleReservationFlowProps {
  salon: ISalon
  currentStep: number
  currentPersonIndex: number
  multipleBookings: Booking[]
  availableSlots: string[]
  hairdressers: any
  reservationType: 'single' | 'multiple' | null
  clientInfo: any
  onSelectReservationType: (type: 'single' | 'multiple') => void
  onSelectService: (service: any) => void
  onToggleSupplement: (id: ISalonServiceSupplement) => void
  onSelectHairdresser: (hairdresser: any) => void
  onSelectDate: (date: Date) => void
  onSelectTime: (time: string) => void
  onChangeClientInfo: (field: string, value: string) => void
}

export const SingleReservationFlow: React.FC<SingleReservationFlowProps> = ({
  salon,
  currentStep,
  currentPersonIndex,
  multipleBookings,
  availableSlots,
  hairdressers,
  reservationType,
  clientInfo,
  onSelectReservationType,
  onSelectService,
  onToggleSupplement,
  onSelectHairdresser,
  onSelectDate,
  onSelectTime,
  onChangeClientInfo,
}) => {
  const currentBooking = multipleBookings[currentPersonIndex]
  const selectedService = currentBooking?.service || null
  const selectedSupplements = currentBooking?.supplements || []
  const selectedHairdresser = currentBooking?.hairdresser || null
  const selectedDate = currentBooking?.date || null
  const selectedTime = currentBooking?.time || null
  return (
    <>
      {currentStep === 1 && (
        <ReservationType
          selectedType={reservationType}
          onSelectType={onSelectReservationType}
        />
      )}

      {reservationType === 'single' && (
        <>
          {currentStep === 2 && (
            <ServiceSelection
              services={salon.services || []}
              categories={salon.serviceCategories || []}
              selectedService={selectedService}
              onSelectService={onSelectService}
            />
          )}

          {currentStep === 3 && selectedService && (
            <SupplementsSelection
              supplements={selectedService.supplements || []}
              selectedSupplements={selectedSupplements}
              onToggleSupplement={onToggleSupplement}
            />
          )}

          {currentStep === 4 && (
            <HairdresserSelection
              hairdressers={hairdressers}
              selectedHairdresser={selectedHairdresser}
              onSelectHairdresser={onSelectHairdresser}
            />
          )}

          {currentStep === 5 && (
            <DateTimeSelection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={onSelectDate}
              onSelectTime={onSelectTime}
              availableSlots={availableSlots}
              openingHours={salon.openingHours}
              selectedService={selectedService}
              selectedSupplementIds={selectedSupplements}
              selectedHairdresser={selectedHairdresser}
            />
          )}

          {currentStep === 6 && (
            <ClientInfoForm
              formData={clientInfo}
              onChange={onChangeClientInfo}
            />
          )}
        </>
      )}
    </>
  )
}
