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
 * Formate une durée en minutes pour l'affichage (ex: "45 min", "1h30")
 * @param minutes - Durée en minutes
 * @returns Durée formatée
 */
export const formatDuration = (minutes: number): string => {
  const m = minutes || 0
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? `${h}h` : `${h}h${String(rem).padStart(2, '0')}`
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
