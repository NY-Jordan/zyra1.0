'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Smartphone } from 'lucide-react'
import { ChargeResponse, KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'
import { formatPrice } from '@zyra/conf/lib/utils'

interface MobilePaymentFormProps {
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
  onProcessing: (data: ChargeResponse) => void
  korapayService: KoraPaymentService
}

interface MobileData {
  number: string
}

export default function MobilePaymentForm({
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
  onProcessing,
  korapayService
}: MobilePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [mobileData, setMobileData] = useState<MobileData>({
    number: ''
  })

  const handleMobilePayment = async () => {
    setIsLoading(true)
    try {
      // Valider le numéro de téléphone
      if (!KoraPaymentService.validatePhoneNumber(mobileData.number)) {
        onError('Numéro de téléphone invalide')
        setIsLoading(false)
        return
      }

      const reference = korapayService.generateReference('ZYRA')
      const paymentResult = await korapayService.chargeMobileMoney({
        reference,
        mobile_money: mobileData,
        amount: amount * 100,
        currency,
        description: `Abonnement ${packageName} - ${billingPeriod}`,
        notification_url: `${window.location.origin}/api/webhooks/korapay`,
        redirect_url: `${window.location.origin}/dashboard?payment=success`,
        merchant_bears_cost: true,
        customer: {
          name: userName || 'Utilisateur Zyra',
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
      } else if (paymentResult.data.status === 'processing') {
        onProcessing(paymentResult.data)
      } else {
        throw new Error(paymentResult.message || 'Erreur lors du paiement')
      }
    } catch (error: any) {
      console.error('Erreur paiement mobile:', error)
      onError(error.message || 'Erreur lors du paiement mobile')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Enlever tout sauf les chiffres et le +
    let cleaned = value.replace(/[^\d+]/g, '')
    
    // S'assurer que ça commence par +
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    
    return cleaned
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Mobile Money
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
            Numéro de téléphone
          </label>
          <Input
            placeholder="+225 XX XX XX XX XX"
            value={mobileData.number}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value)
              setMobileData({...mobileData, number: formatted})
            }}
            className="text-gray-900 bg-white border-gray-300 placeholder-gray-500"
            disabled={isLoading}
            type="tel"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format international requis (ex: +225123456789)
          </p>
        </div>
      </div>

      <Button
        onClick={handleMobilePayment}
        disabled={isLoading || !mobileData.number || mobileData.number.length < 10}
        className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Traitement...' : `Payer ${formatPrice(amount, currency)}`}
      </Button>
      
      {/* Message d'aide pour Mobile Money */}
      <div className="text-xs text-gray-500 text-center mt-2 space-y-1">
        <p>📱 Vous recevrez un SMS avec les instructions de paiement</p>
        <p>💡 Supporté: MTN, Orange, Moov Money</p>
      </div>
    </div>
  )
}
