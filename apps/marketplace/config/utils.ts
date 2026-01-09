export const generateTimeSlots = (openTime: string, closeTime: string) => {
  const slots = []
  const [openHour = 0, openMinute = 0] = openTime.split(':').map(Number)
  const [closeHour = 23, closeMinute = 59] = closeTime.split(':').map(Number)
  
  const openInMinutes = openHour * 60 + openMinute
  const closeInMinutes = closeHour * 60 + closeMinute
  
  // Créneaux de 30 minutes (inclut l'heure de fermeture)
  for (let time = openInMinutes; time < closeInMinutes; time += 30) {
    const hour = Math.floor(time / 60)
    const minute = time % 60
    slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
  }

  // Ajouter l'heure de fermeture
  slots.push(`${closeHour.toString().padStart(2, '0')}:${closeMinute.toString().padStart(2, '0')}`)
  return slots
}
