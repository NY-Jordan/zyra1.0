import React from 'react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import ReservationType from '@/presentation/components/booking/ReservationType'
import ServiceSelection from '@/presentation/components/booking/ServiceSelection'
import SupplementsSelection from '@/presentation/components/booking/SupplementsSelection'
import HairdresserSelection from '@/presentation/components/booking/HairdresserSelection'
import DateTimeSelection from '@/presentation/components/booking/DateTimeSelection'
import ClientInfoForm from '@/presentation/components/booking/ClientInfoForm'
import { Booking } from '../../../../app/booking/[id]/types'
import { ConfirmationStep } from './ConfirmationStep'
import { HairDresserSalonAssociation, IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

interface MultipleReservationFlowProps {
  salon: ISalon
  currentStep: number
  currentPersonIndex: number
  multipleBookings: Booking[]
  availableSlots: string[]
  hairdressers: { hairdresser: IHairDresser; association: HairDresserSalonAssociation }[] | undefined
  reservationType: 'single' | 'multiple' | null
  clientInfo: any
  onSelectReservationType: (type: 'single' | 'multiple') => void
  onSelectService: (service: any) => void
  onToggleSupplement: (id: string) => void
  onSelectHairdresser: (hairdresser: any) => void
  onSelectDate: (date: Date) => void
  onSelectTime: (time: string) => void
  onChangeClientInfo: (field: string, value: string) => void
  onAddPerson: () => void
  onFinalize: () => void
}

export const MultipleReservationFlow: React.FC<MultipleReservationFlowProps> = ({
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
  onAddPerson,
  onFinalize,
}) => {
  const currentBooking = multipleBookings[currentPersonIndex]

  return (
    <>
      {currentStep === 1 && (
        <ReservationType
          selectedType={reservationType}
          onSelectType={onSelectReservationType}
        />
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg">
              Votre service (Personne {currentPersonIndex + 1})
            </h3>
          </div>
          <ServiceSelection
            services={salon.services || []}
            categories={salon.serviceCategories || []}
            selectedService={currentBooking?.service || null}
            onSelectService={onSelectService}
          />
        </div>
      )}

      {currentStep === 3 && currentBooking?.service && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg">
              Suppléments (Personne {currentPersonIndex + 1})
            </h3>
          </div>
          <SupplementsSelection
            supplements={currentBooking?.service?.supplements || []}
            selectedSupplements={currentBooking?.supplements || []}
            onToggleSupplement={onToggleSupplement}
          />
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg">
              Coiffeur (Personne {currentPersonIndex + 1})
            </h3>
          </div>
        <HairdresserSelection
            hairdressers={hairdressers}
            selectedHairdresser={currentBooking?.hairdresser || null}
            onSelectHairdresser={onSelectHairdresser}
          />
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg">
              Date & Heure (Personne {currentPersonIndex + 1})
            </h3>
          </div>
          <DateTimeSelection
            selectedDate={currentBooking?.date || null}
            selectedTime={currentBooking?.time || null}
            onSelectDate={onSelectDate}
            onSelectTime={onSelectTime}
            availableSlots={availableSlots}
            openingHours={salon.openingHours}
            selectedService={currentBooking?.service || null}
            selectedSupplementIds={currentBooking?.supplements || []}
            selectedHairdresser={currentBooking?.hairdresser || null}
          />
        </div>
      )}

      {currentStep === 7 && (
        <ConfirmationStep
          currentPersonIndex={currentPersonIndex}
          multipleBookings={multipleBookings}
          onAddPerson={onAddPerson}
          onFinalize={onFinalize}
        />
      )}

      {currentStep === 8 && (
        <ClientInfoForm
          formData={clientInfo}
          onChange={onChangeClientInfo}
        />
      )}
    </>
  )
}
