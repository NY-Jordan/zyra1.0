'use client'

import React, { useMemo, useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@zyra/ui/components/alert-dialog'
import { ScrollArea } from '@zyra/ui/components/scroll-area'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useHairDressers } from '@zyra/core/usecases/useHairDressers'
import { useHairdresserSlots } from '@/hooks/useHairdresserSlots'
import { useUpdatePersonHairdresser } from '@zyra/core/usecases/useReservations'
import { getCurrentActor } from '@zyra/core/usecases/notificationsUseCases'
import SlotPicker from './SlotPicker'
import { toast } from 'sonner'

interface ChangeHairdresserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: IReservation
  personIndex: number | null
  onUpdated: (reservation: IReservation) => void
}

export default function ChangeHairdresserDialog({
  open,
  onOpenChange,
  reservation,
  personIndex,
  onUpdated,
}: ChangeHairdresserDialogProps) {
  const { salon } = useSalon()
  const { hairDressers } = useHairDressers()
  const updatePerson = useUpdatePersonHairdresser()

  const person = personIndex !== null ? reservation.people[personIndex] : null

  const [hairdresserId, setHairdresserId] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)

  // Pré-sélectionne le coiffeur courant à l'ouverture
  useEffect(() => {
    if (open && person) {
      setHairdresserId(person.hairdresserId ?? '')
      setDate(null)
      setTime(null)
    }
  }, [open, personIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeHairdressers = useMemo(
    () => hairDressers
      .filter(hd => hd.associationHairdresser?.active)
      .map(hd => ({ id: hd.id, name: hd.name, photo: hd.photo, speciality: hd.speciality })),
    [hairDressers],
  )

  const duration = person?.totalDuration ?? 0

  const { slots, isFetching, workingHours } = useHairdresserSlots({
    hairdresserId,
    date,
    excludeReservationId: reservation.id,
    enabled: open,
  })

  const handleConfirm = async () => {
    if (personIndex === null || !hairdresserId || !date || !time) return
    const hd = hairDressers.find(h => h.id === hairdresserId)
    if (!hd) return
    try {
      const result = await updatePerson.mutateAsync({
        reservation,
        personIndex,
        hairdresserId,
        hairdresserName: hd.name,
        date,
        time,
        logContext: salon?.id
          ? { salonId: salon.id, ...getCurrentActor(), resourceLabel: `Réservation #${reservation.reservationNumber} · ${reservation.clientName}` }
          : undefined,
      })
      onUpdated({ ...reservation, people: result.updatedPeople })
      onOpenChange(false)
      toast.success('Coiffeur mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du coiffeur:', error)
      toast.error('Erreur lors de la mise à jour du coiffeur')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg rounded-2xl border-[#F0EAE4] dark:border-slate-800/50 max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        <AlertDialogHeader className="px-6 pt-5 pb-4 border-b border-[#F0EAE4] dark:border-slate-800/50">
          <AlertDialogTitle className="text-[15px] font-extrabold text-slate-800 dark:text-white">
            {person?.hairdresserId ? 'Changer le coiffeur' : 'Assigner un coiffeur'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[12px]">
            {person ? `${person.serviceName} · ${person.totalDuration} min` : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <SlotPicker
            hairdressers={activeHairdressers}
            hairdresserId={hairdresserId}
            onSelectHairdresser={setHairdresserId}
            date={date}
            onSelectDate={setDate}
            time={time}
            onSelectTime={setTime}
            durationMin={duration}
            slots={slots}
            isFetching={isFetching}
            workingHours={workingHours}
          />
        </ScrollArea>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50">
          <AlertDialogCancel disabled={updatePerson.isPending} className="rounded-xl text-[12px]">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!hairdresserId || !date || !time || updatePerson.isPending}
            className="rounded-xl text-[12px] bg-emerald-500 hover:bg-emerald-600"
          >
            {updatePerson.isPending ? 'Mise à jour...' : 'Confirmer'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
