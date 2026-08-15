import React from 'react'
import { Calendar, Clock, Scissors, Sparkles, User } from 'lucide-react'
import { Booking } from '../../../app/booking/[id]/types'
import { computeBookingTotals } from '../../../app/booking/[id]/bookingTotals'
import { formatDuration } from '@/lib/timeHelpers'

interface BookingSummaryProps {
  salonName: string
  booking: Booking | undefined
  hairdresserName?: string | null
}

export function BookingSummary({ salonName, booking, hairdresserName }: BookingSummaryProps) {
  const { duration, price } = computeBookingTotals(booking)
  const hasService = !!booking?.service

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Votre réservation</p>
        <p className="text-[14px] font-bold text-slate-900 truncate mt-0.5">{salonName}</p>
      </div>

      {!hasService ? (
        <div className="p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2">
            <Scissors className="h-4 w-4 text-slate-300" />
          </div>
          <p className="text-[12px] text-slate-400">Choisissez un service pour commencer</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* Service */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Scissors className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-900 truncate">{booking!.service!.name}</p>
              <p className="text-[11px] text-slate-400">{formatDuration(booking!.service!.duration)}</p>
            </div>
            <p className="text-[13px] font-semibold text-slate-700 flex-shrink-0">
              {Number(booking!.service!.price).toLocaleString()} XAF
            </p>
          </div>

          {/* Supplements */}
          {booking!.supplements.map((s) => (
            <div key={s.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-slate-700 truncate">{s.name}</p>
              </div>
              <p className="text-[13px] text-slate-500 flex-shrink-0">+{Number(s.price).toLocaleString()} XAF</p>
            </div>
          ))}

          {/* Hairdresser — defaults to "any" until the visitor picks someone specific */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
              <User className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p className="text-[13px] text-slate-700 truncate">
              {hairdresserName || 'Coiffeur au choix du salon'}
            </p>
          </div>

          {/* Date & time */}
          {booking!.date && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="text-[13px] text-slate-700 truncate">
                {booking!.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          )}
          {booking!.time && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="text-[13px] text-slate-700 truncate">{booking!.time}</p>
            </div>
          )}
        </div>
      )}

      {hasService && (
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
          <div>
            <p className="text-[11px] text-slate-400">Total · {formatDuration(duration)}</p>
            <p className="text-[16px] font-extrabold text-slate-900">{price.toLocaleString()} XAF</p>
          </div>
        </div>
      )}
    </div>
  )
}
