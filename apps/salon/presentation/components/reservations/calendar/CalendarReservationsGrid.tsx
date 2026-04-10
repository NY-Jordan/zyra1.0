import { Loader2, User } from 'lucide-react'
import { CalendarEvent } from '@/hooks/useReservationCalendar'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { CALENDAR_STATUS_META } from './calendarReservations.constants'

type Column = {
  id: string
  label: string
  photo: string
}

type HairDresserLite = {
  id: string
  speciality?: string
}

type Props = {
  columns: Column[]
  hairDressers: HairDresserLite[]
  eventsByColumn: Record<string, CalendarEvent[]>
  isLoading: boolean
  onSelectReservation: (reservation: IReservation) => void
}

const HOUR_START = 8
const HOUR_END = 21
const HOUR_HEIGHT = 64
const GRID_HEIGHT = (HOUR_END - HOUR_START) * HOUR_HEIGHT
const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

type EventBlockProps = {
  event: CalendarEvent
  onClick: (reservation: IReservation) => void
}

function EventBlock({ event, onClick }: EventBlockProps) {
  const style = CALENDAR_STATUS_META[event.reservation.status]
  const topPx = ((event.startMinutes - HOUR_START * 60) / 60) * HOUR_HEIGHT
  const heightPx = Math.max((event.durationMinutes / 60) * HOUR_HEIGHT, 28)

  const startH = Math.floor(event.startMinutes / 60)
  const startM = event.startMinutes % 60
  const endMinutes = event.startMinutes + event.durationMinutes
  const endH = Math.floor(endMinutes / 60)
  const endM = endMinutes % 60

  return (
    <div
      className={`absolute left-1 right-1 rounded-md border ${style.bg} ${style.border} ${style.text} px-2 py-1 cursor-pointer hover:brightness-95 transition-all overflow-hidden select-none shadow-sm`}
      style={{ top: topPx, height: heightPx }}
      onClick={() => onClick(event.reservation)}
    >
      <p className="text-[11px] font-semibold leading-tight truncate">
        {pad2(startH)}:{pad2(startM)} - {pad2(endH)}:{pad2(endM)}
      </p>
      <p className="text-[11px] truncate font-medium mt-0.5">{event.reservation.clientName}</p>
      {heightPx > 44 && (
        <p className="text-[10px] truncate opacity-70 mt-0.5">{event.person.serviceName}</p>
      )}
    </div>
  )
}

export function CalendarReservationsGrid({
  columns,
  hairDressers,
  eventsByColumn,
  isLoading,
  onSelectReservation,
}: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="flex border-b bg-white shrink-0">
        <div className="w-16 shrink-0" />
        <div className="flex flex-1 overflow-x-auto">
          {columns.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-3 text-sm text-gray-400">
              Aucun coiffeur disponible
            </div>
          ) : (
            columns.map((col) => {
              const hd = hairDressers.find((h) => h.id === col.id)
              return (
                <div
                  key={col.id}
                  className="flex-1 min-w-[160px] flex flex-col items-center gap-1 py-3 border-l first:border-l-0"
                >
                  {col.photo ? (
                    <img
                      src={col.photo}
                      alt={col.label}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shadow">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight px-1">
                    {col.label}
                  </span>
                  {hd?.speciality && (
                    <span className="text-[10px] text-gray-400">{hd.speciality}</span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-400">Chargement...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="flex" style={{ minHeight: GRID_HEIGHT + 32 }}>
            <div className="w-16 shrink-0 relative" style={{ height: GRID_HEIGHT }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute w-full flex items-start justify-end pr-3"
                  style={{ top: (h - HOUR_START) * HOUR_HEIGHT - 8, height: HOUR_HEIGHT }}
                >
                  <span className="text-[10px] text-gray-400 font-medium">{pad2(h)}:00</span>
                </div>
              ))}
            </div>

            <div className="flex flex-1 overflow-x-auto">
              {columns.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                  Aucune réservation
                </div>
              ) : (
                columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex-1 min-w-[160px] relative border-l first:border-l-0"
                    style={{ height: GRID_HEIGHT }}
                  >
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="absolute w-full border-t border-gray-100"
                        style={{ top: (h - HOUR_START) * HOUR_HEIGHT }}
                      />
                    ))}
                    {hours.map((h) => (
                      <div
                        key={`${h}-half`}
                        className="absolute w-full border-t border-gray-50"
                        style={{ top: (h - HOUR_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                      />
                    ))}
                    {(eventsByColumn[col.id] ?? []).map((evt, idx) => (
                      <EventBlock
                        key={`${evt.reservation.id}-${idx}`}
                        event={evt}
                        onClick={onSelectReservation}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
