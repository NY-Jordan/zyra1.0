import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react'

interface PaymentHeaderProps {
  currentStep: 'method-selection' | 'card-details' | 'mobile-money' | 'processing' | 'success' | 'payment-confirmed' | 'error'
  selectedMethod: 'CARD' | 'MOBILE_MONEY' | null
  onGoBack: () => void
}

export default function PaymentHeader({ currentStep, selectedMethod, onGoBack }: PaymentHeaderProps) {
  return (
    <div className="flex items-center gap-3 text-xl">
      {currentStep !== 'method-selection' && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onGoBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
      )}
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
        {selectedMethod === 'CARD' ? (
          <CreditCard className="h-5 w-5 text-white" />
        ) : selectedMethod === 'MOBILE_MONEY' ? (
          <Smartphone className="h-5 w-5 text-white" />
        ) : (
          <CreditCard className="h-5 w-5 text-white" />
        )}
      </div>
      <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-bold">
        Paiement sécurisé
      </span>
    </div>
  )
}
