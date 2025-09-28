'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { CreditCard } from 'lucide-react'
import { KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'
import { formatPrice } from '@zyra/conf/lib/utils'

interface CardPaymentFormProps {
  amount: number
  currency: string
  packageName: string
  packageId: string
  billingPeriod: string
  userId?: string
  userEmail?: string
  userName?: string
  onSuccess: () => void
  onError: (error: string) => void
  onBack: () => void
  onAuthRequired: (data: any) => void
  korapayService: KoraPaymentService
}

interface CardData {
  name: string
  number: string
  cvv: string
  expiry_month: string
  expiry_year: string
  pin: string
}

export default function CardPaymentForm({
  amount,
  currency,
  packageName,
  packageId,
  billingPeriod,
  userId,
  userEmail,
  userName,
  onSuccess,
  onError,
  onBack,
  onAuthRequired,
  korapayService
}: CardPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cardData, setCardData] = useState<CardData>({
    name: '',
    number: '',
    cvv: '',
    expiry_month: '',
    expiry_year: '',
    pin: ''
  })

  const handleCardPayment = async () => {
    setIsLoading(true)
    try {
      // Valider les données de carte
      const validation = KoraPaymentService.validateCard(cardData)
      if (!validation.isValid) {
        onError(`Erreur de validation: ${validation.errors.join(', ')}`)
        setIsLoading(false)
        return
      }

      const reference = korapayService.generateReference('ZYRA')
      const paymentResult = await korapayService.chargeCard({
        reference,
        card: cardData,
        amount: amount * 100,
        currency,
        redirect_url: `${window.location.origin}/dashboard?payment=success`,
        customer: {
          name: userName || cardData.name,
          email: userEmail || 'guest@zyra.app'
        },
        metadata: {
          userId,
          packageId,
          billingPeriod,
          packageName
        }
      })

      if (paymentResult.data.status === 'success') {
        onSuccess()
      } else if (paymentResult.data.auth_model) {
        // Passer les données d'autorisation au composant parent
        onAuthRequired(paymentResult.data)
      } else {
        throw new Error(paymentResult.message || 'Erreur lors du paiement')
      }
    } catch (error: any) {
      console.error('Erreur paiement carte:', error)
      onError(error.message || 'Erreur lors du paiement par carte')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
    const matches = cleaned.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return cleaned
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Paiement par Carte
        </h4>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 border-gray-300"
        >
          ← Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Nom sur la carte
          </label>
          <Input
            placeholder="Entrez le nom sur la carte"
            value={cardData.name}
            onChange={(e) => setCardData({...cardData, name: e.target.value})}
            className="text-gray-900 bg-white border-gray-300 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Numéro de carte
          </label>
          <Input
            placeholder="1234 5678 9012 3456"
            value={cardData.number}
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value)
              setCardData({...cardData, number: formatted})
            }}
            maxLength={19}
            className="text-gray-900 bg-white border-gray-300 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Mois
            </label>
            <Input
              placeholder="MM"
              value={cardData.expiry_month}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                  setCardData({...cardData, expiry_month: value})
                }
              }}
              maxLength={2}
              className="text-gray-900 bg-white border-gray-300 placeholder-gray-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Année
            </label>
            <Input
              placeholder="AA"
              value={cardData.expiry_year}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
                setCardData({...cardData, expiry_year: value})
              }}
              maxLength={2}
              className="text-gray-900 bg-white border-gray-300 placeholder-gray-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              CVV
            </label>
            <Input
              placeholder="123"
              value={cardData.cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                setCardData({...cardData, cvv: value})
              }}
              maxLength={4}
              type="password"
              className="text-gray-900 bg-white border-gray-300 placeholder-gray-500"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            PIN (optionnel)
          </label>
          <Input
            placeholder="0000"
            value={cardData.pin}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
              setCardData({...cardData, pin: value})
            }}
            maxLength={4}
            type="password"
            className="text-gray-900 bg-white border-gray-300 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>
      </div>

      <Button
        onClick={handleCardPayment}
        disabled={isLoading || !cardData.name || !cardData.number || !cardData.cvv || !cardData.expiry_month || !cardData.expiry_year}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Traitement...' : `Payer ${formatPrice(amount, currency)}`}
      </Button>
      
      {/* Message d'aide pour carte */}
      <div className="text-xs text-gray-500 text-center mt-2">
        <p>💳 Carte de test : 5130000052131820 | CVV : 419 | 12/32</p>
      </div>
    </div>
  )
}
