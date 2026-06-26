import React from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

interface BookingNavigationProps {
  currentStep: number
  reservationType: 'single' | 'multiple' | null
  canGoNext: boolean
  isLastStep: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  disablePrevious?: boolean
  isSubmitting?: boolean
}

export const BookingNavigation: React.FC<BookingNavigationProps> = ({
  currentStep,
  reservationType,
  canGoNext,
  isLastStep,
  onPrevious,
  onNext,
  onSubmit,
  disablePrevious,
  isSubmitting,
}) => {
  const showSubmit = (reservationType === 'single' && currentStep === 6) ||
                     (reservationType === 'multiple' && currentStep === 8)

  return (
    <div className="flex items-center justify-between pt-5 border-t border-[#F0EAE4] mt-6">
      <button
        onClick={onPrevious}
        disabled={disablePrevious || currentStep === 1}
        className="flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-semibold text-slate-600 border border-[#E8E0D8] hover:bg-[#F5F2EF] disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </button>

      {!showSubmit && !isLastStep && (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm shadow-emerald-500/20"
        >
          Continuer
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      {showSubmit && (
        <button
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm shadow-emerald-500/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Confirmation...
            </>
          ) : (
            <>
              <CheckCircle className="h-3.5 w-3.5" />
              Confirmer la réservation
            </>
          )}
        </button>
      )}
    </div>
  )
}
