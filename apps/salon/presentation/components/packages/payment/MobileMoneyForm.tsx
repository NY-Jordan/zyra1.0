import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Phone } from 'lucide-react'
import PhoneValidator from '../PhoneValidator'

type OperatorType = 'mtn' | 'orange' | null

interface MobileMoneyFormProps {
  phoneNumber: string
  operator: OperatorType
  onPhoneChange: (value: string) => void
  onOperatorChange: (operator: OperatorType) => void
  onGoBack: () => void
  onSubmit: () => void
  isValid: boolean
}

export default function MobileMoneyForm({
  phoneNumber,
  operator,
  onPhoneChange,
  onOperatorChange,
  onGoBack,
  onSubmit,
  isValid
}: MobileMoneyFormProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">Paiement Mobile Money</h3>
        <p className="text-sm text-gray-500 mt-1">
          Choisissez votre opérateur et entrez votre numéro
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sélectionnez votre opérateur
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={operator === 'orange' ? 'default' : 'outline'}
              onClick={() => onOperatorChange('orange')}
              className={`h-auto p-4 border-2 transition-all duration-200 ${
                operator === 'orange' 
                  ? 'border-orange-500 bg-orange-500 text-white shadow-lg' 
                  : 'border-gray-200 hover:border-orange-400 text-black hover:text-black hover:bg-orange-50'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">Orange</div>
                <div className="text-xs opacity-80">Money</div>
              </div>
            </Button>
            <Button
              variant={operator === 'mtn' ? 'default' : 'outline'}
              onClick={() => onOperatorChange('mtn')}
              className={`h-auto p-4 border-2 transition-all duration-200 ${
                operator === 'mtn' 
                  ? 'border-yellow-500 bg-yellow-500 text-white shadow-lg' 
                  : 'border-gray-200 hover:border-orange-400 text-black hover:text-black hover:bg-orange-50'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">MTN</div>
                <div className="text-xs opacity-80">Mobile Money</div>
              </div>
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone
          </label>
          <div className="relative">
            <Input
              type="tel"
              placeholder="+237677123456 ou 677123456"
              value={phoneNumber}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-black text-base font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              maxLength={17}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
              <Phone className="h-3 w-3 text-gray-600" />
            </div>
          </div>
          
          {/* Validation du numéro */}
          <PhoneValidator phoneNumber={phoneNumber} operator={operator} />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onGoBack} 
          className="flex-1 py-3 border border-gray-300 hover:bg-gray-50"
        >
          Retour
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={!isValid}
          className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold shadow-lg disabled:shadow-none"
        >
          📱 Payer
        </Button>
      </div>
    </div>
  )
}
