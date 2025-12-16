'use client'

import React from 'react'
import { ArrowLeft, Search, MapPin, Clock, Phone, Heart, Share2, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SalonHeaderProps {
  salonName: string
  salonCity: string
  rating?: number
  reviewCount?: number
  onBack?: () => void
}

export function SalonHeader({
  salonName,
  salonCity,
  rating = 4.0,
  reviewCount = 128,
  onBack,
}: SalonHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <>
      {/* Premium Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-slate-100 transition-all duration-300 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-slate-900" />
              </button>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base font-bold text-slate-900 truncate">{salonName}</h1>
                <p className="text-xs text-slate-600 truncate">{salonCity}</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                <span className="text-sm font-semibold text-amber-900">{rating}</span>
                <span className="text-xs text-amber-700">({reviewCount})</span>
              </div>
              <button className="p-2 rounded-full hover:bg-slate-100 transition-all duration-300 group">
                <Heart className="h-5 w-5 text-slate-600 group-hover:text-red-500 transition-colors" />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 transition-all duration-300">
                <Share2 className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 sm:h-20" />
    </>
  )
}
