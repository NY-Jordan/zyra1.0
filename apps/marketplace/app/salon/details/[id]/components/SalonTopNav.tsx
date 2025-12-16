'use client'

import React from 'react'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SalonTopNavProps {
  salonName: string
  salonCity: string
  onBack?: () => void
}

export function SalonTopNav({
  salonName,
  salonCity,
  onBack,
}: SalonTopNavProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-200 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={handleBack}
          className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors duration-300 flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5 sm:h-5 sm:w-5 text-slate-900" />
        </button>

        <div className="flex-1 text-center min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{salonName}</h1>
          <p className="text-xs sm:text-sm text-slate-600 truncate">{salonCity}</p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors duration-300">
            <Share2 className="h-5 w-5 text-slate-600" />
          </button>
          <button className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors duration-300">
            <Heart className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
