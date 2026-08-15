import { Booking } from './types'

export interface BookingTotals {
  duration: number
  price: number
}

/** Shared by the live summary card and the final submit handler, so the
 *  number shown while booking always matches what actually gets saved. */
export function computeBookingTotals(booking: Booking | undefined | null): BookingTotals {
  if (!booking?.service) return { duration: 0, price: 0 }

  const supplementsDuration = booking.supplements.reduce((sum, s) => sum + (s.duration || 0), 0)
  const supplementsPrice = booking.supplements.reduce((sum, s) => sum + (s.price || 0), 0)

  return {
    duration: (booking.service.duration || 0) + supplementsDuration,
    price: Number(booking.service.price || 0) + supplementsPrice,
  }
}
