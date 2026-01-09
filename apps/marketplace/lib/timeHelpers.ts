/**
 * Calcule l'heure de fin basée sur l'heure de début et une durée en minutes
 * @param startTime - Heure de début au format "HH:MM"
 * @param durationMinutes - Durée en minutes
 * @returns Heure de fin au format "HH:MM"
 */
export const getEndTime = (startTime: string, durationMinutes: number): string => {
  if (durationMinutes === 0) return startTime
  
  const [startHour, startMin] = startTime.split(':').map(Number)
  if (startHour === undefined || startMin === undefined) return startTime
  
  let endHour = startHour
  let endMin = startMin + durationMinutes
  
  if (endMin >= 60) {
    endHour += Math.floor(endMin / 60)
    endMin = endMin % 60
  }
  
  return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`
}

/**
 * Convertit une heure au format "HH:MM" en minutes depuis minuit
 * @param time - Heure au format "HH:MM"
 * @returns Nombre de minutes depuis minuit
 */
export const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number)
  if (hour === undefined || minute === undefined) return 0
  return hour * 60 + minute
}

/**
 * Convertit des minutes depuis minuit en heure au format "HH:MM"
 * @param minutes - Nombre de minutes depuis minuit
 * @returns Heure au format "HH:MM"
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Crée une Date avec heure spécifique
 * @param date - Date de base
 * @param time - Heure au format "HH:MM"
 * @returns Date avec l'heure définie
 */
export const createDateWithTime = (date: Date, time: string): Date => {
  const [hour, minute] = time.split(':').map(Number)
  const newDate = new Date(date)
  newDate.setHours(hour || 0, minute || 0, 0, 0)
  return newDate
}

/**
 * Ajoute une durée en minutes à une Date
 * @param date - Date de base
 * @param minutes - Nombre de minutes à ajouter
 * @returns Nouvelle Date avec la durée ajoutée
 */
export const addMinutesToDate = (date: Date, minutes: number): Date => {
  const newDate = new Date(date)
  newDate.setMinutes(newDate.getMinutes() + minutes)
  return newDate
}
