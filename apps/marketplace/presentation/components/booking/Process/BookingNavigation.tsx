import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface BookingNavigationProps {
  currentStep: number
  reservationType: 'single' | 'multiple' | null
  canGoNext: boolean
  isLastStep: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  disablePrevious?: boolean
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
}) => {
  const showSubmit = (reservationType === 'single' && currentStep === 6) || 
                     (reservationType === 'multiple' && currentStep === 8)

  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={disablePrevious || currentStep === 1}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Précédent
      </Button>

      {!showSubmit && !isLastStep && (
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continuer
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {showSubmit && (
        <Button
          onClick={onSubmit}
          disabled={!canGoNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Confirmer la réservation
        </Button>
      )}
    </div>
  )
}
