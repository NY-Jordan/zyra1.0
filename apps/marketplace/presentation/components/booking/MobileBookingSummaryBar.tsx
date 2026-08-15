'use client'

import React from 'react'
import { ChevronUp, ShoppingBag } from 'lucide-react'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from '@zyra/ui/components/drawer'
import { Booking } from '../../../app/booking/[id]/types'
import { computeBookingTotals } from '../../../app/booking/[id]/bookingTotals'
import { BookingSummary } from './BookingSummary'

interface MobileBookingSummaryBarProps {
  salonName: string
  booking: Booking | undefined
  hairdresserName?: string | null
}

export function MobileBookingSummaryBar({ salonName, booking, hairdresserName }: MobileBookingSummaryBarProps) {
  const { duration, price } = computeBookingTotals(booking)
  if (!booking?.service) return null

  return (
    <div className="lg:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <button className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition-transform active:scale-[0.99]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[13px] font-bold text-slate-900 truncate">{price.toLocaleString()} XAF</p>
                <p className="text-[11px] text-slate-400">{duration} min · Voir le détail</p>
              </div>
            </div>
            <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="border-b">
            <DrawerTitle>Récapitulatif de votre réservation</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <BookingSummary salonName={salonName} booking={booking} hairdresserName={hairdresserName} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
