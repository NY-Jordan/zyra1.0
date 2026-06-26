import React from 'react'
import { ArrowLeft, MapPin, Scissors, Loader2 } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface BookingHeaderProps {
  salon: ISalon | null
  currentStep: number
  isLoading: boolean
  onPrevious: () => void
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({ salon, currentStep, isLoading, onPrevious }) => {
  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#F0EAE4] h-14 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!salon) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-xl border-b border-[#F0EAE4]">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
        <button
          onClick={onPrevious}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F2EF] transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </button>
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Scissors className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-800 truncate">{salon.name}</p>
          {salon.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-[11px] text-slate-500 truncate">{salon.city}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
