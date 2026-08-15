'use client'

import React from 'react'
import { Calendar, CheckCircle2, Clock, MapPin, Scissors } from 'lucide-react'
import { Booking } from '../../../app/booking/[id]/types'
import { computeBookingTotals } from '../../../app/booking/[id]/bookingTotals'

interface BookingSuccessProps {
  salonName: string
  salonAddress?: string | null
  reservationNumber: string
  booking: Booking
  hairdresserName?: string | null
  onBackHome: () => void
  onViewSalon: () => void
}

export function BookingSuccess({
  salonName,
  salonAddress,
  reservationNumber,
  booking,
  hairdresserName,
  onBackHome,
  onViewSalon,
}: BookingSuccessProps) {
  const { price } = computeBookingTotals(booking)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="booking-modal w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_20px_60px_-20px_rgba(15,23,42,0.15)]">
          <div className="flex flex-col items-center text-center px-6 pt-8 pb-6 bg-emerald-50">
            <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center mb-4">
              <CheckCircle2 className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-[20px] font-extrabold text-slate-900">Réservation confirmée</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Numéro de réservation <span className="font-semibold text-slate-700">#{reservationNumber}</span>
            </p>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Scissors className="h-4 w-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{booking.service?.name}</p>
                <p className="text-[12px] text-slate-500 truncate">
                  Chez {salonName}
                  {hairdresserName ? ` · avec ${hairdresserName}` : ''}
                </p>
              </div>
            </div>

            {booking.date && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[13px] text-slate-700">
                  {booking.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            )}

            {booking.time && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[13px] text-slate-700">{booking.time}</p>
              </div>
            )}

            {salonAddress && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[13px] text-slate-700 truncate">{salonAddress}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[13px] font-semibold text-slate-600">Total</span>
              <span className="text-[16px] font-extrabold text-slate-900">{price.toLocaleString()} XAF</span>
            </div>
          </div>

          <div className="p-5 pt-0 flex flex-col gap-2">
            <button
              onClick={onViewSalon}
              className="w-full h-11 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-bold transition-all active:scale-[0.98]"
            >
              Voir le salon
            </button>
            <button
              onClick={onBackHome}
              className="w-full h-11 rounded-2xl border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
