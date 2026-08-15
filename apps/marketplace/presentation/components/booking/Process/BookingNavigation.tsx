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
                     (reservationType === 'multiple' && currentStep === 7)

  return (
    <div className="flex items-center justify-between pt-5 border-t border-slate-200 mt-6">
      <button
        onClick={onPrevious}
        disabled={disablePrevious || currentStep === 1}
        className="group flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.98]"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Retour
      </button>

      {!showSubmit && !isLastStep && (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="group flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold text-white bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shadow-emerald-500/10 active:scale-[0.98]"
        >
          Continuer
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

      {showSubmit && (
        <button
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold text-white bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shadow-emerald-500/10 active:scale-[0.98]"
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
