import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'

export const timeToMin = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const minToTime = (total: number) =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`

export const getEndTime = (start: string, durationMin: number) =>
  minToTime(timeToMin(start) + durationMin)

export const generateTimeSlots = (open: string, close: string): string[] => {
  const slots: string[] = []
  const openMin = timeToMin(open)
  const closeMin = timeToMin(close)
  for (let t = openMin; t < closeMin; t += 30) slots.push(minToTime(t))
  slots.push(close)
  return slots
}

export const filterByHairdresserHours = (
  slots: string[],
  date: Date,
  workingHours: OpeningHour[],
): string[] => {
  const dayName = date.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
  const schedule = workingHours.find(h => h.day.toLowerCase() === dayName)
  if (!schedule?.openDay) return []
  const openMin = timeToMin(schedule.open)
  const closeMin = timeToMin(schedule.close)
  return slots.filter(s => {
    const m = timeToMin(s)
    return m >= openMin && m <= closeMin
  })
}

export const filterPassedHours = (slots: string[], date: Date): string[] => {
  const now = new Date()
  const todayNorm = new Date(now)
  todayNorm.setHours(0, 0, 0, 0)
  const dateNorm = new Date(date)
  dateNorm.setHours(0, 0, 0, 0)
  if (dateNorm.getTime() !== todayNorm.getTime()) return slots
  return slots.filter(s => {
    const [h = 0, m = 0] = s.split(':').map(Number)
    return h > now.getHours() || (h === now.getHours() && m > now.getMinutes())
  })
}

export const getBlockedSlots = (start: string, durationMin: number): string[] => {
  if (durationMin <= 0) return [start]
  const blocked = [start]
  let cur = timeToMin(start)
  let rem = durationMin
  while (rem > 0) {
    rem -= 30
    if (rem >= 0) {
      cur += 30
      blocked.push(minToTime(cur))
    }
  }
  return blocked
}
