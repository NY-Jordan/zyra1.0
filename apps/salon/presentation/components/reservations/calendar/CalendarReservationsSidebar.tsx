import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { CALENDAR_STATUS_META } from './calendarReservations.constants'

type Props = {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  daysWithReservations: Set<string>
  dayReservationsCount: number
}

const DAYS_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function getMiniCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(startOffset).fill(null)

  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function CalendarReservationsSidebar({
  selectedDate,
  setSelectedDate,
  daysWithReservations,
  dayReservationsCount,
}: Props) {
  const [miniMonth, setMiniMonth] = useState(() => ({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth(),
  }))

  const miniDays = useMemo(
    () => getMiniCalendarDays(miniMonth.year, miniMonth.month),
    [miniMonth],
  )

  const isToday = (d: Date) => {
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  }

  const isSelected = (day: number | null) => {
    if (!day) return false
    return (
      day === selectedDate.getDate()
      && miniMonth.month === selectedDate.getMonth()
      && miniMonth.year === selectedDate.getFullYear()
    )
  }

  const hasDot = (day: number | null) => {
    if (!day) return false
    const key = `${miniMonth.year}-${pad2(miniMonth.month + 1)}-${pad2(day)}`
    return daysWithReservations.has(key)
  }

  const selectDay = (day: number) => {
    setSelectedDate(new Date(miniMonth.year, miniMonth.month, day))
  }

  const prevMiniMonth = () => {
    setMiniMonth((m) => {
      const d = new Date(m.year, m.month - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const nextMiniMonth = () => {
    setMiniMonth((m) => {
      const d = new Date(m.year, m.month + 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="w-60 shrink-0 border-r bg-gray-50 flex flex-col gap-4 p-4 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMiniMonth} className="p-1 rounded hover:bg-gray-200 transition">
            <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
          </button>
          <span className="text-xs font-semibold text-gray-700 capitalize">
            {MONTHS_FR[miniMonth.month]} {miniMonth.year}
          </span>
          <button onClick={nextMiniMonth} className="p-1 rounded hover:bg-gray-200 transition">
            <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {DAYS_FR.map((d) => (
            <div key={d} className="text-[10px] text-center text-gray-400 font-medium py-0.5">{d}</div>
          ))}
          {miniDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center">
              {day ? (
                <button
                  onClick={() => selectDay(day)}
                  className={`w-7 h-7 rounded-full text-[11px] flex items-center justify-center transition font-medium ${
                    isSelected(day)
                      ? 'bg-blue-600 text-white'
                      : isToday(new Date(miniMonth.year, miniMonth.month, day))
                        ? 'ring-1 ring-blue-400 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ) : (
                <span className="w-7 h-7" />
              )}
              {hasDot(day) && !isSelected(day) && (
                <span className="w-1 h-1 rounded-full bg-blue-400 -mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide mb-2">Statuts</p>
        <div className="space-y-1.5">
          {(Object.keys(CALENDAR_STATUS_META) as reservationStatusEnum[]).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${CALENDAR_STATUS_META[status].dotClass}`} />
              <span className="text-[11px] text-gray-600">{CALENDAR_STATUS_META[status].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-2 border-t">
        <p className="text-[10px] text-gray-400 mb-1">Ce jour</p>
        <p className="text-xl font-bold text-gray-800">{dayReservationsCount}</p>
        <p className="text-[11px] text-gray-500">réservation{dayReservationsCount !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}
