import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface BookingHeaderProps {
  salon: ISalon | null
  currentStep: number
  isLoading: boolean
  onPrevious: () => void
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  salon,
  currentStep,
  isLoading,
  onPrevious,
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Salon non trouvé</p>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={onPrevious}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      {currentStep === 1 && (
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {salon.name}
          </h1>
          <p className="text-lg text-gray-600">{salon.address}, {salon.city}</p>
        </div>
      )}
    </div>
  )
}
