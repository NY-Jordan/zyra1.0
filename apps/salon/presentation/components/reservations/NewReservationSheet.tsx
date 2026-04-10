'use client'

import React, { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Label } from '@zyra/ui/components/label'
import { Textarea } from '@zyra/ui/components/textarea'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Calendar as DateCalendar } from '@zyra/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@zyra/ui/components/popover'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Loader2,
  Plus,
  Scissors,
  User,
  Users,
} from 'lucide-react'
import { Timestamp, where } from 'firebase/firestore'
import { createDocument, editDocument, fetchCollection } from '@zyra/conf/lib/query'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import { reservationPaymentMethodEnum, reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { IReservationPerson } from '@zyra/conf/domain/entities/reservations.entities'
import useSalon from '@/hooks/useSalon'
import { useHairDressers } from '@/usecases/useHairDressers'
import ClientSearchModal from '../orders/ClientSearchModal'
import { toast } from 'sonner'
import { DAYS_OF_WEEK } from '@zyra/conf/lib/utils'

interface NewReservationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ReservationMode = 'single' | 'multiple'

interface ReservationClientForm {
  linkedClientId: string | null
  clientName: string
  clientPhone: string
  clientEmail: string
  saveAsRegularClient: boolean
}

interface ReservationWizardData {
  mode: ReservationMode
  serviceId: string
  hairDresserId: string
  scheduledDate: string
  scheduledTimes: string[]
  clients: ReservationClientForm[]
  supplements: string[]
  notes: string
}

const initialClient: ReservationClientForm = {
  linkedClientId: null,
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  saveAsRegularClient: false,
}

const initialFormData: ReservationWizardData = {
  mode: 'single',
  serviceId: '',
  hairDresserId: '',
  scheduledDate: '',
  scheduledTimes: [''],
  clients: [{ ...initialClient }],
  supplements: [],
  notes: '',
}

const steps = [
  'Type et prestation',
  'Client(s)',
  'Coiffeur',
  'Horaires',
  'Bilan',
] as const

const toMinutes = (hhmm: string) => {
  const [hour, minute] = hhmm.split(':').map(Number)
  return hour * 60 + minute
}

const minutesToHHMM = (value: number) => {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const dateToInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const inputValueToDate = (value: string) => {
  if (!value) return undefined
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default function NewReservationSheet({ open, onOpenChange }: NewReservationSheetProps) {
  const { salon } = useSalon()
  const { hairDressers } = useHairDressers()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<ReservationWizardData>(initialFormData)
  const [step, setStep] = useState(0)
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false)
  const [activeClientIndex, setActiveClientIndex] = useState(0)

  const activeHairDressers = useMemo(
    () => hairDressers.filter((hairdresser) => hairdresser.associationHairdresser?.active === true),
    [hairDressers],
  )

  const selectedHairdresser = useMemo(
    () => activeHairDressers.find((hairdresser) => hairdresser.id === formData.hairDresserId),
    [activeHairDressers, formData.hairDresserId],
  )

  const availableServices = useMemo(() => {
    if (!salon?.services) return []
    if (!selectedHairdresser) return salon.services

    const allowedServiceIds = selectedHairdresser.associationHairdresser?.salonServiceIds ?? []
    if (!allowedServiceIds.length) return []

    return salon.services.filter((service) => allowedServiceIds.includes(service.id))
  }, [salon?.services, selectedHairdresser])

  const selectedService = useMemo(
    () => salon?.services.find((service) => service.id === formData.serviceId),
    [salon?.services, formData.serviceId],
  )

  const selectedSupplements = selectedService?.supplements?.filter((supplement) =>
    formData.supplements.includes(supplement.name),
  ) ?? []

  const supplementsPrice = selectedSupplements.reduce((total, supplement) => total + supplement.price, 0)
  const supplementsDuration = selectedSupplements.reduce((total, supplement) => total + supplement.duration, 0)
  const servicePrice = selectedService?.price ?? 0
  const serviceDuration = selectedService?.duration ?? 0
  const totalPrice = servicePrice + supplementsPrice
  const totalDuration = serviceDuration + supplementsDuration

  const scheduleDayKey = useMemo(() => {
    if (!formData.scheduledDate) return ''
    const selectedDate = new Date(`${formData.scheduledDate}T00:00:00`)
    const dayIndex = selectedDate.getDay()
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return dayMap[dayIndex] ?? ''
  }, [formData.scheduledDate])

  const selectedWorkingHours = useMemo(() => {
    const baseHours = selectedHairdresser?.associationHairdresser?.workingHours ?? salon?.openingHours ?? []
    return baseHours.find((workingHour) => workingHour.day === scheduleDayKey && workingHour.openDay)
  }, [selectedHairdresser, salon?.openingHours, scheduleDayKey])

  const availableTimeSlots = useMemo(() => {
    if (!selectedWorkingHours || totalDuration <= 0) return []

    const startMinute = toMinutes(selectedWorkingHours.open)
    const endMinute = toMinutes(selectedWorkingHours.close)
    const slots: string[] = []

    for (let cursor = startMinute; cursor + totalDuration <= endMinute; cursor += 30) {
      slots.push(minutesToHHMM(cursor))
    }

    return slots
  }, [selectedWorkingHours, totalDuration])

  const hasTimeConflict = useMemo(() => {
    if (!formData.scheduledTimes.length || totalDuration <= 0) return false

    const normalized = formData.scheduledTimes.filter(Boolean)
    if (normalized.length !== formData.scheduledTimes.length) return false

    const sortedTimes = normalized
      .map((time) => toMinutes(time))
      .sort((a, b) => a - b)

    for (let index = 1; index < sortedTimes.length; index += 1) {
      if (sortedTimes[index] < sortedTimes[index - 1] + totalDuration) {
        return true
      }
    }

    return false
  }, [formData.scheduledTimes, totalDuration])

  const createReservationMutation = useMutation({
    mutationFn: async (data: ReservationWizardData) => {
      if (!salon?.id) {
        throw new Error('Salon non trouvé')
      }

      const service = salon.services.find((item) => item.id === data.serviceId)
      if (!service) {
        throw new Error('Service non trouvé')
      }

      if (!data.scheduledDate || data.scheduledTimes.some((time) => !time)) {
        throw new Error('Date ou heure de réservation manquante')
      }

      if (data.clients.length !== data.scheduledTimes.length) {
        throw new Error('Le nombre de clients et d\'horaires ne correspond pas')
      }

      const selectedHairDresser = activeHairDressers.find((item) => item.id === data.hairDresserId)
      if (!selectedHairDresser) {
        throw new Error('Coiffeur non trouvé')
      }

      const supplementDetails = service.supplements?.filter((supplement) =>
        data.supplements.includes(supplement.name),
      ) ?? []

      const people: IReservationPerson[] = data.clients.map((client, index) => {
        const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTimes[index]}`)
        if (Number.isNaN(scheduledAt.getTime())) {
          throw new Error('Date de réservation invalide')
        }

        return {
          personNumber: index + 1,
          serviceId: service.id,
          serviceName: service.name,
          serviceDuration: service.duration,
          servicePrice: service.price,
          hairdresserId: selectedHairDresser.id,
          hairdresserName: selectedHairDresser.name,
          supplements: supplementDetails,
          supplementsTotalPrice: supplementDetails.reduce((total, supplement) => total + supplement.price, 0),
          supplementsTotalDuration: supplementDetails.reduce((total, supplement) => total + supplement.duration, 0),
          totalPrice: service.price + supplementDetails.reduce((total, supplement) => total + supplement.price, 0),
          totalDuration: service.duration + supplementDetails.reduce((total, supplement) => total + supplement.duration, 0),
          scheduledAt: Timestamp.fromDate(scheduledAt),
          endsAt: Timestamp.fromDate(new Date(scheduledAt.getTime() + totalDuration * 60 * 1000)),
        }
      })

      const sortedByStart = [...people].sort((a, b) => a.scheduledAt.seconds - b.scheduledAt.seconds)
      const firstClient = data.clients[0]
      const reservationNumber = String(Math.floor(Math.random() * 90000) + 10000)

      const reservationId = await createDocument('reservations', {
        salonId: salon.id,
        reservationNumber,
        createdAt: Timestamp.now(),
        clientName: data.mode === 'single'
          ? firstClient.clientName
          : `${firstClient.clientName} +${Math.max(0, data.clients.length - 1)}`,
        clientPhone: firstClient.clientPhone,
        clientEmail: firstClient.clientEmail || null,
        userId: null,
        isGuest: true,
        status: reservationStatusEnum.pending,
        notes: data.notes || '',
        isPaid: false,
        paymentMethod: reservationPaymentMethodEnum.cash,
        isSingleReservation: data.mode === 'single',
        totalPrice: people.reduce((sum, person) => sum + person.totalPrice, 0),
        people,
        earliestScheduledAt: sortedByStart[0]?.scheduledAt,
        latestEndsAt: sortedByStart.reduce((latest, person) => {
          if (!latest) return person.endsAt
          return person.endsAt.seconds > latest.seconds ? person.endsAt : latest
        }, sortedByStart[0]?.endsAt),
      })

      const resolvedClientIds: string[] = []

      for (const clientData of data.clients) {
        let clientId = clientData.linkedClientId

        if (!clientId && clientData.saveAsRegularClient) {
          const existingClients = await fetchCollection('clients', [
            where('salonId', '==', salon.id),
            where('phone', '==', clientData.clientPhone),
            where('name', '==', clientData.clientName),
          ]) as IClient[]

          if (existingClients.length > 0) {
            clientId = existingClients[0].id
          } else {
            clientId = await createDocument('clients', {
              salonId: salon.id,
              name: clientData.clientName,
              phone: clientData.clientPhone,
              email: clientData.clientEmail || null,
              history: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }
        }

        if (clientId) {
          resolvedClientIds.push(clientId)
        }
      }

      const uniqueClientIds = [...new Set(resolvedClientIds)]

      for (const clientId of uniqueClientIds) {
        const clients = await fetchCollection('clients', [
          where('id', '==', clientId),
        ]) as IClient[]

        if (clients.length > 0) {
          const client = clients[0]
          const history = Array.isArray(client.history) ? client.history : []
          const nextHistory = history.includes(reservationId) ? history : [...history, reservationId]

          await editDocument('clients', clientId, {
            ...client,
            history: nextHistory,
            updatedAt: new Date().toISOString(),
          })
        }
      }

      return reservationId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-month'] })
      toast.success('Réservation créée avec succès')
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création de la réservation')
    },
  })

  const handleClose = () => {
    setFormData(initialFormData)
    setStep(0)
    setActiveClientIndex(0)
    onOpenChange(false)
  }

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose()
      return
    }

    onOpenChange(nextOpen)
  }

  const handleSupplementToggle = (supplementName: string) => {
    setFormData((prev) => ({
      ...prev,
      supplements: prev.supplements.includes(supplementName)
        ? prev.supplements.filter((item) => item !== supplementName)
        : [...prev.supplements, supplementName],
    }))
  }

  const handleImportClient = (client: IClient) => {
    setFormData((prev) => ({
      ...prev,
      clients: prev.clients.map((current, index) => (
        index === activeClientIndex
          ? {
              ...current,
              linkedClientId: client.id,
              clientName: client.name,
              clientPhone: client.phone,
              clientEmail: client.email || '',
              saveAsRegularClient: true,
            }
          : current
      )),
    }))
  }

  const setClientField = (index: number, field: keyof ReservationClientForm, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      clients: prev.clients.map((client, currentIndex) => {
        if (currentIndex !== index) return client

        const nextClient = { ...client, [field]: value }
        if (field === 'clientName' || field === 'clientPhone' || field === 'clientEmail') {
          nextClient.linkedClientId = null
        }
        return nextClient
      }),
    }))
  }

  const handleModeChange = (mode: ReservationMode) => {
    setFormData((prev) => {
      const nextClients = mode === 'single'
        ? [prev.clients[0] ?? { ...initialClient }]
        : prev.clients.length >= 2
          ? prev.clients
          : [prev.clients[0] ?? { ...initialClient }, { ...initialClient }]

      const nextTimes = mode === 'single'
        ? [prev.scheduledTimes[0] ?? '']
        : nextClients.map((_, index) => prev.scheduledTimes[index] ?? '')

      return {
        ...prev,
        mode,
        clients: nextClients,
        scheduledTimes: nextTimes,
      }
    })
  }

  const addClient = () => {
    setFormData((prev) => ({
      ...prev,
      clients: [...prev.clients, { ...initialClient }],
      scheduledTimes: [...prev.scheduledTimes, ''],
      mode: 'multiple',
    }))
  }

  const removeClient = (index: number) => {
    setFormData((prev) => {
      if (prev.clients.length <= 2) return prev
      return {
        ...prev,
        clients: prev.clients.filter((_, currentIndex) => currentIndex !== index),
        scheduledTimes: prev.scheduledTimes.filter((_, currentIndex) => currentIndex !== index),
      }
    })
  }

  const setScheduledTime = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      scheduledTimes: prev.scheduledTimes.map((time, currentIndex) => (currentIndex === index ? value : time)),
    }))
  }

  const isStepValid = (stepIndex: number) => {
    if (stepIndex === 0) {
      return Boolean(formData.serviceId)
    }

    if (stepIndex === 1) {
      return formData.clients.every((client) => client.clientName.trim() && client.clientPhone.trim())
    }

    if (stepIndex === 2) {
      return Boolean(formData.hairDresserId)
    }

    if (stepIndex === 3) {
      const allTimesFilled = formData.scheduledDate && formData.scheduledTimes.every((time) => Boolean(time))
      const allTimesAllowed = formData.scheduledTimes.every((time) => availableTimeSlots.includes(time))
      return Boolean(allTimesFilled && allTimesAllowed && !hasTimeConflict)
    }

    return true
  }

  const nextStep = () => {
    if (!isStepValid(step)) {
      if (step === 3 && hasTimeConflict) {
        toast.error('Les horaires choisis se chevauchent pour ce coiffeur')
        return
      }
      toast.error('Veuillez compléter les informations requises avant de continuer')
      return
    }

    setStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const previousStep = () => {
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isStepValid(0) || !isStepValid(1) || !isStepValid(2) || !isStepValid(3)) {
      toast.error('Le formulaire est incomplet ou contient des horaires invalides')
      return
    }

    if (!selectedHairdresser) {
      toast.error('Veuillez sélectionner un coiffeur valide')
      return
    }

    if (!selectedWorkingHours) {
      toast.error('Le coiffeur n\'est pas disponible ce jour')
      return
    }

    if (!availableServices.some((service) => service.id === formData.serviceId)) {
      toast.error('Ce service n\'est pas disponible pour le coiffeur choisi')
      return
    }

    if (hasTimeConflict) {
      toast.error('Les horaires choisis se chevauchent pour ce coiffeur')
      return
    }

    if (step < steps.length - 1) {
      toast.error('Veuillez atteindre l\'étape bilan pour valider')
      return
    }

    createReservationMutation.mutate(formData)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalOpenChange}>
        <DialogContent className="max-w-4xl max-h-[94vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouvelle réservation
            </DialogTitle>
            <DialogDescription>
              Formulaire multi-étapes pour réservation personnelle ou multiple
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
            {steps.map((stepLabel, index) => (
              <button
                key={stepLabel}
                type="button"
                className={`text-left p-2 rounded-md border ${index === step ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => {
                  const canJump = index <= step || Array.from({ length: index }).every((_, i) => isStepValid(i))
                  if (canJump) setStep(index)
                }}
              >
                <div className="text-xs text-muted-foreground">Etape {index + 1}</div>
                <div className="text-sm font-medium">{stepLabel}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {step === 0 && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Type de réservation</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleModeChange('single')}
                        className={`p-3 rounded-md border text-left ${formData.mode === 'single' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <div className="font-medium">Réservation personnelle</div>
                        <div className="text-sm text-muted-foreground">1 client, 1 créneau</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange('multiple')}
                        className={`p-3 rounded-md border text-left ${formData.mode === 'multiple' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <div className="font-medium">Réservation multiple</div>
                        <div className="text-sm text-muted-foreground">Plusieurs clients, même prestation</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceId">Service *</Label>
                    <select
                      id="serviceId"
                      value={formData.serviceId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, serviceId: e.target.value, supplements: [] }))}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">-- Choisir un service --</option>
                      {availableServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.price.toLocaleString()} XAF
                        </option>
                      ))}
                    </select>
                    {!availableServices.length && (
                      <p className="text-sm text-muted-foreground">
                        Aucun service disponible pour le coiffeur choisi. Sélectionne d'abord un coiffeur ou ajuste l'association services/coiffeur.
                      </p>
                    )}
                  </div>

                  {selectedService?.supplements && selectedService.supplements.length > 0 && (
                    <div className="space-y-2">
                      <Label>Suppléments</Label>
                      <div className="space-y-2">
                        {selectedService.supplements.map((supplement) => (
                          <label
                            key={supplement.name}
                            className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/40"
                          >
                            <input
                              type="checkbox"
                              checked={formData.supplements.includes(supplement.name)}
                              onChange={() => handleSupplementToggle(supplement.name)}
                              className="h-4 w-4"
                            />
                            <span className="flex-1">{supplement.name}</span>
                            <span className="text-sm text-muted-foreground">+{supplement.duration} min</span>
                            <span className="font-medium">{supplement.price.toLocaleString()} XAF</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Clients
                    </h3>
                    {formData.mode === 'multiple' && (
                      <Button type="button" variant="outline" onClick={addClient}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un client
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {formData.clients.map((client, index) => (
                      <Card key={`client-${index}`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Client {index + 1}</div>
                            <div className="flex items-center gap-2">
                              {client.linkedClientId && <Badge variant="outline">Importé</Badge>}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setActiveClientIndex(index)
                                  setIsClientSearchOpen(true)
                                }}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Rechercher
                              </Button>
                              {formData.mode === 'multiple' && formData.clients.length > 2 && (
                                <Button type="button" variant="outline" size="sm" onClick={() => removeClient(index)}>
                                  Retirer
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label>Nom complet *</Label>
                              <Input
                                value={client.clientName}
                                onChange={(e) => setClientField(index, 'clientName', e.target.value)}
                                placeholder="Ex: Jean Dupont"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Téléphone *</Label>
                              <Input
                                type="tel"
                                value={client.clientPhone}
                                onChange={(e) => setClientField(index, 'clientPhone', e.target.value)}
                                placeholder="Ex: +237 6XX XX XX XX"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={client.clientEmail}
                                onChange={(e) => setClientField(index, 'clientEmail', e.target.value)}
                                placeholder="Ex: jean@example.com"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              id={`saveAsRegularClient-${index}`}
                              type="checkbox"
                              checked={client.saveAsRegularClient}
                              onChange={(e) => setClientField(index, 'saveAsRegularClient', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`saveAsRegularClient-${index}`} className="cursor-pointer">
                              Enregistrer comme client régulier
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Coiffeur assigné
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="hairDresserId">Coiffeur *</Label>
                    <select
                      id="hairDresserId"
                      value={formData.hairDresserId}
                      onChange={(e) => {
                        const nextHairDresserId = e.target.value
                        const nextHairdresser = activeHairDressers.find((item) => item.id === nextHairDresserId)
                        const nextServiceIds = nextHairdresser?.associationHairdresser?.salonServiceIds ?? []
                        setFormData((prev) => ({
                          ...prev,
                          hairDresserId: nextHairDresserId,
                          serviceId: nextServiceIds.includes(prev.serviceId) ? prev.serviceId : '',
                          supplements: nextServiceIds.includes(prev.serviceId) ? prev.supplements : [],
                          scheduledDate: '',
                          scheduledTimes: prev.scheduledTimes.map(() => ''),
                        }))
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">-- Choisir un coiffeur --</option>
                      {activeHairDressers.map((hairdresser) => (
                        <option key={hairdresser.id} value={hairdresser.id}>
                          {hairdresser.name} - {hairdresser.speciality}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedHairdresser && (
                    <div className="rounded-md border p-3 space-y-2">
                      <div className="font-medium">Horaires de travail</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {DAYS_OF_WEEK.map((day) => {
                          const wh = selectedHairdresser.associationHairdresser?.workingHours?.find((item) => item.day === day.key)
                          return (
                            <div key={day.key} className="flex justify-between border rounded px-2 py-1">
                              <span>{day.label}</span>
                              <span>{wh?.openDay ? `${wh.open} - ${wh.close}` : 'Fermé'}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date et horaires
                  </h3>

                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formData.scheduledDate
                            ? inputValueToDate(formData.scheduledDate)?.toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'Sélectionner une date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DateCalendar
                          mode="single"
                          selected={inputValueToDate(formData.scheduledDate)}
                          onSelect={(date) => {
                            if (!date) return
                            const nextDate = dateToInputValue(date)
                            setFormData((prev) => ({
                              ...prev,
                              scheduledDate: nextDate,
                              scheduledTimes: prev.scheduledTimes.map(() => ''),
                            }))
                          }}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {formData.scheduledDate && !selectedWorkingHours && (
                    <p className="text-sm text-destructive">
                      Le coiffeur est fermé ce jour. Choisis une autre date.
                    </p>
                  )}

                  {selectedWorkingHours && (
                    <div className="rounded-md border p-3 text-sm">
                      Disponibilité du jour: {selectedWorkingHours.open} - {selectedWorkingHours.close}
                    </div>
                  )}

                  {formData.clients.map((client, index) => (
                    <div key={`slot-${index}`} className="space-y-2">
                      <Label>Horaire client {index + 1} ({client.clientName || 'Sans nom'}) *</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableTimeSlots.map((slot) => (
                          <button
                            key={`${index}-${slot}`}
                            type="button"
                            onClick={() => setScheduledTime(index, slot)}
                            className={`px-2 py-2 border rounded-md text-sm ${formData.scheduledTimes[index] === slot ? 'border-primary bg-primary/10' : 'border-border'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      {!availableTimeSlots.length && (
                        <p className="text-sm text-muted-foreground">
                          Aucun créneau disponible pour cette date et cette durée.
                        </p>
                      )}
                    </div>
                  ))}

                  {hasTimeConflict && (
                    <p className="text-sm text-destructive">
                      Les horaires choisis se chevauchent. Sélectionne des créneaux séparés.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Bilan avant validation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div><span className="font-medium">Type:</span> {formData.mode === 'single' ? 'Personnelle' : 'Multiple'}</div>
                      <div><span className="font-medium">Service:</span> {selectedService?.name || '-'}</div>
                      <div><span className="font-medium">Coiffeur:</span> {selectedHairdresser?.name || '-'}</div>
                      <div><span className="font-medium">Date:</span> {inputValueToDate(formData.scheduledDate)?.toLocaleDateString('fr-FR') || '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <div><span className="font-medium">Durée unitaire:</span> {totalDuration} min</div>
                      <div><span className="font-medium">Prix unitaire:</span> {totalPrice.toLocaleString()} XAF</div>
                      <div><span className="font-medium">Nombre de clients:</span> {formData.clients.length}</div>
                      <div><span className="font-medium">Total:</span> {(totalPrice * formData.clients.length).toLocaleString()} XAF</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Clients et horaires</Label>
                    {formData.clients.map((client, index) => (
                      <div key={`summary-${index}`} className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                        <div>
                          <div className="font-medium">{client.clientName}</div>
                          <div className="text-muted-foreground">{client.clientPhone}</div>
                        </div>
                        <Badge variant="outline">{formData.scheduledTimes[index] || '--:--'}</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Informations complémentaires"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3 justify-between pb-1">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={step === 0 || createReservationMutation.isPending}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>

              <div className="flex items-center gap-2">
                {step < steps.length - 1 && (
                  <Button type="button" onClick={nextStep} disabled={createReservationMutation.isPending}>
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {step === steps.length - 1 && (
                  <Button type="submit" disabled={createReservationMutation.isPending}>
                    {createReservationMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Créer la réservation
                  </Button>
                )}

                <Button type="button" variant="outline" onClick={handleClose} disabled={createReservationMutation.isPending}>
                  Annuler
                </Button>
              </div>
            </div>

            <div className="pt-1 border-t text-xs text-muted-foreground">
              Etape {step + 1} / {steps.length} · {totalDuration} min · {totalPrice.toLocaleString()} XAF par client
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ClientSearchModal
        open={isClientSearchOpen}
        onOpenChange={setIsClientSearchOpen}
        onSelectClient={handleImportClient}
      />
    </>
  )
}
