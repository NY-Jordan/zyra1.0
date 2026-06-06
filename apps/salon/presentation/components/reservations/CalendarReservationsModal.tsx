'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
} from '@zyra/ui/components/dialog'
import { useReservationCalendar } from '@/hooks/useReservationCalendar'
import ReservationDetailsModal from './ReservationDetailsModal'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { CalendarReservationsTopBar } from './calendar/CalendarReservationsTopBar'
import { CalendarReservationsSidebar } from './calendar/CalendarReservationsSidebar'
import { CalendarReservationsGrid } from './calendar/CalendarReservationsGrid'

// ----- Props -----
interface CalendarReservationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ----- Main component -----
export default function CalendarReservationsModal({
  open,
  onOpenChange,
}: CalendarReservationsModalProps) {
  const {
    selectedDate,
    setSelectedDate,
    hairDressers,
    dayReservations,
    eventsByColumn,
    columns,
    daysWithReservations,
    isLoading,
    goToday,
    goPrev,
    goNext,
  } = useReservationCalendar()

  const [detailReservation, setDetailReservation] = React.useState<IReservation | null>(null)

  const dayLabel = selectedDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          style={{ maxWidth: 'none' }}
          className="h-[94vh] w-[96vw] max-w-none gap-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/85 p-0 shadow-2xl shadow-slate-300/30 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/40"
        >
          <CalendarReservationsTopBar
            dayLabel={dayLabel}
            onToday={goToday}
            onPrev={goPrev}
            onNext={goNext}
            onClose={() => onOpenChange(false)}
          />

          <div className="flex flex-1 overflow-hidden">
            <CalendarReservationsSidebar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              daysWithReservations={daysWithReservations}
              dayReservationsCount={dayReservations.length}
            />
            <CalendarReservationsGrid
              columns={columns}
              hairDressers={hairDressers}
              eventsByColumn={eventsByColumn}
              isLoading={isLoading}
              onSelectReservation={setDetailReservation}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Reservation detail modal */}
      {detailReservation && (
        <ReservationDetailsModal
          reservation={detailReservation}
          open={!!detailReservation}
          onReservationUpdated={setDetailReservation}
          onOpenChange={(v) => { if (!v) setDetailReservation(null) }}
        />
      )}
    </>
  )
}
