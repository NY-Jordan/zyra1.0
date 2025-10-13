'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { CreditCard } from 'lucide-react'
import { ChargeResponse, KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'
import { formatPrice } from '@zyra/conf/lib/utils'
import { getCurrentConfig } from '@zyra/conf/lib/korapay-config'
import { useCardPayment } from '../../../hooks/useCardPayment'
import PaymentAlertModal, { createAlertData } from './PaymentAlertModal'

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
  onBack
}: CardPaymentFormProps) {
  const [cardData, setCardData] = useState<CardData>({
    name: '',
    number: '',
    cvv: '',
    expiry_month: '',
    expiry_year: '',
    pin: ''
  })

  // États pour la gestion des alertes
  const [alertData, setAlertData] = useState<any>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  // Initialiser le service Korapay
  const korapayService = new KoraPaymentService(getCurrentConfig())

  // Hook pour gérer les paiements par carte
  const cardPayment = useCardPayment({
    korapayService,
    callbacks: {
      onSuccess: () => {
        console.log('Card payment success')
        onSuccess()
      },
      onError: (error: string) => {
        console.error('Card payment error:', error)
        onError(error)
      },
      onProcessing: (data: ChargeResponse) => {
        console.log('Card payment processing:', data)
        setAlertData(createAlertData.processing(
          data.response_message || data.message || 'Votre paiement par carte est en cours de traitement...'
        ))
        setIsAlertOpen(true)
      },
      onPinRequired: (data: ChargeResponse) => {
        console.log('Card PIN required:', data)
        setAlertData(createAlertData.pinRequired(
          data.response_message || data.message || 'Entrez le PIN de votre carte',
          data.transaction_reference
        ))
        setIsAlertOpen(true)
      },
      onOtpRequired: (data: ChargeResponse) => {
        console.log('Card OTP required:', data)
        setAlertData(createAlertData.otpRequired(
          data.response_message || data.message || 'Entrez le code OTP reçu',
          data.transaction_reference,
          300
        ))
        setIsAlertOpen(true)
      },
      on3DSRedirect: (data: ChargeResponse) => {
        console.log('Card 3DS redirect:', data)
        if (data.authorization?.redirect_url) {
          setAlertData(createAlertData.redirect3DS(
            'Vous allez être redirigé pour la vérification 3D Secure',
            data.authorization.redirect_url,
            data.transaction_reference
          ))
          setIsAlertOpen(true)
          cardPayment.handle3DSRedirect(data.authorization.redirect_url)
        }
      }
    }
  })

  const handleCardPayment = async () => {
    try {
      // Valider les données de carte
      const validation = KoraPaymentService.validateCard(cardData)
      if (!validation.isValid) {
        onError(`Erreur de validation: ${validation.errors.join(', ')}`)
        return
      }

      // Utiliser le hook pour initier le paiement
      await cardPayment.initiateCardPayment({
        reference: korapayService.generateReference('ZYRA'),
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
    } catch (error: any) {
      console.error('Erreur paiement carte:', error)
      onError(error.message || 'Erreur lors du paiement par carte')
    }
  }

  // Gestionnaires pour les alertes
  const handleOtpSubmit = async (otp: string) => {
    try {
      await cardPayment.validateOtp(otp)
    } catch (error: any) {
      onError(error.message || 'Erreur lors de la validation OTP')
    }
  }

  const handlePinSubmit = async (pin: string) => {
    try {
      await cardPayment.validatePin(pin)
    } catch (error: any) {
      onError(error.message || 'Erreur lors de la validation PIN')
    }
  }

  const handleResendOtp = async () => {
    try {
      await cardPayment.resendOtp()
    } catch (error: any) {
      onError(error.message || 'Erreur lors du renvoi OTP')
    }
  }

  const handleCloseAlert = () => {
    setIsAlertOpen(false)
    setAlertData(null)
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
    <>
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
              disabled={cardPayment.isLoading}
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
              disabled={cardPayment.isLoading}
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
                disabled={cardPayment.isLoading}
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
                disabled={cardPayment.isLoading}
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
                disabled={cardPayment.isLoading}
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
              disabled={cardPayment.isLoading}
            />
          </div>
        </div>

        <Button
          onClick={handleCardPayment}
          disabled={cardPayment.isLoading || !cardData.name || !cardData.number || !cardData.cvv || !cardData.expiry_month || !cardData.expiry_year}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cardPayment.isLoading ? 'Traitement...' : `Payer ${formatPrice(amount, currency)}`}
        </Button>
        
        {/* Message d'aide pour carte */}
        <div className="text-xs text-gray-500 text-center mt-2">
          <p>💳 Carte de test : 5130000052131820 | CVV : 419 | 12/32</p>
        </div>
      </div>

      {/* Modal d'alerte pour les différents types de notifications */}
      <PaymentAlertModal
        isOpen={isAlertOpen}
        onClose={handleCloseAlert}
        alertData={alertData}
        onOtpSubmit={handleOtpSubmit}
        onPinSubmit={handlePinSubmit}
        onResendOtp={handleResendOtp}
      />
    </>
  )
}
