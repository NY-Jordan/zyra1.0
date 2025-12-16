'use client'

import React from 'react'
import { Heart, Share2, BookOpen } from 'lucide-react'
import { Button } from '@zyra/ui/components/button'

interface SalonStickyActionBarProps {
  salonId: string
  onReserveClick?: () => void
}

export function SalonStickyActionBar({
  salonId,
  onReserveClick,
}: SalonStickyActionBarProps) {
  return (
    <div className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <Button
            onClick={onReserveClick}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
          >
            <BookOpen className="h-5 w-5" />
            <span className="hidden sm:inline">Réserver maintenant</span>
            <span className="sm:hidden">Réserver</span>
          </Button>
          
          <button className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex-shrink-0 group">
            <Heart className="h-5 w-5 text-slate-600 group-hover:text-red-500 transition-colors" />
          </button>
          <button className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex-shrink-0">
            <Share2 className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
