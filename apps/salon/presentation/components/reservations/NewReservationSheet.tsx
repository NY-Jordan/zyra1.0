'use client'

import React, { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogTitle } from '@zyra/ui/components/dialog'
import { Calendar, Check, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react'
import { Timestamp, where } from 'firebase/firestore'
import { createDocument, editDocument, fetchCollection } from '@zyra/conf/lib/query'
import { logActivity, createNotification, getCurrentActor } from '@/usecases/notificationsUseCases'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import { reservationPaymentMethodEnum, reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { IReservation, IReservationPerson } from '@zyra/conf/domain/entities/reservations.entities'
import { useSalon } from '@/hooks/useSalon'
import { useHairDressers } from '@/usecases/useHairDressers'
import ClientSearchModal from '../orders/ClientSearchModal'
import { toast } from 'sonner'

import {
  filterByHairdresserHours,
  filterPassedHours,
  generateTimeSlots,
  getOccupiedSlots,
} from './helpers/timeSlots'
import { PersonBooking, PersonSubStep, emptyPerson } from './types'
import { getPhonePrefix } from '@/utils/phonePrefix'
import { Stepper } from './ui/ReservationWizardPrimitives'
import { ServiceStep } from './steps/ServiceStep'
import { HairdresserStep } from './steps/HairdresserStep'
import { DateTimeStep } from './steps/DateTimeStep'
import { PersonConfirmStep } from './steps/PersonConfirmStep'
import { ClientInfoStep } from './steps/ClientInfoStep'
import { FinalisationStep } from './steps/FinalisationStep'

// ── Props ─────────────────────────────────────────────────────────────────────

interface NewReservationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewReservationSheet({ open, onOpenChange }: NewReservationSheetProps) {
  const { salon } = useSalon()
  const { hairDressers } = useHairDressers()
  const queryClient = useQueryClient()

  const phonePrefix = getPhonePrefix(salon?.country ?? '')
  const makeEmptyPerson = () => ({ ...emptyPerson(), clientPhone: phonePrefix })

  // ── Wizard state ─────────────────────────────────────────────────────────────
  // Pipeline: Phase 0 (Prestation) → Phase 1 (Clients) → Phase 2 (Finalisation)
  // Phase 0 sub-steps per person: service → hairdresser → datetime → confirm recap

  const [phase, setPhase] = useState(0)
  const [personSubStep, setPersonSubStep] = useState<PersonSubStep>('service')
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0)
  const [showPersonConfirm, setShowPersonConfirm] = useState(false)
  const [bookings, setBookings] = useState<PersonBooking[]>([makeEmptyPerson()])

  const [currentClientIndex, setCurrentClientIndex] = useState(0)
  const [clientSearchTarget, setClientSearchTarget] = useState(0)
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false)

  const [duplicateClient, setDuplicateClient] = useState<IClient | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<reservationPaymentMethodEnum>(reservationPaymentMethodEnum.cash)
  const [isPaid, setIsPaid] = useState(false)
  const [initialStatus, setInitialStatus] = useState<reservationStatusEnum>(reservationStatusEnum.pending)
  const [notes, setNotes] = useState('')

  // ── Derived data ──────────────────────────────────────────────────────────────

  const currentBooking = bookings[currentPersonIndex] ?? emptyPerson()

  const activeHairDressers = useMemo(
    () => hairDressers.filter(hd => hd.associationHairdresser?.active === true),
    [hairDressers],
  )

  const selectedService = useMemo(
    () => salon?.services.find(s => s.id === currentBooking.serviceId),
    [salon?.services, currentBooking.serviceId],
  )

  const qualifiedHairDressers = useMemo(() => {
    if (!selectedService) return activeHairDressers
    return activeHairDressers.filter(hd =>
      hd.associationHairdresser?.salonServiceIds?.includes(selectedService.categoryId),
    )
  }, [activeHairDressers, selectedService])

  const selectedHairdresser = useMemo(
    () => activeHairDressers.find(hd => hd.id === currentBooking.hairdresserId),
    [activeHairDressers, currentBooking.hairdresserId],
  )

  const totalDuration = useMemo(() => {
    if (!selectedService) return 0
    const suppDur = selectedService.supplements
      ?.filter(s => currentBooking.supplementNames.includes(s.name))
      .reduce((a, s) => a + s.duration, 0) ?? 0
    return selectedService.duration + suppDur
  }, [selectedService, currentBooking.supplementNames])

  const totalPriceForPerson = useMemo(() => {
    if (!selectedService) return 0
    const suppPrice = selectedService.supplements
      ?.filter(s => currentBooking.supplementNames.includes(s.name))
      .reduce((a, s) => a + s.price, 0) ?? 0
    return selectedService.price + suppPrice
  }, [selectedService, currentBooking.supplementNames])

  const hairdresserWorkingHours = useMemo(
    () => selectedHairdresser?.associationHairdresser?.workingHours ?? salon?.openingHours ?? [],
    [selectedHairdresser, salon?.openingHours],
  )

  // Fetch existing reservations for the selected hairdresser on the selected date
  const { data: hairdresserDayReservations = [], isFetching: isFetchingSlots } = useQuery({
    queryKey: ['hd-day-reservations-new', salon?.id, currentBooking.hairdresserId, currentBooking.date?.toISOString().slice(0, 10)],
    queryFn: async () => {
      if (!salon?.id || !currentBooking.hairdresserId || !currentBooking.date) return []
      const startOfDay = new Date(currentBooking.date); startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(currentBooking.date); endOfDay.setHours(23, 59, 59, 999)
      const all = await fetchCollection('reservations', [
        where('salonId', '==', salon.id),
      ]) as IReservation[]
      return all.filter(res =>
        res.status !== reservationStatusEnum.canceled &&
        res.people.some(p => {
          if (p.hairdresserId !== currentBooking.hairdresserId) return false
          const d = p.scheduledAt.toDate()
          return d >= startOfDay && d <= endOfDay
        }),
      )
    },
    enabled: !!salon?.id && !!currentBooking.hairdresserId && !!currentBooking.date,
  })

  const availableSlots = useMemo(() => {
    if (!currentBooking.date) return []
    const dayName = currentBooking.date.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
    const schedule = hairdresserWorkingHours.find(h => h.day.toLowerCase() === dayName)
    if (!schedule?.openDay) return []

    const blockedSet = new Set<string>()
    hairdresserDayReservations.forEach(res =>
      res.people.forEach(p => {
        if (p.hairdresserId !== currentBooking.hairdresserId) return
        const d = p.scheduledAt.toDate()
        const start = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        getOccupiedSlots(start, p.totalDuration).forEach(s => blockedSet.add(s))
      }),
    )

    let slots = generateTimeSlots(schedule.open, schedule.close)
    slots = filterByHairdresserHours(slots, currentBooking.date, hairdresserWorkingHours)
    slots = filterPassedHours(slots, currentBooking.date)
    return slots.filter(s => !blockedSet.has(s))
  }, [currentBooking.date, currentBooking.hairdresserId, hairdresserWorkingHours, hairdresserDayReservations])

  const totalSummaryPrice = useMemo(() =>
    bookings.reduce((sum, booking) => {
      const svc = salon?.services.find(s => s.id === booking.serviceId)
      if (!svc) return sum
      const suppPrice = svc.supplements?.filter(s => booking.supplementNames.includes(s.name)).reduce((a, s) => a + s.price, 0) ?? 0
      return sum + svc.price + suppPrice
    }, 0),
    [bookings, salon?.services],
  )

  // ── Mutation ──────────────────────────────────────────────────────────────────

  const createReservationMutation = useMutation({
    mutationFn: async () => {
      if (!salon?.id) throw new Error('Salon non trouvé')

      const people: IReservationPerson[] = bookings.map((booking, index) => {
        const service = salon.services.find(s => s.id === booking.serviceId)
        if (!service) throw new Error(`Service manquant pour la personne ${index + 1}`)
        const hairdresser = activeHairDressers.find(hd => hd.id === booking.hairdresserId)
        if (!hairdresser) throw new Error(`Coiffeur manquant pour la personne ${index + 1}`)
        if (!booking.date || !booking.time) throw new Error(`Date/heure manquante pour la personne ${index + 1}`)

        const suppDetails = service.supplements?.filter(s => booking.supplementNames.includes(s.name)) ?? []
        const suppTotalPrice = suppDetails.reduce((a, s) => a + s.price, 0)
        const suppTotalDuration = suppDetails.reduce((a, s) => a + s.duration, 0)
        const personDuration = service.duration + suppTotalDuration
        const personPrice = service.price + suppTotalPrice

        const scheduledAt = new Date(booking.date)
        const [h = 0, m = 0] = booking.time.split(':').map(Number)
        scheduledAt.setHours(h, m, 0, 0)
        const endsAt = new Date(scheduledAt.getTime() + personDuration * 60 * 1000)

        return {
          personNumber: index + 1,
          serviceId: service.id,
          serviceName: service.name,
          serviceDuration: service.duration,
          servicePrice: service.price,
          hairdresserId: hairdresser.id,
          hairdresserName: hairdresser.name,
          supplements: suppDetails,
          supplementsTotalPrice: suppTotalPrice,
          supplementsTotalDuration: suppTotalDuration,
          totalPrice: personPrice,
          totalDuration: personDuration,
          scheduledAt: Timestamp.fromDate(scheduledAt),
          endsAt: Timestamp.fromDate(endsAt),
        }
      })

      const sorted = [...people].sort((a, b) => a.scheduledAt.seconds - b.scheduledAt.seconds)
      const firstBooking = bookings[0]!
      const reservationNumber = String(Math.floor(Math.random() * 90000) + 10000)
      const totalPrice = people.reduce((sum, p) => sum + p.totalPrice, 0)
      const isSingle = bookings.length === 1

      const reservationId = await createDocument('reservations', {
        salonId: salon.id,
        reservationNumber,
        createdAt: Timestamp.now(),
        clientName: isSingle ? firstBooking.clientName : `${firstBooking.clientName} +${bookings.length - 1}`,
        clientPhone: firstBooking.clientPhone,
        clientEmail: firstBooking.clientEmail || null,
        userId: null,
        isGuest: true,
        status: initialStatus,
        notes: notes || '',
        isPaid,
        paymentMethod,
        isSingleReservation: isSingle,
        totalPrice,
        people,
        earliestScheduledAt: sorted[0]?.scheduledAt,
        latestEndsAt: sorted.at(-1)?.endsAt,
      })

      await Promise.all([
        logActivity({
          salonId: salon.id,
          type: 'reservation_created',
          ...getCurrentActor(),
          action: 'created',
          resourceId: reservationId,
          resourceType: 'reservation',
          resourceLabel: `Réservation de ${isSingle ? firstBooking.clientName : `${firstBooking.clientName} +${bookings.length - 1}`}`,
          metadata: { montant: `${totalPrice} XAF`, personnes: bookings.length },
        }),
        createNotification({
          salonId: salon.id,
          type: 'reservation_created',
          title: 'Nouvelle réservation',
          body: `${isSingle ? firstBooking.clientName : `${firstBooking.clientName} +${bookings.length - 1}`} · ${totalPrice} XAF`,
          resourceId: reservationId,
          resourceType: 'reservation',
        }),
      ])

      const resolvedClientIds: string[] = []
      for (const booking of bookings) {
        let clientId = booking.linkedClientId
        if (!clientId && booking.saveAsRegularClient) {
          const existing = await fetchCollection('clients', [
            where('salonId', '==', salon.id),
            where('phone', '==', booking.clientPhone),
          ]) as IClient[]
          clientId = existing.length > 0
            ? existing[0].id
            : await createDocument('clients', {
                salonId: salon.id,
                name: booking.clientName,
                phone: booking.clientPhone,
                email: booking.clientEmail || null,
                history: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
        }
        if (clientId) resolvedClientIds.push(clientId)
      }

      for (const clientId of [...new Set(resolvedClientIds)]) {
        const clients = await fetchCollection('clients', [where('id', '==', clientId)]) as IClient[]
        if (clients.length > 0) {
          const client = clients[0]
          const history = Array.isArray(client.history) ? client.history : []
          const alreadyLinked = history.some(entry =>
            typeof entry === 'string' ? entry === reservationId : entry.id === reservationId
          )
          if (!alreadyLinked) {
            await editDocument('clients', clientId, {
              ...client,
              history: [...history, { id: reservationId, type: 'reservation' }],
              updatedAt: new Date().toISOString(),
            })
          }
        }
      }

      return reservationId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-calendar-month'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Réservation créée avec succès')
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleClose = () => {
    setPhase(0); setPersonSubStep('service'); setCurrentPersonIndex(0)
    setShowPersonConfirm(false); setBookings([makeEmptyPerson()]); setCurrentClientIndex(0)
    setDuplicateClient(null)
    setPaymentMethod(reservationPaymentMethodEnum.cash); setIsPaid(false)
    setInitialStatus(reservationStatusEnum.pending); setNotes('')
    onOpenChange(false)
  }

  const updateCurrentBooking = (updates: Partial<PersonBooking>) =>
    setBookings(prev => prev.map((b, i) => i === currentPersonIndex ? { ...b, ...updates } : b))

  const handleAddPerson = () => {
    setBookings(prev => [...prev, makeEmptyPerson()])
    setCurrentPersonIndex(bookings.length)
    setPersonSubStep('service')
    setShowPersonConfirm(false)
  }

  const handleRemovePerson = (index: number) => {
    if (bookings.length <= 1) return
    const next = bookings.filter((_, i) => i !== index)
    setBookings(next)
    if (currentPersonIndex >= next.length) setCurrentPersonIndex(next.length - 1)
  }

  const handleImportClient = (client: IClient) => {
    setBookings(prev => prev.map((b, i) => i === clientSearchTarget ? {
      ...b,
      clientName: client.name, clientPhone: client.phone,
      clientEmail: client.email || '', linkedClientId: client.id, saveAsRegularClient: true,
    } : b))
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  const goNext = () => {
    if (phase === 0 && !showPersonConfirm) {
      if (personSubStep === 'service') {
        if (!currentBooking.serviceId) { toast.error('Sélectionnez un service'); return }
        setPersonSubStep('hairdresser')
      } else if (personSubStep === 'hairdresser') {
        if (!currentBooking.hairdresserId) { toast.error('Sélectionnez un coiffeur'); return }
        setPersonSubStep('datetime')
      } else if (personSubStep === 'datetime') {
        if (!currentBooking.date || !currentBooking.time) { toast.error('Sélectionnez une date et un créneau'); return }
        setShowPersonConfirm(true)
      }
      return
    }
    if (phase === 0 && showPersonConfirm) {
      setPhase(1); setCurrentClientIndex(0); return
    }
    if (phase === 1) {
      const b = bookings[currentClientIndex]
      if (!b?.clientName || !b?.clientPhone) { toast.error('Nom et téléphone requis'); return }
      if (b.saveAsRegularClient && duplicateClient) {
        toast.error(`"${duplicateClient.name}" existe déjà avec ce numéro : importez-le ou décochez "client régulier"`)
        return
      }
      setDuplicateClient(null)
      if (currentClientIndex < bookings.length - 1) { setCurrentClientIndex(c => c + 1); return }
      setPhase(2)
    }
  }

  const goBack = () => {
    if (phase === 2) { setPhase(1); setCurrentClientIndex(bookings.length - 1); return }
    if (phase === 1) {
      if (currentClientIndex > 0) { setCurrentClientIndex(c => c - 1); return }
      setPhase(0); setShowPersonConfirm(true); return
    }
    if (showPersonConfirm) { setShowPersonConfirm(false); return }
    if (personSubStep === 'datetime') { setPersonSubStep('hairdresser'); return }
    if (personSubStep === 'hairdresser') { setPersonSubStep('service'); return }
    if (personSubStep === 'service' && currentPersonIndex > 0) {
      setCurrentPersonIndex(currentPersonIndex - 1); setShowPersonConfirm(true)
    }
  }

  // ── Sub-step label ────────────────────────────────────────────────────────────

  const subStepLabel = (() => {
    if (phase === 1) return `Client ${currentClientIndex + 1} / ${bookings.length}`
    if (phase === 2) return 'Paiement & confirmation'
    if (showPersonConfirm) return `${bookings.length} personne${bookings.length > 1 ? 's' : ''} — récapitulatif`
    const labels: Record<PersonSubStep, string> = {
      service: 'Service & suppléments',
      hairdresser: 'Coiffeur',
      datetime: 'Date & horaire',
    }
    return `Personne ${currentPersonIndex + 1} · ${labels[personSubStep]}`
  })()

  const showBackButton = phase > 0 || personSubStep !== 'service' || showPersonConfirm || currentPersonIndex > 0

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog open={open} onOpenChange={o => { if (!o) handleClose() }}>
        <DialogContent
          showCloseButton={false}
          className="max-w-3xl w-full p-0 overflow-hidden bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0"
        >
          <DialogTitle className="sr-only">Nouvelle réservation</DialogTitle>
          <form onSubmit={e => e.preventDefault()}>

            {/* Header */}
            <div className="px-8 pt-7 pb-5 border-b border-[#F0EAE4] dark:border-slate-800/50">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight">
                      Nouvelle réservation
                    </h2>
                    <p className="text-[12px] text-slate-400 dark:text-slate-500">{subStepLabel}</p>
                  </div>
                </div>
                <button
                  type="button" onClick={handleClose} aria-label="Fermer"
                  className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <Stepper current={phase} />
            </div>

            {/* Body — step content */}
            <div className="px-8 py-6 space-y-4 max-h-[66vh] overflow-y-auto">

              {/* ── Phase 0 · Prestation ── */}
              {phase === 0 && !showPersonConfirm && personSubStep === 'service' && (
                <ServiceStep
                  services={salon?.services ?? []}
                  selectedServiceId={currentBooking.serviceId}
                  supplementNames={currentBooking.supplementNames}
                  selectedService={selectedService}
                  totalDuration={totalDuration}
                  totalPrice={totalPriceForPerson}
                  onServiceSelect={id => updateCurrentBooking({ serviceId: id, supplementNames: [], hairdresserId: '', date: null, time: null })}
                  onSupplementToggle={name => updateCurrentBooking({
                    supplementNames: currentBooking.supplementNames.includes(name)
                      ? currentBooking.supplementNames.filter(n => n !== name)
                      : [...currentBooking.supplementNames, name],
                    time: null,
                  })}
                />
              )}

              {phase === 0 && !showPersonConfirm && personSubStep === 'hairdresser' && (
                <HairdresserStep
                  personIndex={currentPersonIndex}
                  qualifiedHairDressers={qualifiedHairDressers}
                  selectedId={currentBooking.hairdresserId}
                  onSelect={id => updateCurrentBooking({ hairdresserId: id, date: null, time: null })}
                />
              )}

              {phase === 0 && !showPersonConfirm && personSubStep === 'datetime' && (
                <DateTimeStep
                  date={currentBooking.date}
                  time={currentBooking.time}
                  availableSlots={availableSlots}
                  totalDuration={totalDuration}
                  hairdresserId={currentBooking.hairdresserId}
                  hairdresserWorkingHours={hairdresserWorkingHours}
                  isLoadingSlots={isFetchingSlots}
                  onDateChange={date => updateCurrentBooking({ date, time: null })}
                  onTimeChange={time => updateCurrentBooking({ time })}
                />
              )}

              {phase === 0 && showPersonConfirm && (
                <PersonConfirmStep
                  bookings={bookings}
                  services={salon?.services ?? []}
                  hairDressers={activeHairDressers}
                  onAddPerson={handleAddPerson}
                  onRemovePerson={handleRemovePerson}
                />
              )}

              {/* ── Phase 1 · Clients ── */}
              {phase === 1 && (() => {
                const b = bookings[currentClientIndex]!
                const svc = salon?.services.find(s => s.id === b.serviceId)
                const hd = activeHairDressers.find(h => h.id === b.hairdresserId)
                return (
                  <ClientInfoStep
                    currentIndex={currentClientIndex}
                    totalCount={bookings.length}
                    booking={b}
                    serviceName={svc?.name}
                    hairdresserName={hd?.name}
                    salonId={salon?.id ?? null}
                    phonePrefix={phonePrefix}
                    duplicateClient={duplicateClient}
                    onUpdate={updates => setBookings(prev => prev.map((bk, i) => i === currentClientIndex ? { ...bk, ...updates } : bk))}
                    onOpenSearch={() => { setClientSearchTarget(currentClientIndex); setIsClientSearchOpen(true) }}
                    onRemoveImported={() => setBookings(prev => prev.map((bk, i) => i === currentClientIndex
                      ? { ...bk, clientName: '', clientPhone: '', clientEmail: '', linkedClientId: null, saveAsRegularClient: false }
                      : bk
                    ))}
                    onDuplicateChange={setDuplicateClient}
                    onImportDuplicate={client => {
                      setBookings(prev => prev.map((bk, i) => i === currentClientIndex ? {
                        ...bk,
                        clientName: client.name, clientPhone: client.phone,
                        clientEmail: client.email || '', linkedClientId: client.id, saveAsRegularClient: true,
                      } : bk))
                      setDuplicateClient(null)
                    }}
                  />
                )
              })()}

              {/* ── Phase 2 · Finalisation ── */}
              {phase === 2 && (
                <FinalisationStep
                  bookings={bookings}
                  services={salon?.services ?? []}
                  hairDressers={activeHairDressers}
                  paymentMethod={paymentMethod}
                  isPaid={isPaid}
                  initialStatus={initialStatus}
                  notes={notes}
                  totalPrice={totalSummaryPrice}
                  onPaymentMethodChange={setPaymentMethod}
                  onIsPaidToggle={() => setIsPaid(v => !v)}
                  onStatusChange={setInitialStatus}
                  onNotesChange={setNotes}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50 bg-[#FAF7F4] dark:bg-slate-800/30">
              {showBackButton ? (
                <button
                  type="button" onClick={goBack} disabled={createReservationMutation.isPending}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#F0EAE4] dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Précédent
                </button>
              ) : (
                <button
                  type="button" onClick={handleClose} disabled={createReservationMutation.isPending}
                  className="h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-[#F0EAE4] dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              )}

              {phase < 2 ? (
                <button
                  type="button" onClick={goNext}
                  className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                >
                  {phase === 0 && showPersonConfirm ? 'Infos clients' : 'Suivant'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button" onClick={() => createReservationMutation.mutate()}
                  disabled={createReservationMutation.isPending}
                  className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 transition-colors"
                >
                  {createReservationMutation.isPending
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Création...</>
                    : <><Check className="w-3.5 h-3.5" />Créer la réservation</>
                  }
                </button>
              )}
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
