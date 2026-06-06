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
    <div className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-200/70 bg-slate-50/80 p-4 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/55">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={prevMiniMonth}
            className="rounded-md p-1 transition hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-200">
            {MONTHS_FR[miniMonth.month]} {miniMonth.year}
          </span>
          <button
            onClick={nextMiniMonth}
            className="rounded-md p-1 transition hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 rounded-xl border border-slate-200/80 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/60">
          {DAYS_FR.map((d) => (
            <div key={d} className="py-0.5 text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">{d}</div>
          ))}
          {miniDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center">
              {day ? (
                <button
                  onClick={() => selectDay(day)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition ${
                    isSelected(day)
                      ? 'bg-sky-600 text-white dark:bg-sky-500'
                      : isToday(new Date(miniMonth.year, miniMonth.month, day))
                        ? 'ring-1 ring-sky-400 text-sky-700 dark:text-sky-300'
                        : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              ) : (
                <span className="w-7 h-7" />
              )}
              {hasDot(day) && !isSelected(day) && (
                <span className="-mt-1 h-1 w-1 rounded-full bg-sky-400 dark:bg-sky-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Statuts</p>
        <div className="space-y-1.5">
          {(Object.keys(CALENDAR_STATUS_META) as reservationStatusEnum[]).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${CALENDAR_STATUS_META[status].dotClass}`} />
              <span className="text-[11px] text-slate-600 dark:text-slate-300">{CALENDAR_STATUS_META[status].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
        <p className="mb-1 text-[10px] text-slate-400 dark:text-slate-500">Ce jour</p>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{dayReservationsCount}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">réservation{dayReservationsCount !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}
