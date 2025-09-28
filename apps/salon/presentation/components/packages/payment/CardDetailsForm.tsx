import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'

interface CardDetails {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

interface CardDetailsFormProps {
  cardDetails: CardDetails
  onCardDetailsChange: (details: CardDetails) => void
  onGoBack: () => void
  onSubmit: () => void
  isValid: boolean
}

export default function CardDetailsForm({
  cardDetails,
  onCardDetailsChange,
  onGoBack,
  onSubmit,
  isValid
}: CardDetailsFormProps) {
  
  // Formater le numéro de carte
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Formater la date d'expiration
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '')
    }
    return v
  }

  const handleCardNumberChange = (value: string) => {
    onCardDetailsChange({
      ...cardDetails,
      cardNumber: formatCardNumber(value)
    })
  }

  const handleExpiryDateChange = (value: string) => {
    onCardDetailsChange({
      ...cardDetails,
      expiryDate: formatExpiryDate(value)
    })
  }

  const handleCvvChange = (value: string) => {
    onCardDetailsChange({
      ...cardDetails,
      cvv: value.replace(/\D/g, '')
    })
  }

  const handleCardholderNameChange = (value: string) => {
    onCardDetailsChange({
      ...cardDetails,
      cardholderName: value
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">Informations de la carte</h3>
        <p className="text-sm text-gray-500 mt-1">Vos données sont sécurisées et chiffrées</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du titulaire
          </label>
          <Input
            type="text"
            placeholder="Jean Dupont"
            value={cardDetails.cardholderName}
            onChange={(e) => handleCardholderNameChange(e.target.value)}
            className="w-full p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de carte
          </label>
          <Input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'expiration
            </label>
            <Input
              type="text"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={(e) => handleExpiryDateChange(e.target.value)}
              className="w-full p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <Input
              type="text"
              placeholder="123"
              value={cardDetails.cvv}
              onChange={(e) => handleCvvChange(e.target.value)}
              className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              maxLength={4}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onGoBack} 
          className="flex-1 py-3 border hover:cursor-pointer hover:text-black text-black border-gray-300 hover:bg-gray-400"
        >
          Retour
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={!isValid}
          className="flex-1 py-3  bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold shadow-lg disabled:shadow-none"
        >
          💳 Payer
        </Button>
      </div>
    </div>
  )
}
