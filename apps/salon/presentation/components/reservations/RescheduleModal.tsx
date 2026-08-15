'use client'

import React, { useMemo, useState } from 'react'
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
import { CalendarClock } from 'lucide-react'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useHairDressers } from '@zyra/core/usecases/useHairDressers'
import { useHairdresserSlots } from '@/hooks/useHairdresserSlots'
import { useRescheduleReservation } from '@zyra/core/usecases/useReservations'
import { getCurrentActor } from '@zyra/core/usecases/notificationsUseCases'
import SlotPicker from './SlotPicker'
import { toast } from 'sonner'

interface RescheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: IReservation
}

export default function RescheduleModal({ open, onOpenChange, reservation }: RescheduleModalProps) {
  const { salon } = useSalon()
  const { hairDressers } = useHairDressers()
  const reschedule = useRescheduleReservation()

  const currentHairdresserId = reservation.people[0]?.hairdresserId ?? ''
  const [hairdresserId, setHairdresserId] = useState(currentHairdresserId)
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)

  const totalDuration = useMemo(
    () => reservation.people.reduce((sum, p) => sum + (p.totalDuration || 0), 0),
    [reservation.people],
  )

  const activeHairdressers = useMemo(
    () => hairDressers
      .filter(hd => hd.associationHairdresser?.active)
      .map(hd => ({ id: hd.id, name: hd.name, photo: hd.photo, speciality: hd.speciality })),
    [hairDressers],
  )

  const { slots, isFetching, workingHours } = useHairdresserSlots({
    hairdresserId,
    date,
    durationMin: totalDuration,
    excludeReservationId: reservation.id,
    enabled: open,
  })

  const reset = () => { setHairdresserId(currentHairdresserId); setDate(null); setTime(null) }

  const handleConfirm = async () => {
    if (!date || !time) return
    const hd = hairDressers.find(h => h.id === hairdresserId)
    try {
      await reschedule.mutateAsync({
        reservation,
        date,
        time,
        ...(hairdresserId && hairdresserId !== currentHairdresserId ? { hairdresserId, hairdresserName: hd?.name } : {}),
        logContext: salon?.id
          ? { salonId: salon.id, ...getCurrentActor(), resourceLabel: `Réservation #${reservation.reservationNumber} · ${reservation.clientName}` }
          : undefined,
      })
      toast.success('Réservation reprogrammée')
      onOpenChange(false)
      reset()
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la reprogrammation')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={o => { onOpenChange(o); if (!o) reset() }}>
      <AlertDialogContent className="max-w-lg rounded-2xl border-[#F0EAE4] dark:border-slate-800/50 max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        <AlertDialogHeader className="px-6 pt-5 pb-4 border-b border-[#F0EAE4] dark:border-slate-800/50 gap-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <AlertDialogTitle className="text-[15px] font-extrabold text-slate-800 dark:text-white">
                Reprogrammer la réservation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[12px]">
                #{reservation.reservationNumber} · {reservation.clientName} · {totalDuration} min
              </AlertDialogDescription>
            </div>
          </div>
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
            durationMin={totalDuration}
            slots={slots}
            isFetching={isFetching}
            workingHours={workingHours}
          />
        </ScrollArea>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50">
          <AlertDialogCancel onClick={reset} disabled={reschedule.isPending} className="rounded-xl text-[12px]">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!date || !time || reschedule.isPending}
            className="rounded-xl text-[12px] bg-violet-500 hover:bg-violet-600"
          >
            {reschedule.isPending ? 'Reprogrammation...' : 'Reprogrammer'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
