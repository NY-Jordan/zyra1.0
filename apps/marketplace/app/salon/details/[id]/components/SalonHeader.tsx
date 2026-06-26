'use client'

import React from 'react'
import { ArrowLeft, Heart, Share2, MapPin, Star } from 'lucide-react'

interface SalonHeaderProps {
  salonName: string
  salonCity: string
  rating?: number
  reviewCount?: number
  onBack?: () => void
}

export function SalonHeader({ salonName, salonCity, rating = 4.8, reviewCount = 128, onBack }: SalonHeaderProps) {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-xl border-b border-[#F0EAE4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F2EF] transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </button>
            <div className="min-w-0 hidden sm:block">
              <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">{salonName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-500 truncate">{salonCity}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[12px] font-bold text-amber-800">{rating}</span>
              <span className="text-[11px] text-amber-600">({reviewCount})</span>
            </div>
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-rose-50 transition-colors group">
              <Heart className="h-4 w-4 text-slate-500 group-hover:text-rose-500 transition-colors" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F2EF] transition-colors">
              <Share2 className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
      <div className="h-14" />
    </>
  )
}
