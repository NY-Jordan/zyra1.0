'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@zyra/ui/components/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { fetchCollection, fetchAllSubCollections } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalon, ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { IHairDresser, HairDresserSalonAssociation, hairDresserAssociationNameEnum } from '@zyra/conf/domain/entities/hairdressers.entities'
import StepIndicator from '@/presentation/components/booking/StepIndicator'
import ServiceSelection from '@/presentation/components/booking/ServiceSelection'
import SupplementsSelection from '@/presentation/components/booking/SupplementsSelection'
import HairdresserSelection from '@/presentation/components/booking/HairdresserSelection'
import DateTimeSelection from '@/presentation/components/booking/DateTimeSelection'
import ClientInfoForm from '@/presentation/components/booking/ClientInfoForm'
import ReservationType from '@/presentation/components/booking/ReservationType'
import { toast } from 'sonner'

const steps = [
  { number: 1, title: 'Type' },
  { number: 2, title: 'Service' },
  { number: 3, title: 'Suppléments' },
  { number: 4, title: 'Coiffeur' },
  { number: 5, title: 'Date & Heure' },
  { number: 6, title: 'Informations' },
]

// Générer des créneaux horaires selon les horaires d'ouverture du salon
const generateTimeSlots = (openTime: string, closeTime: string) => {
  const slots = []
  const [openHour, openMinute] = openTime.split(':').map(Number)
  const [closeHour, closeMinute] = closeTime.split(':').map(Number)
  
  const openInMinutes = openHour * 60 + openMinute
  const closeInMinutes = closeHour * 60 + closeMinute
  
  // Créneaux de 30 minutes
  for (let time = openInMinutes; time < closeInMinutes; time += 30) {
    const hour = Math.floor(time / 60)
    const minute = time % 60
    slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
  }
  
  return slots
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const salonId = params.id as string

  const [currentStep, setCurrentStep] = useState(1)
  const [reservationType, setReservationType] = useState<'single' | 'multiple' | null>(null)
  const [selectedService, setSelectedService] = useState<ISalonService | null>(null)
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([])
  const [selectedHairdresser, setSelectedHairdresser] = useState<IHairDresser | null>(null)
  const [hairdresserSelectionMade, setHairdresserSelectionMade] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
  })

  // Fetch salon
  const { data: salon, isLoading: loadingSalon } = useQuery({
    queryKey: ['salon', salonId],
    queryFn: async () => {
      const salons = await fetchCollection('salons', [where('id', '==', salonId)])
      return salons[0] as ISalon
    },
  })

  // Fetch hairdressers with active associations
  const { data: hairdressers = [], isLoading: loadingHairdressers } = useQuery({
    queryKey: ['hairdressers', salonId, selectedService?.categoryId],
    queryFn: async () => {
      if (!salonId) return []
      
      // Fetch all associations for this salon
      const associations = await fetchAllSubCollections(
        hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
        [where('salonId', '==', salonId), where('active', '==', true)]
      ) as HairDresserSalonAssociation[]

      if (associations.length === 0) return []

      // Fetch hairdresser details for each active association
      const hairdresserPromises = associations.map(async (assoc) => {
        const hairdressers = await fetchCollection('hair_dressers', [
          where('id', '==', assoc.parentId)
        ])
        return {
          hairdresser: hairdressers[0] as IHairDresser,
          association: assoc
        }
      })

      const results = await Promise.all(hairdresserPromises)
      let filtered = results.filter(r => r.hairdresser)

      // Filter by selected service category if provided
      if (selectedService?.categoryId) {
        filtered = filtered.filter(r => 
          r.association.salonServiceIds.includes(selectedService.categoryId)
        )
      }

      return filtered
    },
    enabled: !!salonId,
  })

  // Générer les créneaux horaires en fonction de la date sélectionnée et des horaires du salon
  const availableSlots = React.useMemo(() => {
    if (!salon || !selectedDate) return []
    const dayOfWeek = selectedDate.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
    const daySchedule = salon.openingHours.find(h => h.day.toLowerCase() === dayOfWeek)
    if (!daySchedule || !daySchedule.openDay) return []
    return generateTimeSlots(daySchedule.open, daySchedule.close)
  }, [salon, selectedDate])

  const handleToggleSupplement = (supplementId: string) => {
    setSelectedSupplements(prev => 
      prev.includes(supplementId)
        ? prev.filter(id => id !== supplementId)
        : [...prev, supplementId]
    )
  }

  const handleServiceSelect = (service: ISalonService) => {
    setSelectedService(service)
    // Avancer automatiquement à l'étape suivante
    setTimeout(() => setCurrentStep(3), 300)
  }

  const handleHairdresserSelect = (hairdresser: IHairDresser | null) => {
    setSelectedHairdresser(hairdresser)
    setHairdresserSelectionMade(true)
    // Avancer automatiquement à l'étape suivante
    setTimeout(() => setCurrentStep(5), 300)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    // Avancer automatiquement à l'étape suivante
    setTimeout(() => setCurrentStep(6), 300)
  }

  const handleClientInfoChange = (field: string, value: string) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }))
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return reservationType !== null
      case 2:
        return !!selectedService
      case 3:
        return true // Suppléments optionnels
      case 4:
        return hairdresserSelectionMade // Can be null (any hairdresser) or an IHairDresser
      case 5:
        return !!selectedDate && !!selectedTime
      case 6:
        return clientInfo.clientName.trim() !== '' && clientInfo.clientPhone.trim() !== ''
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!canGoNext()) {
      toast.error('Veuillez compléter cette étape avant de continuer')
      return
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!canGoNext()) {
      toast.error('Veuillez compléter tous les champs obligatoires')
      return
    }

    // TODO: Créer la réservation
    toast.success('Réservation créée avec succès!')
    router.push('/')
  }

  if (loadingSalon || loadingHairdressers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Salon non trouvé</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          {currentStep === 1 && (
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {salon.name}
              </h1>
              <p className="text-lg text-gray-600">{salon.address}, {salon.city}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-8 mb-8">
          {currentStep === 1 && (
            <ReservationType
              selectedType={reservationType}
              onSelectType={(type) => {
                setReservationType(type)
                setTimeout(() => setCurrentStep(2), 300)
              }}
            />
          )}

          {currentStep === 2 && (
            <ServiceSelection
              services={salon.services || []}
              categories={salon.serviceCategories || []}
              selectedService={selectedService}
              onSelectService={handleServiceSelect}
            />
          )}

          {currentStep === 3 && selectedService && (
            <SupplementsSelection
              supplements={selectedService.supplements || []}
              selectedSupplements={selectedSupplements}
              onToggleSupplement={handleToggleSupplement}
            />
          )}

          {currentStep === 4 && (
            <HairdresserSelection
              hairdressers={hairdressers}
              selectedHairdresser={selectedHairdresser}
              onSelectHairdresser={handleHairdresserSelect}
            />
          )}

          {currentStep === 5 && (
            <DateTimeSelection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={setSelectedDate}
              onSelectTime={handleTimeSelect}
              availableSlots={availableSlots}
              openingHours={salon.openingHours}
            />
          )}

          {currentStep === 6 && (
            <ClientInfoForm
              formData={clientInfo}
              onChange={handleClientInfoChange}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          {currentStep === 1 && (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continuer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {currentStep === 3 && (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continuer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {currentStep === 6 && (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirmer la réservation
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
