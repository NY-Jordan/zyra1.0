'use client'

import React from 'react'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'

interface SalonHeaderProps {
  salonName: string
  salonCity: string
  rating?: number
  reviewCount?: number
  onBack?: () => void
}

export function SalonHeader({ salonName, salonCity, onBack }: SalonHeaderProps) {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#F0EAE4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center hover:bg-[#F5F2EF] transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-[18px] w-[18px] text-slate-700" />
            </button>
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{salonName}</p>
              <p className="text-[12px] text-slate-400 truncate">{salonCity}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F2EF] transition-colors group">
              <Heart className="h-[18px] w-[18px] text-slate-400 group-hover:text-rose-500 transition-colors" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F2EF] transition-colors">
              <Share2 className="h-[18px] w-[18px] text-slate-400" />
            </button>
          </div>
        </div>
      </div>
      <div className="h-14" />
    </>
  )
}
