import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { CreditCard, Smartphone } from 'lucide-react'
import Image from 'next/image'

interface PaymentMethodSelectionProps {
  onSelectCard: () => void
  onSelectMobileMoney: () => void
  onCancel: () => void
}

export default function PaymentMethodSelection({
  onSelectCard,
  onSelectMobileMoney,
  onCancel
}: PaymentMethodSelectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 text-center">
        Choisissez votre méthode de paiement
      </h3>
      
      <div className="grid gap-4">
        {/* Carte bancaire */}
        <Button
          variant="outline"
          onClick={onSelectCard}
          className="h-auto p-6 border-2 hover:cursor-pointer border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-800 group-hover:text-blue-700">
                Carte bancaire
              </div>
              <div className="text-sm text-gray-500">
                Visa, Mastercard, American Express
              </div>
            </div>
            <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </div>
        </Button>

        {/* Mobile Money */}
        <Button
          variant="outline"
          onClick={onSelectMobileMoney}
          className="h-auto p-6 border-2 hover:cursor-pointer border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <img src="/images/mobile-money.jpg"   className='w-full  h-full' alt="Mobile Money" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-800 group-hover:text-orange-700">
                Mobile Money
              </div>
              <div className="text-sm text-gray-500">
                Orange Money, MTN Mobile Money
              </div>
            </div>
            <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </div>
        </Button>
      </div>

      <div className="text-center pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="px-8 py-2 border border-gray-300 hover:bg-gray-50"
        >
          Annuler
        </Button>
      </div>
    </div>
  )
}
